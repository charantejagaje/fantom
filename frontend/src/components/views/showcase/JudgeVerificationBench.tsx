import React, { useCallback, useRef, useState } from 'react';
import {
  Upload,
  ScanSearch,
  BadgeCheck,
  FileImage,
  Info,
  Camera,
} from 'lucide-react';
import { NeuDetSample, NEU_DET_SAMPLES } from '../../../data/neuDetDataset';

/**
 * LIVE JUDGE VERIFICATION BENCH
 * Judges upload photos from the bundled NEU-DET dataset (or use quick-pick).
 * The bench performs deterministic, real checks on the actual uploaded
 * bytes/pixels - no ML model runs here and nothing is invented:
 *
 *   1. File integrity: the upload must decode as a real image.
 *   2. Pixel statistics computed from the upload: mean luminance, contrast
 *      (std dev), edge energy (mean gradient magnitude).
 *   3. Dataset match by exact filename against the bundled NEU-DET records
 *      (real ground truth: class label, status, Pascal VOC boxes).
 *   4. Numeric pixel difference (MAD, 0-255 scale) of the upload vs the
 *      bundled dataset image and vs the normal reference image.
 *
 * If a photo is NOT in the bundled dataset, it is not refused: the bench runs a
 * clearly-labeled HEURISTIC class screen - a nearest-template classifier over the
 * bundled NEU-DET reference images (2 per class, real pixel features, computed
 * live). Results are similarity screens, never verified identifications, and the
 * class's bundled YOLO annotation record is quoted as supporting evidence.
 * Association/causation language rules apply everywhere.
 * Software-only: no live camera feed is used anywhere in this system.
 */

interface BenchResult {
  key: string;
  name: string;
  sizeBytes: number;
  error?: string;
  width?: number;
  height?: number;
  meanLum?: number;
  contrast?: number;
  edge?: number;
  match?: NeuDetSample;
  diffDataset?: number;
  diffNormal?: number;
  classification?: Classification;
  objectUrl: string;
}

export interface Classification {
  topLabel: ClassKey;
  probs: { label: ClassKey; pct: number }[];
  marginPct: number;
  closestRefUrl: string;
  confident: boolean;
}

type Verdict = {
  chip: string;
  tone: 'ok' | 'warn' | 'fail' | 'cls' | 'neutral';
  note: string;
};

function verdictFor(r: BenchResult): Verdict {
  if (r.error) {
    return { chip: 'INTEGRITY FAIL', tone: 'fail', note: 'The file could not be decoded as an image.' };
  }
  if (r.match && typeof r.diffDataset === 'number' && typeof r.diffNormal === 'number') {
    // (ground-truth path - handled below)
    if (r.diffDataset <= r.diffNormal) {
      return {
        chip: 'VERIFIED - DATASET MATCH',
        tone: 'ok',
        note: "Uploaded pixels are numerically closer to this sample's dataset image than to the normal reference.",
      };
    }
    return {
      chip: 'MATCHED WITH WARNING',
      tone: 'warn',
      note: 'Filename matches a dataset record but the pixel signature deviates from the bundled image.',
    };
  }
  if (r.classification) {
    const c = r.classification;
    if (c.confident) {
      return {
        chip: `CLASS SCREEN: ${CLASS_LABELS[c.topLabel].toUpperCase()}`,
        tone: 'cls',
        note: 'Nearest-template screen over the bundled reference images. A heuristic indicator - not the YOLO model and not a verified identification.',
      };
    }
    return {
      chip: 'CLASS SCREEN UNCERTAIN',
      tone: 'warn',
      note: 'No single class dominates the screen - top candidates below; treat as ambiguous.',
    };
  }
  return {
    chip: 'FILE VERIFIED - NO DATASET MATCH',
    tone: 'neutral',
    note: 'Decodes correctly, but no bundled reference images were available to screen this photo.',
  };
}

const TONE_CLASS: Record<Verdict['tone'], string> = {
  ok: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  warn: 'bg-amber-100 text-amber-800 border-amber-300',
  fail: 'bg-red-100 text-red-800 border-red-300',
  cls: 'bg-blue-100 text-blue-800 border-blue-300',
  neutral: 'bg-slate-100 text-slate-700 border-slate-300',
};

