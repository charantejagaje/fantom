import React, { useEffect } from 'react';
import { useSimulatedPlantStore } from '../../store/useSimulatedPlantStore';

/**
 * Background runner that drives the continuous simulated inspection stream
 * based on selected playback state and speed. Runs across the entire application.
 */
export const InspectionStreamRunner: React.FC = () => {
  const streamStatus = useSimulatedPlantStore((s) => s.streamStatus);
  const streamSpeed = useSimulatedPlantStore((s) => s.streamSpeed);
  const tickStream = useSimulatedPlantStore((s) => s.tickStream);

  useEffect(() => {
    if (streamStatus !== 'RUNNING') return;

    const intervalMs = 
      streamSpeed === 'SLOW' ? 5500 : 
      streamSpeed === 'FAST' ? 1200 : 3000;

    const timer = setInterval(() => {
      tickStream();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [streamStatus, streamSpeed, tickStream]);

  return null;
};
