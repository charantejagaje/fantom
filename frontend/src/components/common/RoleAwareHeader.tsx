import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  Bell, 
  MessageSquare, 
  LogOut, 
  Sparkles, 
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { NotificationService } from '../../services/notificationService';

interface RoleAwareHeaderProps {
  onOpenIncidentChat: (incidentId?: string) => void;
  onOpenIncidentDetail: (incidentId: string) => void;
  onOpenAimlGuide?: (termId?: string) => void;
  onRunCrossRoleDemo?: () => void;
}

export const RoleAwareHeader: React.FC<RoleAwareHeaderProps> = ({
  onOpenIncidentChat,
  onOpenIncidentDetail,
  onOpenAimlGuide,
  onRunCrossRoleDemo
}) => {
  const { 
    currentUser, 
    switchRole, 
    logout, 
    notifications, 
    markNotificationAsRead, 
    clearNotificationsForRole,
    activeIncidentId
  } = useIndustrialStore();

  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  const currentRole = currentUser?.role || 'OWNER';
  const roleNotifications = NotificationService.getNotificationsForRole(notifications, currentRole);
  const unreadCount = NotificationService.getUnreadCount(notifications, currentRole);

  const roleColor = currentRole === 'OWNER'
    ? 'text-amber-600 bg-amber-50 border-amber-200'
    : currentRole === 'ENGINEER'
    ? 'text-blue-600 bg-blue-50 border-blue-200'
    : 'text-emerald-600 bg-emerald-50 border-emerald-200';

  const roleIcon = currentRole === 'OWNER'
    ? <ShieldCheck size={14} />
    : currentRole === 'ENGINEER'
    ? <Cpu size={14} />
    : <Wrench size={14} />;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Telemetry & Role Navigation Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-slate-700 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-900 font-extrabold">FANTOM</span>
            <span className="text-emerald-600 font-extrabold">AI</span>
            <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">| PLANT DIGITAL TWIN</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-[11px] font-mono text-slate-500">
            <span>CNC-04: <strong className="text-slate-800 font-semibold">Active</strong></span>
            <span>•</span>
            <span>Shift Target: <strong className="text-emerald-600 font-semibold">8,420 units</strong></span>
          </div>
        </div>

        {/* Role Workspace Navigation */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold hidden md:inline">
            Active Role:
          </span>

          <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
            <button
              id="role-btn-owner"
              onClick={() => switchRole('OWNER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRole === 'OWNER'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Owner (Executive Overview)"
            >
              <ShieldCheck size={13} />
              <span>Owner</span>
            </button>

            <button
              id="role-btn-engineer"
              onClick={() => switchRole('ENGINEER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRole === 'ENGINEER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Engineer (3D Command & Diagnostics)"
            >
              <Cpu size={13} />
              <span>Engineer</span>
            </button>

            <button
              id="role-btn-worker"
              onClick={() => switchRole('WORKER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRole === 'WORKER'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Worker (Mobile Field Terminal)"
            >
              <Wrench size={13} />
              <span>Worker</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Active User & Plant Session */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 p-1 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold font-mono text-xs flex items-center justify-center shadow-2xs">
              {currentUser?.avatar || 'US'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 font-sans">
                  {currentUser?.name || 'Authorized Engineer'}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${roleColor} flex items-center gap-1`}>
                  {roleIcon}
                  <span>{currentRole}</span>
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {currentUser?.department || currentUser?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Contextual Incident Chat */}
          <button
            onClick={() => onOpenIncidentChat(activeIncidentId)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Open Contextual Incident Chat"
          >
            <MessageSquare size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">Incident Chat</span>
          </button>

          {/* Role Notifications Drawer Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative cursor-pointer"
              title={`${currentRole} Notifications`}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-slate-500" />
                    <span className="font-bold text-xs text-slate-900 font-sans">
                      {currentRole} Notifications
                    </span>
                  </div>
                  <button
                    onClick={() => clearNotificationsForRole(currentRole)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-700 underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {roleNotifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-mono">
                      No notifications for {currentRole}.
                    </div>
                  ) : (
                    roleNotifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 ${n.read ? 'opacity-60' : 'bg-slate-50/50'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-[11px] ${
                            n.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{n.message}</p>
                        {n.incidentId && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsNotifOpen(false);
                                onOpenIncidentDetail(n.incidentId!);
                              }}
                              className="text-[10px] font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <span>View Incident</span>
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Decision-Support Platform (API-driven, real dataset analytics) */}
          <a
            href="/platform.html"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
            title="Open the Decision-Support Platform: real dataset analytics via FastAPI (dataset, production, bottlenecks, anomalies, simulation)"
          >
            <BarChart3 size={13} className="text-emerald-600" />
            <span className="hidden lg:inline">Platform</span>
          </a>

          {/* Student Lens Guide Launcher */}
          {onOpenAimlGuide && (
            <button
              onClick={() => onOpenAimlGuide()}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
              title="AIML 2nd-Year University Student Reference Guide"
            >
              <Sparkles size={13} className="text-amber-600" />
              <span className="hidden lg:inline">AIML Lens</span>
            </button>
          )}

          {/* Sign out */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Log out of FANTOM Terminal"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