/* ---------- real pixel math (all computed, nothing hardcoded) ---------- */

function toGray(
  src: ImageBitmap | HTMLImageElement,
  maxDim: number
): { w: number; h: number; gray: Float32Array } {
  const scale = Math.min(1, maxDim / Math.max(src.width, src.height));
  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(src as CanvasImageSource, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  }
  return { w, h, gray };
}

function pixelStats(g: { w: number; h: number; gray: Float32Array }) {
  const n = g.gray.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += g.gray[i];
  const mean = sum / n;
  let varSum = 0;
  for (let i = 0; i < n; i++) varSum += (g.gray[i] - mean) ** 2;
  const std = Math.sqrt(varSum / n);
  // Edge energy: mean absolute first-order gradient (x and y directions).
  let edgeSum = 0;
  let edgeCount = 0;
  for (let y = 0; y < g.h - 1; y++) {
    for (let x = 0; x < g.w - 1; x++) {
      const i = y * g.w + x;
      edgeSum += Math.abs(g.gray[i + 1] - g.gray[i]) + Math.abs(g.gray[i + g.w] - g.gray[i]);
      edgeCount += 2;
    }
  }
  return { mean, std, edge: edgeCount ? edgeSum / edgeCount : 0 };
}

function meanAbsDiff(
  a: { w: number; h: number; gray: Float32Array },
  b: { w: number; h: number; gray: Float32Array }
): number {
  const w = Math.min(a.w, b.w);
  const h = Math.min(a.h, b.h);
  let sum = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      sum += Math.abs(a.gray[y * a.w + x] - b.gray[y * b.w + x]);
    }
  }
  return sum / (w * h);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error(`failed to load ${url}`));
    im.src = url;
  });
}

/* ---------- heuristic class screen (nearest-template over bundled refs) ---------- */

type ClassKey = 'scratches' | 'patches' | 'inclusion' | 'crazing' | 'rolled-in_scale' | 'pitted_surface' | 'normal';

const CLASS_LABELS: Record<ClassKey, string> = {
  scratches: 'Scratch',
  patches: 'Patch',
  inclusion: 'Inclusion',
  crazing: 'Crazing',
  'rolled-in_scale': 'Rolled-in Scale',
  pitted_surface: 'Pitted Surface',
  normal: 'Normal',
};

// Two bundled reference images per class (the *_2 variants exist on disk too).
const REF_LIBRARY: { label: ClassKey; url: string }[] = [
  { label: 'scratches', url: '/assets/neu_det/scratches_1.jpg' },
  { label: 'scratches', url: '/assets/neu_det/scratches_2.jpg' },
  { label: 'patches', url: '/assets/neu_det/patches_1.jpg' },
  { label: 'patches', url: '/assets/neu_det/patches_2.jpg' },
  { label: 'inclusion', url: '/assets/neu_det/inclusion_1.jpg' },
  { label: 'inclusion', url: '/assets/neu_det/inclusion_2.jpg' },
  { label: 'crazing', url: '/assets/neu_det/crazing_1.jpg' },
  { label: 'crazing', url: '/assets/neu_det/crazing_2.jpg' },
  { label: 'rolled-in_scale', url: '/assets/neu_det/rolled-in_scale_1.jpg' },
  { label: 'rolled-in_scale', url: '/assets/neu_det/rolled-in_scale_2.jpg' },
  { label: 'pitted_surface', url: '/assets/neu_det/pitted_surface_1.jpg' },
  { label: 'pitted_surface', url: '/assets/neu_det/pitted_surface_2.jpg' },
  { label: 'normal', url: '/assets/neu_det/normal_reference_1.jpg' },
];

const FEATURE_KEYS = ['lum', 'con', 'edge', 'dirv', 'dark', 'bright', 'lap'] as const;

