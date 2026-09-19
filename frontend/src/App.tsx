import React, { useState, useCallback } from 'react';
import { useIndustrialStore } from './store/useIndustrialStore';
import { LoginPage } from './components/auth/LoginPage';
import { RoleAwareHeader } from './components/common/RoleAwareHeader';
import { OwnerDashboard } from './components/views/owner/OwnerDashboard';
import { EngineerDashboard } from './components/views/engineer/EngineerDashboard';
import { WorkerDashboard } from './components/views/worker/WorkerDashboard';

// Modals
import { IncidentChatModal } from './components/modals/IncidentChatModal';
import { SharedIncidentDetailModal } from './components/modals/SharedIncidentDetailModal';
import { CrossRoleScenarioModal } from './components/modals/CrossRoleScenarioModal';
import { WorkerDispatchModal } from './components/modals/WorkerDispatchModal';
import { MachineInspectionModal } from './components/modals/MachineInspectionModal';
import { AimlStudentGuideModal } from './components/modals/AimlStudentGuideModal';

import { ShieldCheck, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const { 
    currentUser, 
    isAuthenticated,
    activeIncidentId,
    setActiveIncidentId
  } = useIndustrialStore();

  // Modal display states
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatIncidentId, setChatIncidentId] = useState<string>('INC-0042');
  const [isIncidentDetailOpen, setIsIncidentDetailOpen] = useState<boolean>(false);
  const [detailIncidentId, setDetailIncidentId] = useState<string>('INC-0042');
  const [isCrossRoleDemoOpen, setIsCrossRoleDemoOpen] = useState<boolean>(false);
  const [isWorkerDispatchOpen, setIsWorkerDispatchOpen] = useState<boolean>(false);
  const [isMachineInspectionOpen, setIsMachineInspectionOpen] = useState<boolean>(false);
  const [inspectedStationId, setInspectedStationId] = useState<string>('S03');
  const [isAimlGuideOpen, setIsAimlGuideOpen] = useState<boolean>(false);
  const [aimlActiveTermId, setAimlActiveTermId] = useState<string | undefined>(undefined);
  const [workerNavigating, setWorkerNavigating] = useState<boolean>(false);
  const [batchOnHold, setBatchOnHold] = useState<boolean>(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'info' | 'success' | 'alert' } | null>(null);

  const showToast = useCallback((title: string, desc: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  const handleOpenIncidentChat = (incidentId: string = 'INC-0042') => {
    setChatIncidentId(incidentId);
    setActiveIncidentId(incidentId);
    setIsChatOpen(true);
  };

  const handleOpenIncidentDetail = (incidentId: string = 'INC-0042') => {
    setDetailIncidentId(incidentId);
    setActiveIncidentId(incidentId);
    setIsIncidentDetailOpen(true);
  };

  const handleOpenMachineInspection = (stationId: string = 'S03') => {
    setInspectedStationId(stationId);
    setIsMachineInspectionOpen(true);
  };

  const handleOpenAimlGuide = (termId?: string) => {
    setAimlActiveTermId(termId);
    setIsAimlGuideOpen(true);
  };

  const handleDispatchWorker = (taskType: string, technicianName: string) => {
    setWorkerNavigating(true);
    setIsWorkerDispatchOpen(false);
    showToast(
      'Technician Dispatched',
      `${technicianName} dispatched to Station 03 CNC-04. Spatial tracking engaged.`,
      'success'
    );
  };

  const handleHoldBatch = () => {
    setBatchOnHold((prev) => {
      const updated = !prev;
      showToast(
        updated ? 'Batch B17 Held' : 'Hold Released',
        updated ? 'Batch B17 flagged for containment hold. 100% optical audit required.' : 'Batch B17 hold released.',
        updated ? 'alert' : 'info'
      );
      return updated;
    });
  };

  // If not signed in, show demo authentication page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage onSuccessLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Role-Aware Global Header */}
      <RoleAwareHeader
        onOpenIncidentChat={handleOpenIncidentChat}
        onOpenIncidentDetail={handleOpenIncidentDetail}
        onOpenAimlGuide={handleOpenAimlGuide}
        onRunCrossRoleDemo={() => setIsCrossRoleDemoOpen(true)}
      />

      {/* Main Role-Specific View Router */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {currentUser.role === 'OWNER' && (
          <OwnerDashboard
            onOpenIncidentDetail={handleOpenIncidentDetail}
            onOpenIncidentChat={handleOpenIncidentChat}
            onOpenAimlGuide={handleOpenAimlGuide}
          />
        )}

        {currentUser.role === 'ENGINEER' && (
          <EngineerDashboard
            onOpenMachineInspection={handleOpenMachineInspection}
            onOpenWorkerDispatch={() => setIsWorkerDispatchOpen(true)}
            onOpenIncidentDetail={handleOpenIncidentDetail}
            onOpenIncidentChat={handleOpenIncidentChat}
            onOpenAimlGuide={handleOpenAimlGuide}
            workerNavigating={workerNavigating}
          />
        )}

        {currentUser.role === 'WORKER' && (
          <WorkerDashboard
            onOpenIncidentChat={handleOpenIncidentChat}
            onOpenAimlGuide={handleOpenAimlGuide}
          />
        )}
      </main>

      {/* Modals: Contextual Cross-Role Incident Chat */}
      <IncidentChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        incidentId={chatIncidentId}
      />

      {/* Modals: One Incident, 3 Different Perspectives Modal */}
      <SharedIncidentDetailModal
        isOpen={isIncidentDetailOpen}
        onClose={() => setIsIncidentDetailOpen(false)}
        incidentId={detailIncidentId}
        onOpenChat={() => {
          setIsIncidentDetailOpen(false);
          setIsChatOpen(true);
        }}
        onOpenWorkerDispatch={() => {
          setIsIncidentDetailOpen(false);
          setIsWorkerDispatchOpen(true);
        }}
      />

      {/* Modals: 3-Role End-to-End Collaboration Scenario Tour */}
      <CrossRoleScenarioModal
        isOpen={isCrossRoleDemoOpen}
        onClose={() => setIsCrossRoleDemoOpen(false)}
        onOpenIncidentChat={handleOpenIncidentChat}
      />

      {/* Modals: Worker Maintenance Dispatch Modal */}
      <WorkerDispatchModal
        isOpen={isWorkerDispatchOpen}
        onClose={() => setIsWorkerDispatchOpen(false)}
        onDispatchWorker={handleDispatchWorker}
        onHoldBatch={handleHoldBatch}
        batchOnHold={batchOnHold}
        workerNavigating={workerNavigating}
      />

      {/* Modals: 3D Exploded Spindle Inspection */}
      <MachineInspectionModal
        isOpen={isMachineInspectionOpen}
        onClose={() => setIsMachineInspectionOpen(false)}
        stationId={inspectedStationId}
        onNavigateToSimulation={() => {}}
      />

      {/* Modals: AIML 2nd-Year Curriculum Glossary Modal */}
      <AimlStudentGuideModal
        isOpen={isAimlGuideOpen}
        onClose={() => setIsAimlGuideOpen(false)}
        initialTermId={aimlActiveTermId}
      />

      {/* System Toast Notification */}
      {toastMessage && (
        <div 
          id="fantom-system-toast"
          className="fixed top-24 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-2xl flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2"
        >
          {toastMessage.type === 'alert' ? (
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-xs font-mono uppercase text-slate-100">{toastMessage.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Industrial Platform Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">FANTOM</span>
            <span>// MULTI-ROLE INDUSTRIAL AI PLATFORM</span>
            <span className="text-slate-300">|</span>
            <span>v3.0.0-ROLE-ARCH</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Unified Factory State • Owner (EBIT) • Engineer (Twin) • Worker (Field)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
