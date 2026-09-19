import React, { useState } from 'react';
import { 
  GraduationCap, 
  X, 
  Search, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Cpu, 
  Activity, 
  HelpCircle,
  TrendingUp,
  GitBranch,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AIML_GLOSSARY, AimlGlossaryItem } from '../../data/aimlGlossary';

interface AimlStudentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string | null;
}

export const AimlStudentGuideModal: React.FC<AimlStudentGuideModalProps> = ({
  isOpen,
  onClose,
  initialTermId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>(
    initialTermId && AIML_GLOSSARY[initialTermId] ? initialTermId : 'bayesian-dag'
  );

  // Update selected term if initialTermId changes
  React.useEffect(() => {
    if (initialTermId && AIML_GLOSSARY[initialTermId]) {
      setSelectedTermId(initialTermId);
    }
  }, [initialTermId]);

  if (!isOpen) return null;

  const allTerms = Object.values(AIML_GLOSSARY);

  const filteredTerms = allTerms.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.industrialTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aimlTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortBadge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detailedExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.analogy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeItem: AimlGlossaryItem = AIML_GLOSSARY[selectedTermId] || allTerms[0];

  const categoryLabels: Record<string, { label: string; icon: any }> = {
    all: { label: 'All Concepts (12)', icon: BookOpen },
    cv_anomaly: { label: 'Vision & Localization', icon: Layers },
    prob_stats: { label: 'Bayesian & Statistics', icon: GitBranch },
    uncertainty_drift: { label: 'Drift & Uncertainty', icon: Activity },
    systems_optimization: { label: 'Queuing & Loss Functions', icon: TrendingUp }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden">
      <div 
        id="aiml-student-guide-modal"
        className="w-full max-w-5xl h-[90vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Strip */}
        <div className="bg-[#11141B] text-white p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#159A62]/20 border border-[#159A62]/40 flex items-center justify-center text-[#38E08A] shrink-0 mt-0.5">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38E08A]">
                  STUDENT CURRICULUM BRIDGE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  AIML 2ND YEAR EDITION
                </span>
              </div>
              <h2 className="text-xl font-bold font-sans text-white mt-1">
                FANTOM Industrial AI &rarr; Machine Learning Concept Guide
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Every factory term in FANTOM maps directly to core ML, Probability, and Systems concepts you study in college.
                Use this guide to translate manufacturing jargon into textbook formulas and intuitive analogies.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts (e.g., Bayesian, OOD, Little's Law, Drift, Loss)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#159A62]/30 focus:border-[#159A62]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {Object.entries(categoryLabels).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-[#159A62] text-white font-semibold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Left List + Right Explainer Dossier */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* LEFT: Term List (Col 1-5) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {filteredTerms.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No matching terms found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredTerms.map((term) => {
                const isSelected = term.id === selectedTermId;
                return (
                  <div
                    key={term.id}
                    onClick={() => setSelectedTermId(term.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#159A62] bg-white ring-2 ring-[#159A62]/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#159A62] uppercase tracking-wider">
                        {term.shortBadge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">
                        {term.category.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {term.industrialTerm}
                    </h4>

                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-slate-600">
                      <span className="text-slate-400">&rarr;</span>
                      <span className="font-semibold text-slate-800">{term.aimlTerm}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: Deep Educational Explainer Dossier (Col 6-12) */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 bg-white">
            {/* Header / Term Mapping Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase font-bold">CONCEPT ROSETTA STONE</span>
                <span className="px-2 py-0.5 rounded bg-[#159A62]/10 text-[#159A62] font-bold border border-[#159A62]/20">
                  {activeItem.shortBadge}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                    What Factory Engineers Call It:
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    {activeItem.industrialTerm}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-[#159A62] font-bold block">
                    What You Learn in AIML Class (2nd Year):
                  </span>
                  <h4 className="text-sm font-extrabold text-[#159A62] font-mono">
                    {activeItem.aimlTerm}
                  </h4>
                </div>
              </div>
            </div>

            {/* Intuitive 2nd-Year Analogy Box */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs font-mono uppercase mb-1.5">
                <Sparkles size={14} className="text-amber-600" />
                <span>INTUITIVE 2ND-YEAR ANALOGY</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-sans">
                {activeItem.analogy}
              </p>
            </div>

            {/* Formula / Mathematical Intuition (if applicable) */}
            {activeItem.mathOrFormula && (
              <div className="p-3.5 rounded-xl bg-[#11141B] text-slate-200 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  MATHEMATICAL REPRESENTATION & FORMULA:
                </span>
                <code className="text-xs font-mono text-[#38E08A] block overflow-x-auto py-1">
                  {activeItem.mathOrFormula}
                </code>
              </div>
            )}

            {/* Detailed Explanation */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-slate-700 tracking-wider mb-2">
                DETAILED EXPLANATION FOR CS/AIML STUDENTS
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                {activeItem.detailedExplanation}
              </p>
            </div>

            {/* Why it Matters in Machine Learning */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs font-mono uppercase mb-1.5">
                <CheckCircle2 size={14} className="text-[#159A62]" />
                <span>WHY THIS MATTERS FOR YOUR AIML CAREER</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed font-sans">
                {activeItem.whyItMattersInML}
              </p>
            </div>

            {/* Quick 2nd-Year Exam / Interview Takeaway */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Category: <strong className="text-slate-800 capitalize">{activeItem.category.replace('_', ' ')}</strong></span>
              <span className="text-[#159A62] font-semibold">Standard 2nd-Year Curriculum Concept</span>
            </div>
          </div>
        </div>

        {/* Footer Quick Summary */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <GraduationCap size={15} className="text-[#159A62]" />
            <span>Industrial AI is applied Machine Learning with strict physics, latency, and business loss constraints.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
          >
            Got it, Back to Platform &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