/** 7 real texture features computed from the grayscale buffer - all measured, none invented. */
function features(g: { w: number; h: number; gray: Float32Array }): number[] {
  const n = g.gray.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += g.gray[i];
  const mean = sum / n;
  let varSum = 0;
  for (let i = 0; i < n; i++) varSum += (g.gray[i] - mean) ** 2;
  const std = Math.sqrt(varSum / n);
  let edgeSum = 0, edgeCount = 0, dirV = 0, dirH = 0, dark = 0, bright = 0, lap = 0;
  for (let y = 0; y < g.h - 1; y++) {
    for (let x = 0; x < g.w - 1; x++) {
      const i = y * g.w + x;
      const gx = Math.abs(g.gray[i + 1] - g.gray[i]);
      const gy = Math.abs(g.gray[i + g.w] - g.gray[i]);
      edgeSum += gx + gy;
      edgeCount += 2;
      dirV += gy;
      dirH += gx;
      if (y > 0 && x > 0 && y < g.h - 1 && x < g.w - 1) {
        lap += Math.abs(4 * g.gray[i] - g.gray[i - 1] - g.gray[i + 1] - g.gray[i - g.w] - g.gray[i + g.w]);
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (g.gray[i] < 60) dark++;
    if (g.gray[i] > 200) bright++;
  }
  const dirTotal = dirV + dirH || 1;
  return [
    mean,
    std,
    edgeCount ? edgeSum / edgeCount : 0,
    dirV / dirTotal, // vertical-vs-horizontal edge directionality (scratches are directional)
    dark / n,
    bright / n,
    lap / Math.max(1, n),
  ];
}

/** Nearest-template screen: standardized L1 distance to per-class reference means,
 *  converted to similarity percentages. Clearly a heuristic, not the YOLO model. */
async function classifyUpload(g: { w: number; h: number; gray: Float32Array }): Promise<Classification | undefined> {
  try {
    const fu = features(g);
    const refs: { label: ClassKey; url: string; f: number[] }[] = [];
    for (const r of REF_LIBRARY) {
      const img = await loadImage(r.url);
      refs.push({ label: r.label, url: r.url, f: features(toGray(img, 128)) });
    }
    const all = [fu, ...refs.map((r) => r.f)];
    const std = FEATURE_KEYS.map((_, j) => {
      const col = all.map((a) => a[j]);
      const m = col.reduce((a, b) => a + b, 0) / col.length;
      const sd = Math.sqrt(col.reduce((a, b) => a + (b - m) ** 2, 0) / col.length) || 1;
      return { m, sd };
    });
    const zu = fu.map((v, j) => (v - std[j].m) / std[j].sd);
    const byClass = new Map<ClassKey, number[][]>();
    refs.forEach((r) => {
      const z = r.f.map((v, j) => (v - std[j].m) / std[j].sd);
      if (!byClass.has(r.label)) byClass.set(r.label, []);
      byClass.get(r.label)!.push(z);
    });
    const dists = Array.from(byClass.entries()).map(([label, arrs]) => {
      const cm = FEATURE_KEYS.map((_, j) => arrs.reduce((a, arr) => a + arr[j], 0) / arrs.length);
      const d = FEATURE_KEYS.reduce((a, _, j) => a + Math.abs(zu[j] - cm[j]), 0) / FEATURE_KEYS.length;
      return { label, d };
    }).sort((a, b) => a.d - b.d);
    const tau = 0.35;
    const exps = dists.map((d) => Math.exp(-d.d / tau));
    const sum = exps.reduce((a, b) => a + b, 0) || 1;
    const probs = dists.map((d, i) => ({ label: d.label, pct: (100 * exps[i]) / sum })).sort((a, b) => b.pct - a.pct);
    const topRefs = refs.filter((r) => r.label === probs[0].label);
    return {
      topLabel: probs[0].label,
      probs,
      marginPct: probs[0].pct - probs[1].pct,
      closestRefUrl: topRefs[0]?.url ?? '',
      confident: probs[0].pct - probs[1].pct >= 8,
    };
  } catch {
    return undefined;
  }
}

/* ------------------------------- component ------------------------------ */

export const JudgeVerificationBench: React.FC = () => {
  const [results, setResults] = useState<BenchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyze = useCallback(async (file: File): Promise<BenchResult> => {
    const base: BenchResult = {
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      sizeBytes: file.size,
      objectUrl: URL.createObjectURL(file),
    };
    try {
      const bitmap = await createImageBitmap(file);
      const bitmapWidth = bitmap.width;
      const bitmapHeight = bitmap.height;
      const stats = pixelStats(toGray(bitmap, 256));
      const name = file.name.toLowerCase();
      const match = NEU_DET_SAMPLES.find((s) => s.filename.toLowerCase() === name);
      let diffDataset: number | undefined;
      let diffNormal: number | undefined;
      if (match) {
        const uploadGray = toGray(bitmap, 64);
        try {
          const dsImg = await loadImage(match.localImageUrl);
          diffDataset = meanAbsDiff(uploadGray, toGray(dsImg, 64));
        } catch { /* dataset image unavailable - skip comparison */ }
        try {
          const normImg = await loadImage(match.normalReferenceUrl);
          diffNormal = meanAbsDiff(uploadGray, toGray(normImg, 64));
        } catch { /* normal reference unavailable - skip comparison */ }
      }
      // Heuristic class screen runs for EVERY upload (also filename-matched ones).
      const classification = await classifyUpload(toGray(bitmap, 128));
      bitmap.close?.();
      return {
        ...base,
        width: bitmapWidth,
        height: bitmapHeight,
        meanLum: stats.mean,
        contrast: stats.std,
        edge: stats.edge,
        match,
        diffDataset,
        diffNormal,
        classification,
      };
    } catch (e) {
      return { ...base, error: String((e as Error)?.message || e) };
    }
  }, []);

  const onFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const out: BenchResult[] = [];
    for (const f of Array.from(files)) out.push(await analyze(f));
    setResults((prev) => [...out, ...prev]);
    setBusy(false);
  }, [analyze]);

  const quickPick = useCallback(async (sample: NeuDetSample) => {
    try {
      setBusy(true);
      const res = await fetch(sample.localImageUrl);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: blob.type || 'image/jpeg' });
      const r = await analyze(file);
      setResults((prev) => [r, ...prev]);
    } catch (e) {
      console.warn('quick-pick failed', e);
    } finally {
      setBusy(false);
    }
  }, [analyze]);

  return (
    <section className="space-y-4">
      {/* upload zone + explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ScanSearch size={16} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Live Judge Verification Bench - check any dataset photo on stage
            </h3>
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            <Upload size={22} className="mx-auto text-slate-400" />
            <p className="text-xs font-sans text-slate-600 mt-2 font-semibold">
              Drag dataset photos here, or click to browse (jpg/png - multiple files supported)
            </p>
            <p className="text-[11px] text-slate-500 font-sans mt-1">
              Checks run in-browser on the real uploaded pixels - deterministic, reproducible, no internet needed.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-sans text-slate-500 font-semibold">
              Quick-pick from the bundled dataset:
            </span>
            <button
              onClick={() => quickPick(NEU_DET_SAMPLES[0])}
              className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800"
            >
              Scratch sample
            </button>
            <button
              onClick={() => quickPick(NEU_DET_SAMPLES[7])}
              className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-300"
            >
              Normal reference
            </button>
            {busy && <span className="text-[11px] font-mono text-blue-600">analyzing...</span>}
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">What the bench checks (all real, computed live)</h4>
          </div>
          <ul className="space-y-1.5">
            {[
              'File integrity - the upload must decode as a genuine image',
              'Pixel statistics computed from the upload: mean luminance, contrast, edge energy',
              'Filename match against the bundled NEU-DET ground truth (label, status, Pascal VOC boxes)',
              'Numeric pixel difference (MAD) vs the dataset image and vs the normal reference',
            ].map((t) => (
              <li key={t} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-relaxed">
                <BadgeCheck size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
            No YOLO/ML inference is claimed here: model-evidence screens live in the NEU-DET Studio. For photos
            not in the bundled records, this bench runs a clearly-labeled heuristic class screen (nearest-template
            over the bundled reference images) - an indicator, never a verified identification.
          </p>
          <p className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
            <Camera size={10} /> Software-only: no live camera feed is used anywhere in this system.
          </p>
        </div>
      </div>

      {/* results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => {
            const v = verdictFor(r);
            return (
              <div key={r.key} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-start gap-4">
                  <img
                    src={r.objectUrl}
                    alt={r.name}
                    className="w-24 h-24 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold font-mono ${TONE_CLASS[v.tone]}`}>
                        {v.chip}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <FileImage size={11} /> {r.name} · {(r.sizeBytes / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {r.error ? (
                      <p className="text-[11px] text-red-600 font-sans">{v.note}</p>
                    ) : (
                      <>
                        <p className="text-[11px] text-slate-600 font-sans">{v.note}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Stat label="Resolution" value={r.width && r.height ? `${r.width}×${r.height}` : '...'} />
                          <Stat label="Mean luminance" value={fmt1(r.meanLum)} />
                          <Stat label="Contrast (std)" value={fmt1(r.contrast)} />
                          <Stat label="Edge energy" value={fmt1(r.edge)} />
                        </div>
                        {r.match && typeof r.diffDataset === 'number' && typeof r.diffNormal === 'number' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Stat label={`MAD vs dataset (${r.match.filename})`} value={fmt1(r.diffDataset)} />
                            <Stat label="MAD vs normal reference" value={fmt1(r.diffNormal)} />
                          </div>
                        )}
                        {r.classification && (
                          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className="text-[11px] font-sans font-bold text-slate-700">
                                Heuristic class screen (computed live, not the YOLO model):
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                margin {r.classification.marginPct.toFixed(1)} pts
                              </span>
                            </div>
                            <div className="space-y-1">
                              {r.classification.probs.slice(0, 3).map((p) => (
                                <div key={p.label} className="flex items-center gap-2">
                                  <span className="w-28 shrink-0 text-[10px] font-mono text-slate-600">
                                    {CLASS_LABELS[p.label]}
                                  </span>
                                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${p.label === r.classification!.topLabel ? 'bg-blue-600' : 'bg-slate-400'}`}
                                      style={{ width: `${Math.max(2, p.pct)}%` }}
                                    />
                                  </div>
                                  <span className="w-10 text-right text-[10px] font-mono text-slate-600">
                                    {p.pct.toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              {r.classification.closestRefUrl && (
                                <img
                                  src={r.classification.closestRefUrl}
                                  alt="closest reference"
                                  className="w-10 h-10 object-cover rounded border border-slate-300"
                                />
                              )}
                              <span className="text-[10px] text-slate-500 font-sans">
                                Closest bundled reference for the top class shown left. A similarity screen over texture
                                features - never a verified identification, and never a causal explanation.
                              </span>
                            </div>
                            {r.match && (
                              <div className="text-[10px] text-slate-500 font-sans">
                                YOLO annotation record for this class exists in the bundled dataset (see NEU-DET Studio).
                              </div>
                            )}
                          </div>
                        )}
                        {r.match && (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] font-sans text-slate-700 space-y-1">
                            <div className="font-bold">Ground truth (bundled NEU-DET record):</div>
                            <div>
                              Class: <strong>{r.match.defectLabel}</strong> · Status:{' '}
                              <strong>{r.match.status}</strong> · Boxes: {r.match.boundingBoxes.length} · Batch{' '}
                              {r.match.batchId} · {r.match.materialGrade}
                            </div>
                            {r.match.boundingBoxes.length > 0 && (
                              <div className="font-mono text-[10px] text-slate-500">
                                {r.match.boundingBoxes
                                  .map((b) => `(${b.xmin},${b.ymin})-(${b.xmax},${b.ymax})`)
                                  .join('  ')}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500">
                              Statistical associations mentioned elsewhere are associations only - not proven causation.
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
      <div className="text-[9px] font-sans uppercase text-slate-500 font-semibold">{label}</div>
      <div className="text-xs font-mono font-bold text-slate-900">{value}</div>
    </div>
  );
}

function fmt1(v?: number): string {
  return typeof v === 'number' ? v.toFixed(1) : '...';
}
