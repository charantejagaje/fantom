import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Crosshair, 
  FileText, 
  ChevronRight,
  Sparkles,
  Info,
  Sliders,
  Eye,
  BarChart2
} from 'lucide-react';
import { InspectionRecord, ProductVariantInfo } from '../../types';
import { INSPECTION_DATASET, PRODUCT_VARIANTS } from '../../data/mockData';
import { AimlBadge } from '../common/AimlConceptExplainer';
import { DefectDetectionStudio } from './engineer/DefectDetectionStudio';

interface QualityViewProps {
  onInvestigateStation: (stationId: string) => void;
  onNavigateToRootCause: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
  onNavigateToSimulation?: (stationId: string, parameters?: Record<string, number>) => void;
  onOpenWorkerDispatch?: () => void;
}

export const QualityView: React.FC<QualityViewProps> = ({
  onInvestigateStation,
  onNavigateToRootCause,
  onOpenAimlGuide,
  onNavigateToSimulation,
  onOpenWorkerDispatch
}) => {
  // Quality view active mode: default to the NEU-DET Real Industrial Defect Detection Studio
  const [qualityMode, setQualityMode] = useState<'NEU_DET_STUDIO' | 'FLEET_CATALOG'>('NEU_DET_STUDIO');
  
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord>(INSPECTION_DATASET[0]);
  const [filterBatch, setFilterBatch] = useState<string>('All');
  const [filterVariant, setFilterVariant] = useState<string>('All');

  const filteredRecords = INSPECTION_DATASET.filter((rec) => {
    if (filterBatch !== 'All' && rec.batchId !== filterBatch) return false;
    if (filterVariant !== 'All' && rec.variant !== filterVariant) return false;
    return true;
  });

  // Summary tallies
  const totalInspected = 10130;
  const totalAcceptable = 9645;
  const totalDefective = 425;
  const totalUncertain = 60;

  return (
    <div id="fantom-quality-view" className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              INSPECTION INTELLIGENCE
            </span>
            <AimlBadge termId="optical-localization" onOpenGuide={onOpenAimlGuide} />
            <AimlBadge termId="bayesian-confidence" onOpenGuide={onOpenAimlGuide} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">
            Quality Intelligence & Surface Defect Localization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real NEU-DET industrial steel dataset, Pascal VOC spatial bounding boxes, explainable model evidence, and non-causal process correlation.
          </p>
        </div>

        {/* View Switcher: NEU-DET Studio vs Fleet Catalog */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setQualityMode('NEU_DET_STUDIO')}
            className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 ${
              qualityMode === 'NEU_DET_STUDIO'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crosshair size={14} />
            <span>NEU-DET Defect Studio (Real Dataset)</span>
          </button>

          <button
            onClick={() => setQualityMode('FLEET_CATALOG')}
            className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 ${
              qualityMode === 'FLEET_CATALOG'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 size={14} />
            <span>Fleet Batch Catalog</span>
          </button>
        </div>
      </div>

      {/* MODE 1: NEU-DET REAL DATASET INSPECTION STUDIO (Default & Flagship) */}
      {qualityMode === 'NEU_DET_STUDIO' && (
        <DefectDetectionStudio
          onNavigateToSimulation={(stationId, params) => {
            if (onNavigateToSimulation) {
              onNavigateToSimulation(stationId, params);
            } else {
              onInvestigateStation(stationId);
            }
          }}
          onNavigateToRootCause={onNavigateToRootCause}
          onOpenAimlGuide={onOpenAimlGuide}
          onOpenWorkerDispatch={onOpenWorkerDispatch}
        />
      )}

      {/* MODE 2: FLEET QUALITY & VARIANT MATRIX */}
      {qualityMode === 'FLEET_CATALOG' && (
        <div className="space-y-6">
          {/* Global Inspection Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px]">TOTAL INSPECTED</span>
              <span className="font-bold text-slate-800 text-sm">{totalInspected.toLocaleString()}</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
              <span className="text-emerald-600 block text-[10px]">ACCEPTABLE (PASS)</span>
              <span className="font-bold text-sm">{totalAcceptable.toLocaleString()} (95.2%)</span>
            </div>
            <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <span className="text-red-600 block text-[10px]">DEFECTIVE</span>
              <span className="font-bold text-sm">{totalDefective} (4.2%)</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-800">
              <span className="text-purple-600 block text-[10px]">UNCERTAIN / NOVEL</span>
              <span className="font-bold text-sm">{totalUncertain} (0.6%)</span>
            </div>
          </div>

          {/* Central 2-Column Quality Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: Inspection Records Matrix & Variant Breakdown (Col 1-5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Defect Distribution by Product Variant */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
                  Defect Rate by Product Variant
                </h3>
                <div className="space-y-2.5">
                  {PRODUCT_VARIANTS.map((v) => {
                    const defectRate = ((v.defectCount / v.totalManufactured) * 100).toFixed(1);
                    const isHigh = parseFloat(defectRate) > 5.0;
                    return (
                      <div key={v.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{v.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">({v.code})</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {v.defectCount} defects / {v.totalManufactured} total
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold ${isHigh ? 'text-red-600' : 'text-slate-700'}`}>
                            {defectRate}% Rejection
                          </span>
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(parseFloat(defectRate) * 10, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inspection Stream List */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Inspection Records Log
                  </h3>
                  <span className="text-xs font-mono text-slate-500">{filteredRecords.length} records</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredRecords.map((rec) => {
                    const isSelected = selectedRecord.productId === rec.productId;
                    return (
                      <div
                        key={rec.productId}
                        onClick={() => setSelectedRecord(rec)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">{rec.productId}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            rec.result === 'DEFECTIVE' 
                              ? 'bg-red-100 text-red-700' 
                              : rec.result === 'UNCERTAIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {rec.result}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-slate-500 text-[11px] font-mono">
                          <span>{rec.variant}</span>
                          <span>{rec.defectType}</span>
                          <span>Conf: {(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Detail View for Selected Record (Col 6-12) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Record Inspection Detail</span>
                    <h2 className="text-lg font-bold text-slate-900 font-sans">{selectedRecord.productId}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-500 block">Station Origin: {selectedRecord.stationOrigin}</span>
                    <span className="text-xs font-mono text-slate-400">{selectedRecord.timestamp}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">{selectedRecord.defectType}</span>
                  <p className="text-slate-600">{selectedRecord.associationHypothesis}</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={onNavigateToRootCause}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all"
                  >
                    View in Bayesian Root Cause Graph &rarr;
                  </button>
                  <button
                    onClick={() => setQualityMode('NEU_DET_STUDIO')}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-mono font-bold transition-all"
                  >
                    Launch NEU-DET Inspection Studio &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
