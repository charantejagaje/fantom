import React, { useState } from 'react';
import { 
  Factory, 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  Bell, 
  MessageSquare, 
  LogOut, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Users,
  ChevronDown,
  Info,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { UserRole } from '../../types';
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
    switchUserById, 
    logout, 
    notifications, 
    markNotificationAsRead, 
    clearNotificationsForRole,
    incidents,
    activeIncidentId
  } = useIndustrialStore();

  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const currentRole = currentUser?.role || 'OWNER';
  const roleNotifications = NotificationService.getNotificationsForRole(notifications, currentRole);
  const unreadCount = NotificationService.getUnreadCount(notifications, currentRole);

  const roleColor = currentRole === 'OWNER'
    ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
    : currentRole === 'ENGINEER'
    ? 'text-blue-500 bg-blue-500/10 border-blue-500/30'
    : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

  const roleIcon = currentRole === 'OWNER'
    ? <ShieldCheck size={15} />
    : currentRole === 'ENGINEER'
    ? <Cpu size={15} />
    : <Wrench size={15} />;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Telemetry & Role Switcher Bar */}
      <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white">FANTOM</span>
            <span className="text-emerald-400">AI</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">| PLANT DIGITAL TWIN</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] font-mono text-slate-400">
            <span>CNC-04: <strong className="text-slate-200 font-semibold">Active</strong></span>
            <span>•</span>
            <span>Shift Target: <strong className="text-emerald-400 font-semibold">8,420 units</strong></span>
          </div>
        </div>

        {/* 1-Click Fast Role Switcher for Hackathon Judges */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold hidden md:inline">
            Active Role:
          </span>

          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 shadow-xs">
            <button
              id="role-btn-owner"
              onClick={() => switchRole('OWNER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'OWNER'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Owner (Executive Overview)"
            >
              <ShieldCheck size={13} />
              <span>Owner</span>
            </button>

            <button
              id="role-btn-engineer"
              onClick={() => switchRole('ENGINEER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'ENGINEER'
                  ? 'bg-blue-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Engineer (3D Command & Diagnostics)"
            >
              <Cpu size={13} />
              <span>Engineer</span>
            </button>

            <button
              id="role-btn-worker"
              onClick={() => switchRole('WORKER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'WORKER'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
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
        {/* Left: Role Identity Pill */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold font-mono text-xs flex items-center justify-center shadow-xs">
                {currentUser?.avatar || 'US'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 font-sans">
                    {currentUser?.name || 'Guest User'}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${roleColor} flex items-center gap-1`}>
                    {roleIcon}
                    <span>{currentRole}</span>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {currentUser?.department || currentUser?.email}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>

            {/* Quick Switch Accounts Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-100">
                  Switch Worker / Account
                </div>
                <button
                  onClick={() => { switchRole('OWNER'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">Vikramaditya (Owner)</div>
                    <div className="text-[10px] text-slate-500">Executive Plant Operations</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">OWNER</span>
                </button>

                <button
                  onClick={() => { switchRole('ENGINEER'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">Dr. Ananya Ray (Engineer)</div>
                    <div className="text-[10px] text-slate-500">Advanced Manufacturing & Twin</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">ENGINEER</span>
                </button>

                <div className="my-1 border-t border-slate-100" />
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Worker Accounts (Locations):
                </div>

                <button
                  onClick={() => { switchUserById('usr-wrk-01'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">Ravi Patel (Worker 01)</div>
                    <div className="text-[10px] text-slate-500">Zone B • CNC Expert (38m to CNC-04)</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">WRK-01</span>
                </button>

                <button
                  onClick={() => { switchUserById('usr-wrk-02'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">Amit Kumar (Worker 02)</div>
                    <div className="text-[10px] text-slate-500">Zone A • Electrical / Drive</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">WRK-02</span>
                </button>

                <button
                  onClick={() => { switchUserById('usr-wrk-03'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">Suresh Nair (Worker 03)</div>
                    <div className="text-[10px] text-slate-500">Zone C • Tooling & Assembly</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">WRK-03</span>
                </button>

                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => { logout(); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold"
                >
                  <LogOut size={13} />
                  <span>Sign Out of Terminal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Deterministic Cross-Role Demo Scenario Trigger */}
          {onRunCrossRoleDemo && (
            <button
              onClick={onRunCrossRoleDemo}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              title="Run end-to-end incident dispatch & collaboration flow"
            >
              <Play size={13} fill="currentColor" />
              <span className="hidden sm:inline">3-Role Demo Tour</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}

          {/* Contextual Incident Chat */}
          <button
            onClick={() => onOpenIncidentChat(activeIncidentId)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Open Contextual Incident Chat (Owner ↔ Engineer ↔ Worker)"
          >
            <MessageSquare size={16} className="text-emerald-600" />
            <span className="hidden md:inline">Incident Chat</span>
          </button>

          {/* Role Notifications Drawer Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative"
              title={`${currentRole} Notifications`}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
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
