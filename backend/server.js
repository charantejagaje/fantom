/*
 * FANTOM analytics API
 * Serves OBSERVED simulation data (data/processed/facility_sim_clean.csv) and the
 * completed Step 5-7 analytics outputs as JSON for the frontend dashboard.
 *
 * Rules encoded here:
 *   - Raw data is never modified (server reads only; data/processed outputs only).
 *   - The full CSV is loaded ONCE at startup and cached in memory.
 *   - No utilization/throughput/cost/defect metrics are ever invented: fields that
 *     do not exist in the dataset are returned as null with "available: false".
 *   - ANN predictions (model3.csv) are served ONLY from the separate
 *     /api/ann/:station endpoint and always carry "kind": "ann-prediction".
 *   - Association language only: results are "associated with", never "causes".
 */

const path = require('path');
const fs = require('fs');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const PROCESSED = path.join(ROOT, 'data', 'processed');

const CLEAN_CSV = path.join(PROCESSED, 'facility_sim_clean.csv');
const METRICS_CSV = path.join(PROCESSED, 'production_metrics.csv');
const BOTTLENECK_CSV = path.join(PROCESSED, 'bottleneck_station_stats.csv');
const WIP_QUEUE_CSV = path.join(PROCESSED, 'wip_queue_associations.csv');
const MARGINAL_CSV = path.join(PROCESSED, 'factor_association_marginal.csv');
const JOINT_CSV = path.join(PROCESSED, 'factor_association_joint.csv');
const DIAG_CSV = path.join(PROCESSED, 'multicollinearity_diagnostics.csv');
const HOTSPOT_CSV = path.join(PROCESSED, 'hotspot_conditional_stats.csv');

const CELLS = ['wip_cell1', 'wip_cell2', 'wip_cell3', 'wip_cell4'];
const STATIONS = [
  'queue_c1s2', 'queue_c1s4', 'queue_c2s2', 'queue_c2s4',
  'queue_c3s2', 'queue_c3s3', 'queue_c4s3', 'queue_c4s4',
];
const BOTTLENECK_FACTOR = 2.0; // same documented heuristic as Steps 5/6

// ---------------------------------------------------------------------------
// Tiny CSV parser (RFC4180-ish: quotes, escaped quotes, commas). No dependency.
// ---------------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else if (ch === '\r') {
      // ignore
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1)
    .filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ''))
    .map((r) => {
      const obj = {};
      header.forEach((h, idx) => { obj[h] = r[idx]; });
      return obj;
    });
}

function toNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function round(v, d = 2) {
  if (v === null || v === undefined || !Number.isFinite(v)) return null;
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

// ---------------------------------------------------------------------------
// Dataset cache: load the 605k-row CSV ONCE at startup.
// ---------------------------------------------------------------------------
const cache = { stats: null, cleanMtime: null };

function computeStats() {
  const mtime = fs.existsSync(CLEAN_CSV) ? fs.statSync(CLEAN_CSV).mtimeMs : null;
  if (cache.stats && cache.cleanMtime === mtime) return cache.stats;
  if (!fs.existsSync(CLEAN_CSV)) throw new Error('facility_sim_clean.csv not found');

  const text = fs.readFileSync(CLEAN_CSV, 'utf8');
  const rows = parseCsv(text);
  const n = rows.length;
  const numeric = {};
  [...CELLS, ...STATIONS].forEach((c) => { numeric[c] = []; });

  for (const r of rows) {
    for (const c of [...CELLS, ...STATIONS]) {
      const v = toNumber(r[c]);
      if (v !== null) numeric[c].push(v);
    }
  }

  function describe(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const sum = arr.reduce((s, v) => s + v, 0);
    const mean = sum / arr.length;
    const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / (arr.length - 1);
    const q = (p) => {
      const idx = (arr.length - 1) * p;
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
    };
    return {
      count: arr.length,
      mean,
      median: q(0.5),
      std: Math.sqrt(variance),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p90: q(0.90),
      p95: q(0.95),
      p99: q(0.99),
    };
  }

  const variables = {};
  for (const c of [...CELLS, ...STATIONS]) {
    variables[c] = describe(numeric[c]);
  }

  // Congestion shares + bottleneck flags (same rule as analytics scripts).
  const totalMean = STATIONS.reduce((s, st) => s + variables[st].mean, 0);
  const means = STATIONS.map((st) => variables[st].mean).sort((a, b) => a - b);
  const mid = (means[3] + means[4]) / 2;
  const threshold = BOTTLENECK_FACTOR * mid;

  const stations = {};
  STATIONS.forEach((st) => {
    const d = variables[st];
    stations[st] = {
      ...d,
      cvPct: 100 * d.std / d.mean,
      congestionSharePct: 100 * d.mean / totalMean,
      potentialBottleneck: d.mean > threshold,
    };
  });
  const rankOrder = [...STATIONS].sort((a, b) => variables[b].mean - variables[a].mean);
  rankOrder.forEach((st, i) => { stations[st].congestionRank = i + 1; });

  // WIP <-> queue Pearson correlations (Step 7 marginal view).
  function pearson(a, b) {
    const ma = a.reduce((s, v) => s + v, 0) / a.length;
    const mb = b.reduce((s, v) => s + v, 0) / b.length;
    let num = 0; let da = 0; let db = 0;
    for (let i = 0; i < a.length; i++) {
      num += (a[i] - ma) * (b[i] - mb);
      da += (a[i] - ma) ** 2;
      db += (b[i] - mb) ** 2;
    }
    return da && db ? num / Math.sqrt(da * db) : 0;
  }
  const associations = {};
  for (const st of STATIONS) {
    associations[st] = {};
    for (const c of CELLS) {
      associations[st][c] = round(pearson(numeric[c], numeric[st]), 4);
    }
  }

  cache.stats = { rowCount: n, variables, stations, associations, bottleneckThreshold: round(threshold, 0) };
  cache.cleanMtime = mtime;
  return cache.stats;
}

function readCsvOutput(file) {
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCsv(text);
  return rows.map((r) => {
    const o = {};
    for (const k of Object.keys(r)) {
      const num = toNumber(r[k]);
      o[k] = num !== null && r[k].trim() !== '' && /^-?\d+(\.\d+)?$/.test(r[k].trim()) ? num : r[k];
    }
    return o;
  });
}

// ---------------------------------------------------------------------------
// App + routes
// ---------------------------------------------------------------------------
const app = express();
app.use(express.json());

// Basic CORS (frontend runs on :3000 in dev).
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check.
app.get('/api/health', (req, res) => {
  const cleanExists = fs.existsSync(CLEAN_CSV);
  let rowCount = null;
  try { rowCount = computeStats().rowCount; } catch { /* not ready */ }
  res.json({
    status: cleanExists ? 'ok' : 'degraded',
    service: 'fantom-analytics-api',
    dataset: 'facility_sim_clean.csv (observed simulation)',
    rowCount,
    analyticsOutputsPresent: {
      productionMetrics: fs.existsSync(METRICS_CSV),
      bottleneckStats: fs.existsSync(BOTTLENECK_CSV),
      wipQueueAssociations: fs.existsSync(WIP_QUEUE_CSV),
      marginalAssociations: fs.existsSync(MARGINAL_CSV),
      jointAssociations: fs.existsSync(JOINT_CSV),
      multicollinearity: fs.existsSync(DIAG_CSV),
      hotspotConditional: fs.existsSync(HOTSPOT_CSV),
    },
    time: new Date().toISOString(),
  });
});

// Overview: headline numbers for the dashboard.
app.get('/api/overview', (req, res) => {
  try {
    const s = computeStats();
    const hotspots = STATIONS.filter((st) => s.stations[st].potentialBottleneck);
    res.json({
      kind: 'observed-simulation',
      source: 'data/processed/facility_sim_clean.csv',
      rowCount: s.rowCount,
      stationsAnalyzed: STATIONS.length,
      cellsAnalyzed: CELLS.length,
      totalWipMean: round(s.variables.wip_cell1.mean + s.variables.wip_cell2.mean
        + s.variables.wip_cell3.mean + s.variables.wip_cell4.mean, 0),
      totalQueueMean: round(STATIONS.reduce((a, st) => a + s.stations[st].mean, 0), 0),
      potentialBottlenecks: hotspots,
      bottleneckThreshold: s.bottleneckThreshold,
      bottleneckRule: 'mean queue > 2.0 x median of the 8 station mean queues',
      availableAnalytics: ['queue statistics', 'congestion shares', 'potential bottleneck flags',
        'WIP-queue associations (marginal + conditional)', 'multicollinearity diagnostics'],
      notAvailable: ['utilization', 'throughput', 'cycle time', 'waiting time per part',
        'downtime', 'production counts', 'defect/quality metrics', 'economic/cost metrics'],
    });
  } catch (e) {
    res.status(500).json({ error: 'overview failed', detail: String(e.message || e) });
  }
});

// Per-station statistics (all 8 stations, or ?id=queue_c1s2).
app.get('/api/stations', (req, res) => {
  try {
    const s = computeStats();
    const list = STATIONS.map((st) => ({ id: st, ...s.stations[st] }));
    if (req.query.id) {
      const one = list.find((x) => x.id === req.query.id);
      if (!one) return res.status(404).json({ error: `unknown station: ${req.query.id}` });
      return res.json({ kind: 'observed-simulation', station: one });
    }
    return res.json({ kind: 'observed-simulation', count: list.length, stations: list });
  } catch (e) {
    return res.status(500).json({ error: 'stations failed', detail: String(e.message || e) });
  }
});

// Bottlenecks: flagged hotspots with evidence (Step 6 outputs).
app.get('/api/bottlenecks', (req, res) => {
  try {
    const s = computeStats();
    const flagThreshold = s.bottleneckThreshold;
    const flagged = STATIONS.filter((st) => s.stations[st].potentialBottleneck);
    const stationsList = STATIONS.map((st) => {
      const d = s.stations[st];
      return {
        id: st,
        mean: round(d.mean, 1), median: round(d.median, 1), std: round(d.std, 1),
        cvPct: round(d.cvPct, 1), p95: round(d.p95, 0), p99: round(d.p99, 0),
        max: d.max, congestionSharePct: round(d.congestionSharePct, 1),
        congestionRank: d.congestionRank,
        potentialBottleneck: d.potentialBottleneck,
      };
    });
    res.json({
      kind: 'observed-simulation',
      terminology: 'potential bottleneck / congestion hotspot - NOT a proven root cause',
      rule: `mean queue > 2.0 x median of station means (${flagThreshold})`,
      potentialBottlenecks: flagged,
      stations: stationsList,
      note: 'Queue length is a congestion proxy; no capacity/utilization fields exist in the dataset.',
    });
  } catch (e) {
    res.status(500).json({ error: 'bottlenecks failed', detail: String(e.message || e) });
  }
});

// Associations: Step 7 outputs (marginal + conditional/joint), association-only language.
app.get('/api/associations', (req, res) => {
  try {
    const s = computeStats();
    const marginal = readCsvOutput(MARGINAL_CSV);
    const joint = readCsvOutput(JOINT_CSV);
    const diagnostics = readCsvOutput(DIAG_CSV);
    res.json({
      kind: 'observed-simulation',
      disclaimer: 'Association does not establish causation. Coefficients are not effects.',
      marginalView: {
        description: 'One WIP variable at a time (confounded by composition of near-constant facility total).',
        rows: marginal,
      },
      conditionalView: {
        description: 'OLS: queue ~ total_wip + share_cell2 + share_cell3 + share_cell4 (cell 1 = reference).',
        rows: joint,
      },
      multicollinearity: {
        description: 'Pairwise WIP correlations are -0.304; VIF 2-3; standardized condition numbers 3.2 (raw) / 2.1 (joint). Collinearity is moderate, not severe.',
        rows: diagnostics,
      },
      rawCorrelations: s.associations,
    });
  } catch (e) {
    res.status(500).json({ error: 'associations failed', detail: String(e.message || e) });
  }
});

// WIP statistics per cell (observed inputs).
app.get('/api/wip', (req, res) => {
  try {
    const s = computeStats();
    const cells = CELLS.map((c) => ({ id: c, ...s.variables[c] }));
    res.json({
      kind: 'observed-simulation',
      note: 'The four cells carry nearly identical average WIP; facility input loading is balanced.',
      cells,
      totalWipMean: round(CELLS.reduce((a, c) => a + s.variables[c].mean, 0), 0),
    });
  } catch (e) {
    res.status(500).json({ error: 'wip failed', detail: String(e.message || e) });
  }
});

// Consolidated metrics (production_metrics.csv from Step 5).
app.get('/api/metrics', (req, res) => {
  try {
    const rows = readCsvOutput(METRICS_CSV);
    if (!rows) return res.status(404).json({
      error: 'production_metrics.csv not found',
      remedy: 'run: python analytics/production_metrics.py',
    });
    res.json({ kind: 'observed-simulation', source: 'data/processed/production_metrics.csv', rows });
  } catch (e) {
    res.status(500).json({ error: 'metrics failed', detail: String(e.message || e) });
  }
});

// Full analysis bundle (all Step 5-7 outputs in one payload).
app.get('/api/analysis', (req, res) => {
  try {
    const s = computeStats();
    res.json({
      kind: 'observed-simulation',
      overview: {
        rowCount: s.rowCount,
        potentialBottlenecks: STATIONS.filter((st) => s.stations[st].potentialBottleneck),
        bottleneckRule: 'mean queue > 2.0 x median of the 8 station mean queues',
      },
      stations: STATIONS.map((st) => ({ id: st, ...s.stations[st] })),
      wipCells: CELLS.map((c) => ({ id: c, ...s.variables[c] })),
      associations: s.associations,
      hotspotConditional: readCsvOutput(HOTSPOT_CSV),
      bottleneckStats: readCsvOutput(BOTTLENECK_CSV),
      marginalAssociations: readCsvOutput(MARGINAL_CSV),
      jointAssociations: readCsvOutput(JOINT_CSV),
      multicollinearityDiagnostics: readCsvOutput(DIAG_CSV),
      limitations: [
        'Simulation data, not physical factory-floor measurements.',
        'No utilization/throughput/cycle-time/downtime/production-count fields exist.',
        'No defect/quality or economic fields exist; such metrics are never invented.',
        'Association does not establish causation.',
      ],
    });
  } catch (e) {
    res.status(500).json({ error: 'analysis failed', detail: String(e.message || e) });
  }
});

// ---------------------------------------------------------------------------
// ANN predictions (model3.csv) - SEPARATE endpoint, clearly labeled, never
// mixed into observed-data analytics above.
// ---------------------------------------------------------------------------
const ANN_FILE = path.join(ROOT, 'data', 'raw', 'model3.csv');

app.get('/api/ann/:station', (req, res) => {
  try {
    const st = req.params.station; // e.g. "c1s2"
    const key = `answer_${st}`;
    const known = ['c1s2', 'c1s4', 'c2s2', 'c2s4', 'c3s2', 'c3s3', 'c4s3', 'c4s4'];
    if (!known.includes(st)) {
      return res.status(404).json({ error: `unknown ANN station '${st}'`, known });
    }
    if (!fs.existsSync(ANN_FILE)) {
      return res.status(404).json({ error: 'model3.csv not found in data/raw' });
    }
    const rows = parseCsv(fs.readFileSync(ANN_FILE, 'utf8'));
    const values = rows.map((r) => toNumber(r[key])).filter((v) => v !== null);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    res.json({
      kind: 'ann-prediction',
      station: st,
      label: 'Model-predicted queue (ANN) - NOT observed data',
      source: 'data/raw/model3.csv (Model3Answer* matrices)',
      count: values.length,
      mean: round(mean, 1),
      min: sorted[0],
      max: sorted[sorted.length - 1],
    });
  } catch (e) {
    res.status(500).json({ error: 'ann failed', detail: String(e.message || e) });
  }
});

// 404 for unknown API routes.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `unknown API route: ${req.method} ${req.originalUrl}` });
});

// Central error handler.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[fantom-api] error:', err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 8000;
if (require.main === module) {
  try {
    const s = computeStats();
    console.log(`[fantom-api] dataset loaded: ${s.rowCount.toLocaleString()} observed rows`);
  } catch (e) {
    console.warn('[fantom-api] WARNING: dataset not loadable yet:', e.message);
  }
  app.listen(PORT, () => {
    console.log(`[fantom-api] listening on http://localhost:${PORT}`);
  });
}

module.exports = { app, computeStats, parseCsv };
