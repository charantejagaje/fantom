import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldAlert, 
  Eye, 
  ExternalLink,
  Layers,
  Sparkles,
  Activity
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';
import { StreamSpeed } from '../../../types/simulatedPlant';

interface LiveInspectionStreamBannerProps {
  onOpenDefectVision?: () => void;
  onOpenAIIntervention?: () => void;
}

export const LiveInspectionStreamBanner: React.FC<LiveInspectionStreamBannerProps> = ({
  onOpenDefectVision,
  onOpenAIIntervention
}) => {
  const {
    streamStatus,
    streamSpeed,
    currentInspectionIndex,
    currentInspection,
    streamInspectionQueue,
    rollingStats,
    startStream,
    pauseStream,
    setStreamSpeed,
    nextInspection,
    selectInspection,
    resetDemo,
    openCrackWorkflow,
    acknowledgeAndSimulateStop
  } = useSimulatedPlantStore();

  const isPlaying = streamStatus === 'RUNNING';
  const totalInQueue = streamInspectionQueue.length;
  const progressPct = Math.round(((currentInspectionIndex + 1) / totalInQueue) * 100);

  // Next 4 upcoming events in sequence
  const upcomingQueue = [1, 2, 3, 4].map((offset) => {
    const idx = (currentInspectionIndex + offset) % totalInQueue;
    return { event: streamInspectionQueue[idx], index: idx };
  });

  const getResultBadge = () => {
    if (currentInspection.result === 'CRACK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500 text-white shadow-sm animate-pulse">
          <AlertOctagon size={13} />
          <span>CRACK DETECTED</span>
        </span>
      );
    }
    if (currentInspection.result === 'DEFECT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-white shadow-sm">
          <AlertTriangle size={13} />
          <span>DEFECT: {currentInspection.defect_type.toUpperCase()}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white shadow-sm">
        <CheckCircle2 size={13} />
        <span>PASSED (GOOD)</span>
      </span>
    );
  };

  const getSeverityBadge = () => {
    switch (currentInspection.severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">WARNING</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">WATCH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">NOMINAL</span>;
    }
  };

  return (
    <div 
      id="live-inspection-stream-banner-container"
      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 transition-all"
    >
      {/* 1. Header Bar: Status, Sequence Counter & Stream Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        {/* Stream Identity & Sequence */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="font-mono text-xs font-black tracking-tight text-slate-900">
              SIMULATED OPTICAL INSPECTION STREAM
            </span>
          </div>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
              Inspection #{String(currentInspection.sequenceNumber).padStart(3, '0')} / #{String(totalInQueue).padStart(3, '0')}
            </span>
            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
              <div 
                className={`h-full transition-all duration-500 ${rollingStats.stopRecommended ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <span className="hidden lg:inline text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            NEU-DET Benchmark Surface Optical Dataset
          </span>
        </div>

        {/* Playback Controls & Speed Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Play / Pause */}
          <button
            id="stream-btn-toggle-play"
            onClick={() => (isPlaying ? pauseStream() : startStream())}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-colors shadow-2xs ${
              isPlaying
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
            <span>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
          </button>

          {/* Step forward */}
          <button
            id="stream-btn-next-step"
            onClick={nextInspection}
            title="Step to next inspection frame"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold border border-slate-200 transition-colors"
          >
            <SkipForward size={13} />
            <span className="hidden sm:inline">NEXT</span>
          </button>

          {/* Speed Buttons */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-mono">
            {(['SLOW', 'NORMAL', 'FAST'] as StreamSpeed[]).map((speed) => (
              <button
                key={speed}
                onClick={() => setStreamSpeed(speed)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  streamSpeed === speed
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {speed === 'SLOW' ? '5s' : speed === 'NORMAL' ? '3s' : '1.2s'}
              </button>
            ))}
          </div>

          {/* Reset Demo Button */}
          <button
            id="stream-btn-reset-demo"
            onClick={resetDemo}
            title="Reset inspection sequence to Frame #001"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-mono text-xs font-bold transition-colors"
          >
            <RotateCcw size={13} />
            <span>RESET DEMO</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Body: Current Inspection Live Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Col: Inspection Image Thumbnail & Zoom */}
        <div className="lg:col-span-3 flex flex-col items-center sm:flex-row lg:flex-col gap-3">
          <div className="relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-950 group">
            <img 
              src={currentInspection.image} 
              alt={currentInspection.defect_type} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay tag */}
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
              {currentInspection.datasetDefectClass.toUpperCase()}
            </div>

            {/* Bounding box indicator if defect */}
            {currentInspection.result !== 'GOOD' && (
              <div className="absolute inset-4 border-2 border-dashed border-rose-500 rounded bg-rose-500/10 pointer-events-none animate-pulse">
                <span className="absolute -top-3 left-1 bg-rose-600 text-white text-[9px] font-mono px-1 rounded">
                  AI DEFECT ROI
                </span>
              </div>
            )}

            <button
              onClick={() => openCrackWorkflow()}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/75 text-white hover:bg-black transition-colors opacity-90 group-hover:opacity-100"
              title="Inspect Full Resolution"
            >
              <Eye size={13} />
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 text-center sm:text-left lg:text-center">
            Source: <strong className="text-slate-800">NEU-DET Benchmark</strong> (200×200 Steel Surface)
          </div>
        </div>

        {/* Center Col: Telemetry Grid & Diagnostic Findings */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Result & Severity */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {getResultBadge()}
            {getSeverityBadge()}
            <span className="font-mono text-xs text-slate-500">
              Confidence: <strong className="text-slate-900">{currentInspection.confidence}%</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-xs text-slate-500">
              Time: <strong className="text-slate-900">{currentInspection.timestamp}</strong>
            </span>
          </div>

          {/* Plant Location Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Batch</span>
              <strong className="text-slate-800 font-bold">{currentInspection.batch_id}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Line</span>
              <strong className="text-slate-800 font-bold">{currentInspection.line_id}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Station</span>
              <strong className="text-slate-800 font-bold truncate block">{currentInspection.station}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Component</span>
              <strong className="text-slate-800 font-bold truncate block">{currentInspection.component}</strong>
            </div>
          </div>

          {/* Visual Evidence Finding */}
          <div className="bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-mono font-bold mb-1">
              <Sparkles size={13} className="text-indigo-600" />
              <span>AI Visual Evidence & Diagnostic Finding:</span>
            </div>
            <p className="text-slate-800 font-sans text-xs leading-relaxed">
              {currentInspection.evidence[0] || 'Nominal smooth surface finish. No micro-cracks or inclusions detected.'}
            </p>
            {currentInspection.possible_causes.length > 0 && (
              <p className="text-slate-500 font-sans text-[11px] mt-1">
                <strong>Possible Cause:</strong> {currentInspection.possible_causes[0]}
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions & Production Safety Recommendation */}
        <div className="lg:col-span-3 flex flex-col gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              AI ADVISORY ACTION
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              SIMULATED
            </span>
          </div>

          <p className="text-xs font-sans text-slate-700 leading-snug">
            {currentInspection.recommended_action}
          </p>

          <div className="flex flex-col gap-1.5 mt-1">
            {/* If crack or stop recommended, prominent stop button */}
            {rollingStats.stopRecommended ? (
              <button
                id="btn-stream-quick-stop"
                onClick={() => acknowledgeAndSimulateStop(currentInspection.batch_id)}
                className="w-full px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                <AlertOctagon size={14} />
                <span>ACKNOWLEDGE & SIMULATE STOP</span>
              </button>
            ) : null}

            {onOpenAIIntervention && (
              <button
                onClick={onOpenAIIntervention}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>Open in AI Intervention</span>
              </button>
            )}

            {onOpenDefectVision && (
              <button
                onClick={onOpenDefectVision}
                className="w-full px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Eye size={13} className="text-blue-500" />
                <span>Examine in Defect Vision</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Footer Strip: Rolling 20-Frame Stats & Upcoming Stream Queue */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Rolling Window Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Activity size={13} className="text-indigo-600" />
            <span className="text-slate-400">Rolling Window (20 frames):</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Good: <strong>{rollingStats.goodCount}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Defects: <strong>{rollingStats.defectCount}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded ${rollingStats.crackCount > 0 ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold' : 'bg-slate-100 text-slate-600'}`}>
              Cracks: <strong>{rollingStats.crackCount}</strong>
            </span>
            <span className="text-slate-400">
              Defect Rate: <strong className={rollingStats.defectRatePct > 15 ? 'text-rose-600' : 'text-slate-800'}>{rollingStats.defectRatePct}%</strong>
            </span>
          </div>
        </div>

        {/* Upcoming Frame Queue Strip (Clickable!) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Next In Queue:</span>
          <div className="flex items-center gap-1.5">
            {upcomingQueue.map(({ event, index }) => (
              <button
                key={event.inspection_id}
                onClick={() => selectInspection(index)}
                title={`Jump to #${event.sequenceNumber}: ${event.defect_type}`}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono border transition-all hover:scale-105 ${
                  event.result === 'CRACK'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                    : event.result === 'DEFECT'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>#{event.sequenceNumber}</span>
                <span className="truncate max-w-[50px]">{event.defect_type.slice(0, 6)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
