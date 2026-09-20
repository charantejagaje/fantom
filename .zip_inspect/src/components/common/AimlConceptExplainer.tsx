import React, { useState } from 'react';
import { GraduationCap, Info, ChevronRight } from 'lucide-react';
import { AIML_GLOSSARY, AimlGlossaryItem } from '../../data/aimlGlossary';

interface AimlBadgeProps {
  termId: string;
  onOpenGuide?: (termId: string) => void;
  className?: string;
  labelOverride?: string;
}

export const AimlBadge: React.FC<AimlBadgeProps> = ({
  termId,
  onOpenGuide,
  className = '',
  labelOverride
}) => {
  const item: AimlGlossaryItem | undefined = AIML_GLOSSARY[termId];
  const [showTooltip, setShowTooltip] = useState(false);

  if (!item) return null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        id={`aiml-badge-${termId}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onOpenGuide) onOpenGuide(termId);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#159A62]/10 text-[#159A62] hover:bg-[#159A62]/20 border border-[#159A62]/20 hover:border-[#159A62]/40 transition-all cursor-pointer select-none"
        title={`Click to read 2nd-year AIML translation for: ${item.industrialTerm}`}
      >
        <GraduationCap size={11} className="text-[#159A62] shrink-0" />
        <span>{labelOverride || `AIML: ${item.shortBadge}`}</span>
      </button>

      {/* Hover preview tooltip */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-[#38E08A] mb-1">
            <span className="font-bold flex items-center gap-1">
              <GraduationCap size={12} />
              <span>AIML 2ND-YEAR CONCEPT</span>
            </span>
            <span className="text-slate-400">Click to expand</span>
          </div>

          <p className="text-xs font-bold text-white font-sans">
            {item.aimlTerm}
          </p>

          <p className="text-[11px] text-slate-300 mt-1 leading-snug font-sans">
            {item.analogy}
          </p>

          {item.mathOrFormula && (
            <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] font-mono text-[#38E08A] truncate">
              {item.mathOrFormula}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AimlConceptBannerProps {
  termId: string;
  onOpenGuide: (termId: string) => void;
  className?: string;
}

export const AimlConceptBanner: React.FC<AimlConceptBannerProps> = ({
  termId,
  onOpenGuide,
  className = ''
}) => {
  const item: AimlGlossaryItem | undefined = AIML_GLOSSARY[termId];
  if (!item) return null;

  return (
    <div 
      onClick={() => onOpenGuide(termId)}
      className={`p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-emerald-100/70 transition-all ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#159A62]/20 flex items-center justify-center text-[#159A62] shrink-0">
          <GraduationCap size={14} />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-800 font-bold uppercase">
            <span>AIML Concept Lens:</span>
            <span className="text-[#159A62]">{item.aimlTerm}</span>
          </div>
          <p className="text-[11px] text-emerald-950 font-sans line-clamp-1">
            {item.analogy}
          </p>
        </div>
      </div>

      <span className="text-[11px] font-mono text-[#159A62] font-semibold flex items-center gap-0.5 shrink-0">
        <span>Explain in ML Terms</span>
        <ChevronRight size={13} />
      </span>
    </div>
  );
};
