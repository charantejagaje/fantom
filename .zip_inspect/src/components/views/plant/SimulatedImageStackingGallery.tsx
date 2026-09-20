import React, { useState } from 'react';
import { 
  Camera, 
  Layers, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Filter, 
  ArrowRight, 
  Info, 
  Clock, 
  Maximize2,
  Sparkles,
  Search
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';
import { SimulatedInspectionImage, ImageQualityGroup } from '../../../types/simulatedPlant';

interface SimulatedImageStackingGalleryProps {
  onOpenCrackDossier?: (img: SimulatedInspectionImage) => void;
}

export const SimulatedImageStackingGallery: React.FC<SimulatedImageStackingGalleryProps> = ({
  onOpenCrackDossier
}) => {
  const { 
    images, 
    batches, 
    areas,
    selectedBatchId, 
    setSelectedBatchId,
    qualityFilter, 
    setQualityFilter,
    areaFilter,
    setAreaFilter,
    setActiveInspectionImage,
    openCrackWorkflow
  } = useSimulatedPlantStore();

  const currentBatch = batches.find((b) => b.batchNumber === selectedBatchId) || batches[0];

  // Filter images by selected batch, quality group, and area
  const filteredImages = images.filter((img) => {
    if (selectedBatchId !== 'ALL_BATCHES' && img.batchNumber !== selectedBatchId) return false;
    if (qualityFilter !== 'ALL' && img.qualityGroup !== qualityFilter) return false;
    if (areaFilter !== 'ALL' && img.plantAreaId !== areaFilter) return false;
    return true;
  });

  // Calculate stack statistics for the active batch
  const batchImages = images.filter((i) => selectedBatchId === 'ALL_BATCHES' || i.batchNumber === selectedBatchId);
  const goodCount = batchImages.filter((i) => i.qualityGroup === 'GOOD').length;
  const attentionCount = batchImages.filter((i) => i.qualityGroup === 'ATTENTION').length;
  const defectiveCount = batchImages.filter((i) => i.qualityGroup === 'DEFECTIVE').length;
  const criticalCount = batchImages.filter((i) => i.qualityGroup === 'CRITICAL').length;

  const handleImageClick = (img: SimulatedInspectionImage) => {
    if (img.isCrack) {
      if (onOpenCrackDossier) {
        onOpenCrackDossier(img);
      } else {
        openCrackWorkflow(img);
      }
    } else {
      setActiveInspectionImage(img);
    }
  };

  return (
    <div id="simulated-image-stacking-gallery-root" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header & Batch Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-blue-600" />
            <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
              AUTOMATIC IMAGE STACKING // DEMO INSPECTION CAMERAS
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 font-sans mt-0.5">
            Simulated Factory Inspection Image Stacks
          </h3>
          <p className="text-xs text-slate-500">
            Automated image ingestion categorized by Plant Area, Batch ID, and AI Quality Assessment.
          </p>
        </div>

        {/* Batch Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 font-bold">BATCH:</span>
          <select
            id="select-active-batch"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.batchNumber}>
                {b.batchNumber} — {b.component} ({b.productionLine})
              </option>
            ))}
            <option value="ALL_BATCHES">View All Plant Batches (Consolidated)</option>
          </select>
        </div>
      </div>

      {/* 2. Automated Image Stacking Breakdown Pill */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-inner">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-blue-400" />
            <span className="font-bold text-white">BATCH {selectedBatchId === 'ALL_BATCHES' ? 'ALL' : currentBatch.batchNumber}</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Total Stacked: <strong className="text-white">{batchImages.length}</strong></span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">Good: <strong>{goodCount}</strong></span>
          <span className="text-amber-400">Attention: <strong>{attentionCount}</strong></span>
          <span className="text-orange-400">Defective: <strong>{defectiveCount}</strong></span>
          <span className="text-rose-400 font-bold">Critical: <strong>{criticalCount}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Simulated production data • 100% Optical Ingestion</span>
        </div>
      </div>

      {/* 3. Quality-Based Group Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: `ALL IMAGES (${batchImages.length})` },
            { id: 'GOOD', label: `GOOD (${goodCount})`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { id: 'ATTENTION', label: `ATTENTION (${attentionCount})`, color: 'text-amber-800 bg-amber-50 border-amber-200' },
            { id: 'DEFECTIVE', label: `DEFECTIVE (${defectiveCount})`, color: 'text-orange-800 bg-orange-50 border-orange-200' },
            { id: 'CRITICAL', label: `CRITICAL (${criticalCount})`, color: 'text-rose-800 bg-rose-50 border-rose-200' }
          ].map((tab) => {
            const isActive = qualityFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setQualityFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter by Plant Area */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <Filter size={13} className="text-slate-400" />
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-mono font-medium outline-hidden"
          >
            <option value="ALL">All Inspection Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.line.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Inspection Camera Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 font-mono text-xs">
          No inspection images found matching filter &quot;{qualityFilter}&quot; in Batch {selectedBatchId}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((img) => {
            const isCritical = img.qualityGroup === 'CRITICAL';
            const isDefective = img.qualityGroup === 'DEFECTIVE';
            const isAttention = img.qualityGroup === 'ATTENTION';

            return (
              <div
                key={img.id}
                id={`inspection-card-${img.id}`}
                onClick={() => handleImageClick(img)}
                className={`rounded-2xl border text-left transition-all cursor-pointer overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-md ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/20 hover:border-rose-500'
                    : isDefective
                    ? 'border-orange-200 bg-orange-50/15 hover:border-orange-400'
                    : isAttention
                    ? 'border-amber-200 bg-amber-50/15 hover:border-amber-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Camera Viewport Header */}
                <div className="p-2.5 bg-slate-900 text-slate-300 flex items-center justify-between text-[10px] font-mono border-b border-slate-800">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-slate-200 truncate max-w-[130px]">{img.plantAreaName}</span>
                  </span>
                  <span className="text-slate-400">{img.inspectionTimestamp}</span>
                </div>

                {/* Simulated Camera Image Display */}
                <div className="relative w-full h-44 bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={img.imageUrl}
                    alt={img.defectType}
                    className="w-full h-full object-cover grayscale contrast-115 group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Camera Calibration Watermark Overlay */}
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-slate-800">
                    Simulated inspection image
                  </div>

                  {/* Quality Group Tag Overlay */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shadow-xs ${
                      isCritical
                        ? 'bg-rose-600 text-white border-rose-700'
                        : isDefective
                        ? 'bg-orange-600 text-white border-orange-700'
                        : isAttention
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-emerald-600 text-white border-emerald-700'
                    }`}>
                      {img.qualityGroup}
                    </span>
                  </div>

                  {/* Crack indicator marker */}
                  {img.isCrack && (
                    <div className="absolute bottom-2 left-2 bg-rose-950/90 text-rose-300 border border-rose-800 text-[9px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <AlertOctagon size={10} />
                      <span>CRACK DETECTED</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-slate-950/80 text-blue-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                    {img.confidenceScore}% Conf
                  </div>
                </div>

                {/* Card Information Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{img.component}</span>
                      <span className="font-bold text-slate-700">{img.batchNumber}</span>
                    </div>

                    <h4 className="font-sans font-bold text-sm text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {img.defectType}
                    </h4>

                    <p className="text-[11px] text-slate-600 font-sans mt-1 line-clamp-2 leading-snug">
                      {img.summary}
                    </p>
                  </div>

                  {/* Action / Review indicator */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 text-[10px]">
                      {img.requiresReview ? 'Requires engineering review' : 'AI assessment complete'}
                    </span>
                    <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Review</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
