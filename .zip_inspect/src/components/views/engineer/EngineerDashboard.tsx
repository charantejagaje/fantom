import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  BarChart3, 
  GitFork, 
  AlertTriangle, 
  MessageSquare, 
  UserCheck, 
  RefreshCw, 
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  Eye,
  Wrench
} from 'lucide-react';
import { useIndustrialStore } from '../../../store/useIndustrialStore';
import { CommandCenter } from '../CommandCenter';
import { QualityView } from '../QualityView';
import { RootCauseView } from '../RootCauseView';
import { RecommendationsView } from '../RecommendationsView';
import { EngineerInvestigationChain } from './EngineerInvestigationChain';
import { AiInterventionStudio } from './AiInterventionStudio';
import { Incident } from '../../../types';

interface EngineerDashboardProps {
  onOpenMachineInspection: (stationId: string) => void;
  onOpenWorkerDispatch: () => void;
  onOpenIncidentDetail: (incidentId: string) => void;
  onOpenIncidentChat: (incidentId: string) => void;
  onOpenAimlGuide?: (termId?: string) => void;
  workerNavigating?: boolean;
}

export const EngineerDashboard: React.FC<EngineerDashboardProps> = ({
  onOpenMachineInspection,
  onOpenWorkerDispatch,
  onOpenIncidentDetail,
  onOpenIncidentChat,
  onOpenAimlGuide,
  workerNavigating = false
}) => {
  const { 
    stations, 
    incidents, 
    recommendations, 
    injectCriticalDefect, 
    restoreFactoryDefaults,
    acknowledgeIncident
  } = useIndustrialStore();

  const [activeTab, setActiveTab] = useState<
    'ai_intervention' | 'investigation' | 'command' | 'quality' | 'rootcause' | 'recommendations' | 'incidents'
  >('ai_intervention');

  const [selectedStationId, setSelectedStationId] = useState<string>('S03');

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="space-y-6 pb-12">
      {/* Engineering Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-mono font-bold text-blue-400">
            <Cpu size={13} />
            <span>ENGINEERING COMMAND & PHYSICAL DIGITAL TWIN</span>
          </div>
          <h1 className="text-xl font-black tracking-tight font-sans text-white">
            Manufacturing Systems Command Bay
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Real-time multivariate telemetry, 3D kinematic twin, Bayesian causal DAG, and autonomous AI remediation.
          </p>
        </div>

        {/* Quick Engineering Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={injectCriticalDefect}
            className="px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            title="Inject simulated bearing vibration spike on S03"
          >
            <Zap size={14} className="text-red-400" />
            <span>Inject Anomaly Surge</span>
          </button>

          <button
            onClick={restoreFactoryDefaults}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 active:scale-[0.98]"
            title="Reset telemetry to baseline"
          >
            <RefreshCw size={14} />
            <span>Normalize Twin</span>
          </button>

          <button
            onClick={onOpenWorkerDispatch}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <UserCheck size={14} />
            <span>Dispatch Field Worker</span>
          </button>

          {onOpenAimlGuide && (
            <button
              onClick={() => onOpenAimlGuide()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">AIML Lens</span>
            </button>
          )}
        </div>
      </div>

      {/* Engineer Navigation Tabs - Properly Aligned */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px scrollbar-none">
        {[
          { id: 'ai_intervention', label: 'AI Intervention Studio', icon: Sparkles },
          { id: 'investigation', label: 'Investigation Chain (8-Step)', icon: GitFork },
          { id: 'command', label: 'Command Center (3D)', icon: Eye },
          { id: 'quality', label: 'Quality & Defect Vision', icon: Layers },
          { id: 'rootcause', label: 'Root Cause (Bayesian DAG)', icon: Cpu },
          { id: 'recommendations', label: 'Advisories & Impact', icon: CheckCircle2 },
          { id: 'incidents', label: `Incidents & Comms (${activeIncidents.length})`, icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`engineer-nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold uppercase font-mono tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap rounded-t-lg ${
                isActive
                  ? 'border-blue-600 text-blue-900 bg-blue-50/70 shadow-2xs font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View Containers */}
      <div>
        {activeTab === 'ai_intervention' && (
          <AiInterventionStudio
            onOpenWorkerDispatch={onOpenWorkerDispatch}
            onOpenMachineInspection={onOpenMachineInspection}
          />
        )}
        {activeTab === 'investigation' && (
          <EngineerInvestigationChain
            onOpenWorkerDispatch={onOpenWorkerDispatch}
            onOpenIncidentChat={onOpenIncidentChat}
          />
        )}
        {activeTab === 'command' && (
          <CommandCenter
            stations={stations}
            selectedStationId={selectedStationId}
            onSelectStation={(id) => setSelectedStationId(id)}
            onInvestigateRootCause={() => setActiveTab('rootcause')}
            onOpenQualityView={() => setActiveTab('quality')}
            onOpenMachineInspection={onOpenMachineInspection}
            onOpenWorkerDispatch={onOpenWorkerDispatch}
            onOpenAIIntervention={() => setActiveTab('ai_intervention')}
            recommendations={recommendations}
            workerNavigating={workerNavigating}
            onOpenAimlGuide={onOpenAimlGuide}
          />
        )}

        {activeTab === 'quality' && (
          <QualityView
            onInvestigateStation={(id) => {
              setSelectedStationId(id);
              setActiveTab('command');
            }}
            onNavigateToRootCause={() => setActiveTab('rootcause')}
            onOpenAimlGuide={onOpenAimlGuide}
            onOpenWorkerDispatch={onOpenWorkerDispatch}
          />
        )}

        {activeTab === 'rootcause' && (
          <RootCauseView
            onOpenMachineInspection={onOpenMachineInspection}
            onOpenAimlGuide={onOpenAimlGuide}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            onOpenMachineInspection={onOpenMachineInspection}
            onOpenWorkerDispatch={onOpenWorkerDispatch}
            onOpenAimlGuide={onOpenAimlGuide}
          />
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-slate-800 uppercase">
                Active Industrial Incident Queue & Field Communications
              </h3>
              <button
                onClick={onOpenWorkerDispatch}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <UserCheck size={14} />
                <span>Open Worker Dispatch Console</span>
              </button>
            </div>

            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                        {incident.id}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {incident.machineId} • Station {incident.stationId}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenIncidentChat(incident.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <MessageSquare size={14} />
                        <span>Incident Chat ({incident.id})</span>
                      </button>

                      <button
                        onClick={() => onOpenMachineInspection(incident.stationId)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Wrench size={14} />
                        <span>Inspect Machine</span>
                      </button>

                      <button
                        onClick={() => onOpenIncidentDetail(incident.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>Cross-Role Detail</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 font-sans">{incident.title}</h4>
                  <p className="text-xs text-slate-600 font-sans">{incident.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                    <span className="text-slate-500 block text-[11px]">AI DIAGNOSIS:</span>
                    <span className="text-blue-900 font-bold">{incident.aiDiagnosis} (Confidence: {incident.confidence}%)</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500">
                      Detected: {incident.detectedAt} • Status: <strong className="text-slate-800">{incident.status}</strong>
                    </span>

                    {!incident.acknowledgedByEngineer && (
                      <button
                        onClick={() => acknowledgeIncident(incident.id)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded text-xs transition-colors"
                      >
                        Acknowledge as Engineer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
