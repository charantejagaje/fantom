import React, { useState } from 'react';
import { MachineInspectionCanvas } from '../3d/MachineInspectionCanvas';
import { MACHINE_COMPONENTS } from '../../data/mockData';
import { MachineComponentDiagnostic } from '../../types';

interface MachineInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string;
  onNavigateToSimulation?: () => void;
}

export const MachineInspectionModal: React.FC<MachineInspectionModalProps> = ({
  isOpen,
  onClose,
  stationId = 'S03',
  onNavigateToSimulation
}) => {
  const [selectedComp, setSelectedComp] = useState<MachineComponentDiagnostic | null>(
    MACHINE_COMPONENTS[2] // Front bearing #02
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 overflow-hidden">
      <div 
        id="machine-inspection-modal-container"
        className="w-full max-w-7xl h-[92vh] bg-[#11141B] rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl relative"
      >
        <MachineInspectionCanvas
          machineName={`Station ${stationId}: 5-Axis CNC Milling Center #04 (Spindle Drive)`}
          selectedComponent={selectedComp}
          onSelectComponent={(comp) => setSelectedComp(comp)}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
