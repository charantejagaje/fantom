import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export const INDUSTRIAL_HELP_DEFINITIONS: Record<string, { term: string; explanation: string; technicalTerm?: string }> = {
  bottleneck: {
    term: 'Slowest / Blocking Stage',
    technicalTerm: 'Bottleneck',
    explanation: 'The stage that is slowing down the rest of production and holding back total factory output.'
  },
  cycleTime: {
    term: 'Time Needed for One Unit',
    technicalTerm: 'Cycle Time',
    explanation: 'How long it takes for a machine to complete work on a single part.'
  },
  utilization: {
    term: 'How Busy the Machine Is',
    technicalTerm: 'Machine Utilization',
    explanation: 'How much of the machine’s total working hours are spent cutting or processing parts.'
  },
  scrap: {
    term: 'Units That Cannot Be Used',
    technicalTerm: 'Scrap Parts',
    explanation: 'Parts with defects that cannot be saved and must be thrown away or melted down.'
  },
  rework: {
    term: 'Units That Need Fixing',
    technicalTerm: 'Rework Required',
    explanation: 'Parts that have minor flaws and require extra manual fixing before they can be used.'
  },
  downtime: {
    term: 'Time the Machine Was Stopped',
    technicalTerm: 'Unplanned Downtime',
    explanation: 'Time when the machine was stopped due to errors, tool breaks, or waiting for parts.'
  },
  throughput: {
    term: 'Units Produced per Hour',
    technicalTerm: 'Production Throughput',
    explanation: 'The total number of finished good parts made every hour or shift.'
  },
  confidence: {
    term: 'AI Confidence',
    technicalTerm: 'Prediction Probability',
    explanation: 'How sure the AI system is about its diagnosis or defect detection result.'
  },
  defect: {
    term: 'Problem Found',
    technicalTerm: 'Defect Classification',
    explanation: 'A visual scratch, crack, pit, or measurement error found on the finished metal part.'
  },
  rootCause: {
    term: 'Possible Reason',
    technicalTerm: 'Root Cause Attribution',
    explanation: 'The physical mechanical issue (such as worn tools or loose bearings) causing the flaw.'
  },
  vibration: {
    term: 'Spindle Shaking',
    technicalTerm: 'Bearing Vibration (mm/s)',
    explanation: 'Excess shaking in the cutting spindle that causes wavy cuts and ruins surface finish.'
  },
  roughness: {
    term: 'Surface Smoothness',
    technicalTerm: 'Surface Roughness (Ra µm)',
    explanation: 'A measurement of how smooth the metal surface feels. Lower values mean smoother finishes.'
  },
  coolant: {
    term: 'Cooling Liquid Pressure',
    technicalTerm: 'Coolant Flow & Pressure (bar)',
    explanation: 'Liquid sprayed on metal cutting tools to prevent overheating and premature tool wear.'
  },
  simulation: {
    term: 'Try a Change',
    technicalTerm: 'Counterfactual Simulation',
    explanation: 'Test what happens to speed and cost before making real changes on the physical factory floor.'
  }
};

interface HelpTooltipProps {
  term?: keyof typeof INDUSTRIAL_HELP_DEFINITIONS;
  text?: string;
  title?: string;
  className?: string;
  size?: number;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  term,
  text,
  title,
  className = '',
  size = 13
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const termDef = term ? INDUSTRIAL_HELP_DEFINITIONS[term] : undefined;
  const tooltipText = text || termDef?.explanation || 'Click for quick explanation';
  const tooltipTitle = title || termDef?.term || termDef?.technicalTerm;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center align-middle select-none ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center justify-center p-0.5 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors rounded-full"
        title={tooltipText}
        aria-label="Help information"
      >
        <HelpCircle size={size} className="stroke-[2.2]" />
      </button>

      {isOpen && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-left pointer-events-none block animate-in fade-in zoom-in-95 duration-150"
        >
          {tooltipTitle && (
            <span className="block text-[11px] font-bold text-sky-400 font-sans mb-1">
              {tooltipTitle}
              {termDef?.technicalTerm && (
                <span className="ml-1 text-[9px] font-mono text-slate-400 font-normal">
                  ({termDef.technicalTerm})
                </span>
              )}
            </span>
          )}
          <span className="block text-xs text-slate-200 leading-snug font-sans font-normal">
            {tooltipText}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 block" />
        </span>
      )}
    </span>
  );
};
