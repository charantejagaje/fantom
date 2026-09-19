import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  Sparkles, 
  AlertTriangle,
  Info,
  Clock,
  CheckCheck
} from 'lucide-react';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { Incident, IncidentMessage, UserRole } from '../../types';

interface IncidentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId?: string;
}

export const IncidentChatModal: React.FC<IncidentChatModalProps> = ({
  isOpen,
  onClose,
  incidentId: propIncidentId
}) => {
  const { 
    incidents, 
    activeIncidentId, 
    messages, 
    currentUser, 
    sendMessage 
  } = useIndustrialStore();

  const [inputMessage, setInputMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const incidentId = propIncidentId || activeIncidentId;
  const currentIncident = incidents.find((i) => i.id === incidentId) || incidents[0];
  const incidentMessages = messages.filter((m) => m.incidentId === incidentId);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, incidentMessages.length]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(incidentId, inputMessage.trim(), 'TEXT');
    setInputMessage('');
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(incidentId, prompt, 'TEXT');
  };

  // Tailored quick action chips for current user role
  const getRoleQuickPrompts = (): string[] => {
    if (!currentUser) return [];
    if (currentUser.role === 'OWNER') {
      return [
        'What is the estimated production impact?',
        'Update me when the machine is restored.',
        'Acknowledged. Please expedite containment.'
      ];
    }
    if (currentUser.role === 'ENGINEER') {
      return [
        'Please inspect Bearing #02 first.',
        'Station 03 utilization is at 96.4%. Dispatching technician now.',
        'Confirming simulated bearing cartridge replacement protocol.'
      ];
    }
    // Worker prompts
    return [
      "I've reached CNC-04 and started the inspection.",
      'Bearing #02 shows abnormal vibration (6.8 mm/s). Starting simulated replacement.',
      'Replacement complete. Running 3,000 RPM spin verification.'
    ];
  };

  const quickPrompts = getRoleQuickPrompts();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="incident-chat-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-bold">{currentIncident?.id}</span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="font-mono text-xs text-slate-300">{currentIncident?.machineId} ({currentIncident?.stationId})</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  currentIncident?.severity === 'CRITICAL' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {currentIncident?.severity}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-sans mt-0.5">
                {currentIncident?.title} — Contextual Cross-Role Incident Chat
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub-bar: Current User Identity */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Posting as:</span>
            <span className="font-bold text-slate-800">{currentUser?.name}</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              currentUser?.role === 'OWNER'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : currentUser?.role === 'ENGINEER'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {currentUser?.role}
            </span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono">
            Shared cross-role channel (Owner • Engineer • Worker)
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 min-h-[320px]">
          {incidentMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const isSystem = msg.type === 'SYSTEM';
            const isAiAlert = msg.type === 'AI_ALERT';
            const isStatus = msg.type === 'STATUS_UPDATE';

            if (isAiAlert) {
              return (
                <div key={msg.id} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-red-800 font-mono font-bold">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-red-600" />
                      <span>{msg.senderName}</span>
                    </div>
                    <span className="text-[10px] text-red-600">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans">{msg.message}</p>
                </div>
              );
            }

            if (isSystem || isStatus) {
              return (
                <div key={msg.id} className="p-2.5 bg-slate-100/90 border border-slate-200 rounded-lg text-xs flex items-center justify-between gap-2 text-slate-600 font-mono">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-slate-400 shrink-0" />
                    <span>{msg.message}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{msg.timestamp}</span>
                </div>
              );
            }

            const senderBadgeColor = msg.senderRole === 'OWNER'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : msg.senderRole === 'ENGINEER'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200';

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[88%] ${isMe ? 'ml-auto' : 'mr-auto'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded border font-semibold ${senderBadgeColor}`}>
                    {msg.senderRole}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                }`}>
                  <p className="font-sans whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {quickPrompts.length > 0 && (
          <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-mono uppercase text-[10px] whitespace-nowrap shrink-0">
              Quick {currentUser?.role} Response:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/80 whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Reply as ${currentUser?.role?.toLowerCase()} (${currentUser?.name})...`}
            className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
