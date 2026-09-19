import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  Sliders, 
  ShieldAlert, 
  Layers, 
  Eye, 
  Split, 
  Crosshair, 
  Activity, 
  Sparkles, 
  Info, 
  ChevronRight, 
  ArrowRight, 
  Upload, 
  Download, 
  RefreshCw, 
  Zap, 
  Thermometer, 
  Gauge, 
  Maximize2,
  Wrench,
  DollarSign,
  FileCheck,
  Cpu,
  BarChart2
} from 'lucide-react';
import { NeuDetSample, NeuDetBoundingBox, NeuDetContributingFactor } from '../../../data/neuDetDataset';
import { neuDetAdapter, NeuDetFilter } from '../../../services/neuDetDatasetAdapter';
import { AimlBadge } from '../../common/AimlConceptExplainer';
import { HelpTooltip } from '../../common/HelpTooltip';

interface DefectDetectionStudioProps {
  onNavigateToSimulation: (stationId: string, parameters?: Record<string, number>) => void;
  onNavigateToRootCause?: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
  onOpenWorkerDispatch?: () => void;
}

export const DefectDetectionStudio: React.FC<DefectDetectionStudioProps> = ({
  onNavigateToSimulation,
  onNavigateToRootCause,
  onOpenAimlGuide,
  onOpenWorkerDispatch
}) => {
  // Load samples from adapter
  const [samples, setSamples] = useState<NeuDetSample[]>(() => neuDetAdapter.getAllSamples());
  
  // Selected sample (default to primary quality alert: Batch B-204 Scratch at Station 04)
  const [selectedSample, setSelectedSample] = useState<NeuDetSample>(() => neuDetAdapter.getPrimaryQualityAlertSample());
  
  // Normal reference sample for comparison
  const normalReference = useMemo(() => neuDetAdapter.getNormalReferenceSample(), [samples]);

  // Inspection Viewport display mode
  const [viewMode, setViewMode] = useState<'OVERLAY' | 'ORIGINAL' | 'COMPARE_SIDE_BY_SIDE' | 'DIFFERENCE_HEATMAP'>('OVERLAY');
  
  // Filter state
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI state for image loading error fallback
  const [imageError, setImageError] = useState<boolean>(false);
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [ingestJsonText, setIngestJsonText] = useState<string>('');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  // Filtered sample list
  const filteredSamples = useMemo(() => {
    const filter: NeuDetFilter = {
      defectClass: selectedClass,
      status: selectedStatus,
      batchId: selectedBatch,
      searchQuery: searchQuery
    };
    return neuDetAdapter.filterSamples(filter);
  }, [samples, selectedClass, selectedStatus, selectedBatch, searchQuery]);

  // Handle sample selection
  const handleSelectSample = (sample: NeuDetSample) => {
    setSelectedSample(sample);
    setImageError(false);
  };

  // Image source with fallback between local asset and GitHub raw
  const currentImageSrc = imageError ? selectedSample.remoteImageUrl : selectedSample.localImageUrl;

  // Handle custom JSON ingestion from organizer
  const handleIngestJson = () => {
    if (!ingestJsonText.trim()) return;
    const res = neuDetAdapter.ingestDatasetJson(ingestJsonText);
    if (res.success) {
      setIngestStatus(`Successfully ingested ${res.importedCount} samples into NEU-DET engine.`);
      setSamples(neuDetAdapter.getAllSamples());
      setTimeout(() => {
        setShowIngestModal(false);
        setIngestStatus(null);
        setIngestJsonText('');
      }, 1500);
    } else {
      setIngestStatus(`Error: ${res.error}`);
    }
  };

  return (
    <div id="fantom-defect-detection-studio" className="space-y-6">
      {/* 1. TOP QUALITY ALERT BANNER (Direct user-specified format) */}
      <div className={`p-5 rounded-2xl border shadow-md transition-all ${
        selectedSample.status === 'DEFECTIVE'
          ? 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-red-500/50 text-white'
          : selectedSample.status === 'UNCERTAIN'
          ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border-purple-500/50 text-white'
          : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/50 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase ${
                selectedSample.status === 'DEFECTIVE'
                  ? 'bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/40'
                  : selectedSample.status === 'UNCERTAIN'
                  ? 'bg-purple-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}>
                <AlertTriangle size={14} />
                QUALITY ALERT
              </span>
              <span className="text-xs font-mono text-slate-300">
                Machine: <strong className="text-white">{selectedSample.productionStationName}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-300">
                Batch: <strong className="text-amber-300">{selectedSample.batchId}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-300">
                Status: <strong className={selectedSample.status === 'DEFECTIVE' ? 'text-red-400' : selectedSample.status === 'UNCERTAIN' ? 'text-purple-400' : 'text-emerald-400'}>{selectedSample.status}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-300">
                Defect: <strong className="text-white underline decoration-red-400 decoration-2">{selectedSample.defectLabel}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-300">
                Confidence: <strong className="text-emerald-400">{(selectedSample.confidence * 100).toFixed(0)}%</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <p className="text-xs text-slate-300 font-sans max-w-3xl">
                {selectedSample.whyDetectedExplanation}
              </p>
              <AimlBadge termId="optical-localization" onOpenGuide={onOpenAimlGuide} />
              <AimlBadge termId="bayesian-confidence" onOpenGuide={onOpenAimlGuide} />
            </div>
          </div>

          {/* Quick Actions & Dataset Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowIngestModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5"
              title="Ingest organizer custom samples or external dataset JSON"
            >
              <Upload size={13} />
              <span>Dataset Adapter</span>
            </button>

            <button
              onClick={() => onNavigateToSimulation(selectedSample.productionStationId, selectedSample.recommendedSimulation.proposedParameters)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-[0.98]"
            >
              <Sliders size={13} />
              <span>Test in Simulation Lab</span>
            </button>
          </div>
        </div>

        {/* 7-Step Engineer Workflow Breadcrumb (Original Image → Detection Overlay → Defect Details → Process Investigation → Possible Contributing Factors → Business Impact → Recommended Simulation) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-slate-300 font-bold uppercase">Workflow:</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">1. Original Image</span>
          <ChevronRight size={12} className="text-slate-600 shrink-0" />
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">2. Detection Overlay</span>
          <ChevronRight size={12} className="text-slate-600 shrink-0" />
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">3. Defect Details</span>
          <ChevronRight size={12} className="text-slate-600 shrink-0" />
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">4. Process Investigation</span>
          <ChevronRight size={12} className="text-slate-600 shrink-0" />
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">5. Contributing Factors</span>
          <ChevronRight size={12} className="text-slate-600 shrink-0" />
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">6. Business Impact</span>
          <ChevronRight size={12} className="text-slate-600 shrink-0" />
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">7. Recommended Simulation</span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE: Visual Vision Bay & Process Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Inspection Stream & Sample Matrix (Cols 1-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  NEU-DET Steel Inspection Stream
                </h3>
                <p className="text-[11px] text-slate-500 font-sans">
                  Authentic 200×200 hot-rolled steel surface dataset
                </p>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-600">
                {filteredSamples.length} Samples
              </span>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Defect Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Classes (6)</option>
                  <option value="scratches">Scratches (Sc)</option>
                  <option value="patches">Patches (Pa)</option>
                  <option value="inclusion">Inclusion (In)</option>
                  <option value="crazing">Crazing (Cr)</option>
                  <option value="rolled-in_scale">Rolled-in Scale (RS)</option>
                  <option value="pitted_surface">Pitted Surface (PS)</option>
                  <option value="normal">Normal Reference</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DEFECTIVE">DEFECTIVE</option>
                  <option value="UNCERTAIN">UNCERTAIN</option>
                  <option value="NORMAL">NORMAL</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batch (B-204), station, defect..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sample List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredSamples.map((sample) => {
                const isSelected = selectedSample.id === sample.id;
                return (
                  <div
                    key={sample.id}
                    id={`neu-sample-${sample.sampleCode}`}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-600/20'
                        : sample.status === 'UNCERTAIN'
                        ? 'border-purple-200 bg-purple-50/40 hover:bg-purple-50/70'
                        : sample.status === 'DEFECTIVE'
                        ? 'border-red-200 bg-red-50/30 hover:bg-red-50/60'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-300 overflow-hidden shrink-0 relative">
                      <img 
                        src={sample.localImageUrl} 
                        alt={sample.defectLabel}
                        className="w-full h-full object-cover grayscale"
                        onError={(e) => {
                          // Fallback to remote github if local 404
                          (e.target as HTMLImageElement).src = sample.remoteImageUrl;
                        }}
                      />
                      {sample.boundingBoxes.length > 0 && (
                        <span className="absolute bottom-0 right-0 bg-red-600 text-white text-[9px] font-mono px-1 font-bold">
                          {sample.boundingBoxes.length}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-slate-900 truncate">
                          {sample.sampleCode}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          sample.status === 'DEFECTIVE'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : sample.status === 'UNCERTAIN'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {sample.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-medium truncate mt-0.5">
                        {sample.defectLabel}
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-500">
                        <span>Batch: <strong className="text-slate-800">{sample.batchId}</strong></span>
                        <span>Station: <strong className="text-slate-800">{sample.productionStationId}</strong></span>
                        <span className="text-emerald-700 font-bold">{(sample.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Vision Canvas, Evidence & Epistemology (Cols 5-12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Visual Inspection & AI Overlay Screen */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Control Bar: Toggle Modes */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-500">
                  Inspection Viewport:
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedSample.filename}
                </span>
                <span className="text-slate-400 text-xs">({selectedSample.width}×{selectedSample.height} px)</span>
              </div>

              {/* View Toggles */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
                <button
                  onClick={() => setViewMode('ORIGINAL')}
                  className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                    viewMode === 'ORIGINAL'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setViewMode('OVERLAY')}
                  className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1 ${
                    viewMode === 'OVERLAY'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Crosshair size={13} />
                  AI Detection Overlay
                </button>
                <button
                  onClick={() => setViewMode('COMPARE_SIDE_BY_SIDE')}
                  className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1 ${
                    viewMode === 'COMPARE_SIDE_BY_SIDE'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Split size={13} />
                  Compare with Normal
                </button>
              </div>
            </div>

            {/* Inspection Stage / Canvas Frame */}
            <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-inner flex flex-col md:flex-row items-center justify-center gap-6 relative overflow-hidden">
              
              {/* Background Technical Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Case 1: Single Viewport (Original or AI Overlay) */}
              {(viewMode === 'ORIGINAL' || viewMode === 'OVERLAY') && (
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center">
                  {/* Real Industrial Surface Image */}
                  <img
                    src={currentImageSrc}
                    alt={selectedSample.defectLabel}
                    className="w-full h-full object-contain grayscale select-none"
                    onError={() => setImageError(true)}
                  />

                  {/* AI Detection Overlay (When Mode is OVERLAY) */}
                  {viewMode === 'OVERLAY' && selectedSample.boundingBoxes.map((box: NeuDetBoundingBox) => {
                    // Normalize bounding box coordinates to percentage of 200x200
                    const leftPct = (box.xmin / selectedSample.width) * 100;
                    const topPct = (box.ymin / selectedSample.height) * 100;
                    const widthPct = ((box.xmax - box.xmin) / selectedSample.width) * 100;
                    const heightPct = ((box.ymax - box.ymin) / selectedSample.height) * 100;

                    return (
                      <div
                        key={box.id}
                        className="absolute border-2 border-red-500 bg-red-500/20 transition-all pointer-events-auto group"
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`
                        }}
                      >
                        {/* Corner Target Markers */}
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                        {/* Defect Tag Badge */}
                        <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1 font-bold z-20">
                          <span>{box.name}</span>
                          {box.confidence && <span>({(box.confidence * 100).toFixed(0)}%)</span>}
                        </div>

                        {/* Coordinate Overlay on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-0 bg-black/90 text-slate-200 text-[9px] font-mono p-1 rounded border border-slate-700 pointer-events-none z-30">
                          X:[{box.xmin}, {box.xmax}] Y:[{box.ymin}, {box.ymax}]
                        </div>
                      </div>
                    );
                  })}

                  {/* HUD Coordinate Crosshairs & Metadata */}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded border border-slate-800">
                    S04-AOI-CAM // RAW 200×200 // {viewMode}
                  </div>

                  {selectedSample.status === 'NORMAL' && (
                    <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>NO ANOMALIES DETECTED</span>
                    </div>
                  )}
                </div>
              )}

              {/* Case 2: Compare with Normal Sample Side-by-Side */}
              {viewMode === 'COMPARE_SIDE_BY_SIDE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Left: Defective Sample */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle size={13} />
                        Inspected ({selectedSample.defectLabel})
                      </span>
                      <span>{selectedSample.sampleCode}</span>
                    </div>
                    <div className="relative w-full h-72 rounded-xl bg-slate-900 border-2 border-red-500/60 overflow-hidden flex items-center justify-center">
                      <img
                        src={currentImageSrc}
                        alt="Defective sample"
                        className="w-full h-full object-contain grayscale"
                      />
                      {/* Overlay Box */}
                      {selectedSample.boundingBoxes.map((box: NeuDetBoundingBox) => (
                        <div
                          key={box.id}
                          className="absolute border-2 border-red-500 bg-red-500/25"
                          style={{
                            left: `${(box.xmin / selectedSample.width) * 100}%`,
                            top: `${(box.ymin / selectedSample.height) * 100}%`,
                            width: `${((box.xmax - box.xmin) / selectedSample.width) * 100}%`,
                            height: `${((box.ymax - box.ymin) / selectedSample.height) * 100}%`
                          }}
                        />
                      ))}
                      <div className="absolute bottom-2 left-2 bg-red-950/80 text-red-200 text-[10px] font-mono px-2 py-0.5 rounded border border-red-800">
                        Defect Area: {(selectedSample.boundingBoxes.reduce((acc: number, b: NeuDetBoundingBox) => acc + (b.xmax - b.xmin) * (b.ymax - b.ymin), 0) / 400).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Right: Golden Master Normal Reference */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        Normal Golden Reference
                      </span>
                      <span>NEU-NORM-001</span>
                    </div>
                    <div className="relative w-full h-72 rounded-xl bg-slate-900 border-2 border-emerald-500/60 overflow-hidden flex items-center justify-center">
                      <img
                        src={normalReference.localImageUrl}
                        alt="Normal reference steel"
                        className="w-full h-full object-contain grayscale"
                      />
                      <div className="absolute bottom-2 left-2 bg-emerald-950/80 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800">
                        Tolerance: ±1.2σ Baseline
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Side Metric Panel Beside Viewport */}
              <div className="w-full md:w-64 space-y-3 shrink-0">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-white font-mono space-y-2.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Detection Metrics
                  </div>

                  <div>
                    <div className="flex items-center text-slate-400 text-[10px]">
                      <span>Problem Found (Defect Classification)</span>
                      <HelpTooltip term="defect" className="ml-1" />
                    </div>
                    <strong className="text-sm text-slate-100 font-sans block">{selectedSample.defectLabel}</strong>
                  </div>

                  <div>
                    <div className="flex items-center text-slate-400 text-[10px]">
                      <span>How Sure the AI Is (Confidence Score)</span>
                      <HelpTooltip term="confidence" className="ml-1" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            selectedSample.confidence > 0.85 
                              ? 'bg-emerald-500' 
                              : selectedSample.confidence > 0.60 
                              ? 'bg-amber-500' 
                              : 'bg-purple-500'
                          }`}
                          style={{ width: `${selectedSample.confidence * 100}%` }}
                        />
                      </div>
                      <strong className="text-xs text-white">{(selectedSample.confidence * 100).toFixed(1)}%</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Bounding Box Geometry</span>
                    {selectedSample.boundingBoxes.length > 0 ? (
                      <div className="space-y-1 mt-1 text-[11px] text-slate-300">
                        {selectedSample.boundingBoxes.map((b: NeuDetBoundingBox, idx: number) => (
                          <div key={b.id} className="bg-slate-800/80 p-1.5 rounded text-[10px] border border-slate-700">
                            Box #{idx + 1}: X:[{b.xmin} → {b.xmax}] Y:[{b.ymin} → {b.ymax}]
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-400">Zero defect regions</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Batch:</span>
                      <strong className="text-slate-200">{selectedSample.batchId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Station:</span>
                      <strong className="text-slate-200">{selectedSample.productionStationId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Inspected At:</span>
                      <strong className="text-slate-200">{selectedSample.inspectionTimestamp.split(' ')[1]}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. "WHY WAS THIS DETECTED?" SECTION (Evidence used by the model) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles size={16} className="text-blue-600" />
                <h3 className="font-bold text-sm font-sans">Why was this detected? (Model Evidence)</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                NEU-DET Ground-Truth + YOLO Feature Analysis
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {selectedSample.whyDetectedExplanation}
            </p>

            {/* Evidence Checklist */}
            <div className="space-y-2 pt-1">
              {selectedSample.detectionEvidence.map((ev: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. INVESTIGATE PROCESS DATA (Connecting defect with batch, station, cycle time, downtime) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2 text-slate-900">
                <Activity size={16} className="text-amber-600" />
                <h3 className="font-bold text-sm font-sans">Investigate Process (Telemetry & Operational State)</h3>
              </div>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                Batch {selectedSample.batchId} Correlation
              </span>
            </div>

            {/* Process Parameter Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center text-[10px] text-slate-500 uppercase font-sans font-bold">
                  <span>Time Needed / Part (Cycle Time)</span>
                  <HelpTooltip term="cycleTime" className="ml-1" />
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <strong className={`text-base font-mono ${selectedSample.processTelemetry.cycleTimeSec > selectedSample.processTelemetry.nominalCycleSec ? 'text-amber-600' : 'text-slate-900'}`}>
                    {selectedSample.processTelemetry.cycleTimeSec}s
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">/ {selectedSample.processTelemetry.nominalCycleSec}s nom</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center text-[10px] text-slate-500 uppercase font-sans font-bold">
                  <span>Stopped Time (Downtime)</span>
                  <HelpTooltip term="downtime" className="ml-1" />
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <strong className={`text-base font-mono ${selectedSample.processTelemetry.stationDowntimeMinutes > 10 ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedSample.processTelemetry.stationDowntimeMinutes}m
                  </strong>
                  <span className="text-[10px] text-slate-400 font-sans">this shift</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Oil / Lubricant Flow</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <strong className={`text-base font-mono ${selectedSample.processTelemetry.lubricantFlowLpm < 22.0 ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                    {selectedSample.processTelemetry.lubricantFlowLpm} L/min
                  </strong>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {selectedSample.processTelemetry.lubricantFlowLpm < 22.0 ? '(LOW)' : '(OK)'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center text-[10px] text-slate-500 uppercase font-sans font-bold">
                  <span>Machine Shaking (Vibration)</span>
                  <HelpTooltip term="vibration" className="ml-1" />
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <strong className={`text-base font-mono ${selectedSample.processTelemetry.vibrationRmsMmSec > 4.5 ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                    {selectedSample.processTelemetry.vibrationRmsMmSec} mm/s
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">RMS</span>
                </div>
              </div>
            </div>

            {/* Additional Process Conditions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
              <div>Line Speed: <strong className="text-slate-900 font-mono">{selectedSample.processTelemetry.lineSpeedMpm} mpm</strong></div>
              <div>Roll Pressure: <strong className="text-slate-900 font-mono">{selectedSample.processTelemetry.rollPressureMpa} MPa</strong></div>
              <div>Roll Temp: <strong className={selectedSample.processTelemetry.rollTemperatureCelsius > 65 ? 'text-amber-600 font-mono' : 'text-slate-900 font-mono'}>{selectedSample.processTelemetry.rollTemperatureCelsius}°C</strong></div>
              <div>Material: <strong className="text-slate-900">{selectedSample.materialGrade.split(' ')[0]}</strong></div>
            </div>
          </div>

          {/* 5. EPISTEMOLOGICAL DISTINCTION: Observed Evidence vs Model Prediction vs Association vs Simulation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  How We Know This (Scientific Proof Levels)
                </h3>
              </div>
              <AimlBadge termId="causation-caveat" onOpenGuide={onOpenAimlGuide} />
            </div>

            {/* 4 Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Tier 1: Observed Evidence */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans uppercase font-bold text-blue-700">
                    1. Physical Evidence (What Sensors & Cameras Saw)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {selectedSample.epistemology.observedEvidence}
                </p>
              </div>

              {/* Tier 2: Model Prediction */}
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans uppercase font-bold text-purple-700">
                    2. AI Prediction (What the AI Detected)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {selectedSample.epistemology.modelPrediction}
                </p>
              </div>

              {/* Tier 3: Statistical Association */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans uppercase font-bold text-amber-700">
                    3. Pattern Found (Correlation — Not Proof)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {selectedSample.epistemology.statisticalAssociation}
                </p>
              </div>

              {/* Tier 4: Simulation Hypothesis */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans uppercase font-bold text-emerald-700">
                    4. Simulation (What Happens If We Test a Fix)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {selectedSample.epistemology.simulationHypothesis}
                </p>
              </div>
            </div>

            {/* Critical Non-Causal Caveat Callout */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 font-sans">
                <span className="font-bold uppercase text-[11px] block text-amber-900">
                  Important Warning: Pattern Is Not Proof
                </span>
                <span className="leading-relaxed">
                  {selectedSample.epistemology.causationCaveat}
                </span>
              </div>
            </div>
          </div>

          {/* 6. POSSIBLE CONTRIBUTING FACTORS & BUSINESS IMPACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Contributing Factors */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center text-xs font-sans font-bold uppercase tracking-wider text-slate-700">
                <Wrench size={14} className="text-slate-500 mr-1.5" />
                <span>Possible Reasons (Contributing Factors)</span>
                <HelpTooltip term="rootCause" className="ml-1" />
              </div>
              <div className="space-y-2">
                {selectedSample.possibleContributingFactors.map((cf: NeuDetContributingFactor, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">{cf.factor}</strong>
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-sans font-bold">
                        {cf.associationStrength}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans">{cf.observedEvidence}</p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                      Check: {cf.verificationStep}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Impact */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center text-xs font-sans font-bold uppercase tracking-wider text-slate-700 mb-2">
                  <DollarSign size={14} className="text-emerald-600 mr-1" />
                  <span>Money at Risk (Business Impact)</span>
                  <HelpTooltip term="scrap" className="ml-1" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <div className="flex items-center text-[10px] text-red-600 font-bold">
                      <span>Ruined Parts (Scrap)</span>
                      <HelpTooltip term="scrap" className="ml-1" />
                    </div>
                    <strong className="font-mono text-sm">${selectedSample.businessImpact.scrapCostPerCoilUsd.toLocaleString()} / coil</strong>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                    <div className="flex items-center text-[10px] text-amber-600 font-bold">
                      <span>Fix Cost (Rework)</span>
                      <HelpTooltip term="rework" className="ml-1" />
                    </div>
                    <strong className="font-mono text-sm">${selectedSample.businessImpact.reworkCostPerCoilUsd.toLocaleString()} / coil</strong>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {selectedSample.businessImpact.executiveSummary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-between gap-2">
                <span className={`text-[11px] font-sans font-bold px-2 py-1 rounded ${
                  selectedSample.businessImpact.batchHoldRecommended 
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedSample.businessImpact.batchHoldRecommended ? 'STOP SHIPMENT (Hold Batch)' : 'GOOD TO RUN (Normal)'}
                </span>

                <button
                  onClick={() => onNavigateToSimulation(selectedSample.productionStationId, selectedSample.recommendedSimulation.proposedParameters)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Test Fix (Simulate) &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ORGANIZER DATASET INGESTION ADAPTER */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base font-sans">
                  Organizer Dataset Ingestion Adapter
                </h3>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              If the organizer or external evaluation pipeline provides a custom NEU-DET subset or new image batch, paste the JSON array below. The engineer inspection portal adapts to any new ground-truth images and Pascal VOC annotations instantly.
            </p>

            <textarea
              value={ingestJsonText}
              onChange={(e) => setIngestJsonText(e.target.value)}
              placeholder={`[\n  {\n    "sampleCode": "NEU-CUSTOM-01",\n    "filename": "scratches_1.jpg",\n    "defectClass": "scratches",\n    "defectLabel": "Scratch",\n    "status": "DEFECTIVE",\n    "confidence": 0.94,\n    "batchId": "B-204",\n    "productionStationId": "S04",\n    "boundingBoxes": [{ "name": "scratches", "xmin": 26, "ymin": 12, "xmax": 43, "ymax": 171 }]\n  }\n]`}
              className="w-full h-44 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
            />

            {ingestStatus && (
              <div className="text-xs font-mono p-2.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                {ingestStatus}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const exported = neuDetAdapter.exportDatasetJson();
                  navigator.clipboard?.writeText(exported);
                  setIngestStatus('Current dataset JSON copied to clipboard!');
                }}
                className="text-xs font-mono text-slate-600 hover:text-slate-900 underline"
              >
                Export Current Dataset JSON
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIngestModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIngestJson}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold shadow-xs"
                >
                  Ingest & Load
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
