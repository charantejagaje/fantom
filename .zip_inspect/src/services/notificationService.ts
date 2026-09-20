import { RoleNotification, UserRole } from '../types';

export const INITIAL_NOTIFICATIONS: RoleNotification[] = [
  // Owner notifications
  {
    id: 'notif-own-01',
    role: 'OWNER',
    title: 'Critical EBIT Margin Erosion',
    message: 'Station 03 bottleneck causing projected -$116,100 shift margin erosion across 142 buffered units.',
    timestamp: '12m ago',
    read: false,
    severity: 'CRITICAL',
    incidentId: 'INC-0042',
    actionLabel: 'Review Impact'
  },
  {
    id: 'notif-own-02',
    role: 'OWNER',
    title: 'Engineering Recommendation Pending Approval',
    message: 'Dr. Ray submitted recommendation: Shift 25% passes from S03 to S04 to recover +$38,400/shift.',
    timestamp: '8m ago',
    read: false,
    severity: 'WARNING',
    actionLabel: 'Approve Recommendation'
  },
  // Engineer notifications
  {
    id: 'notif-eng-01',
    role: 'ENGINEER',
    title: 'High-Harmonic Resonance Alert (S03)',
    message: 'Spindle Bearing #02 accelerometer measured 6.8 mm/s vibration at 3,450 RPM.',
    timestamp: '15m ago',
    read: false,
    severity: 'CRITICAL',
    incidentId: 'INC-0042',
    actionLabel: 'Inspect 3D Twin'
  },
  {
    id: 'notif-eng-02',
    role: 'ENGINEER',
    title: 'Technician Ravi Patel Dispatched',
    message: 'Technician accepted dispatch to CNC-04. Current transit distance: 38 meters.',
    timestamp: '6m ago',
    read: false,
    severity: 'INFO',
    incidentId: 'INC-0042',
    actionLabel: 'Open Field Comms'
  },
  // Worker notifications
  {
    id: 'notif-wrk-01',
    role: 'WORKER',
    title: 'URGENT: Maintenance Task Assigned',
    message: 'CNC-04 Spindle Bearing Anomaly in Zone B (38m away). Priority: HIGH.',
    timestamp: '6m ago',
    read: false,
    severity: 'CRITICAL',
    incidentId: 'INC-0042',
    actionLabel: 'View Task'
  },
  {
    id: 'notif-wrk-02',
    role: 'WORKER',
    title: 'Lead Engineer Instruction Received',
    message: 'Dr. Ray: "Please inspect Bearing #02 first using handheld contact sensor."',
    timestamp: '3m ago',
    read: false,
    severity: 'INFO',
    incidentId: 'INC-0042',
    actionLabel: 'Open Comms'
  }
];

export class NotificationService {
  static getNotificationsForRole(notifications: RoleNotification[], role: UserRole): RoleNotification[] {
    return notifications.filter((n) => n.role === role || n.role === 'ALL');
  }

  static getUnreadCount(notifications: RoleNotification[], role: UserRole): number {
    return this.getNotificationsForRole(notifications, role).filter((n) => !n.read).length;
  }

  static createNotification(
    role: UserRole | 'ALL',
    title: string,
    message: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS' = 'INFO',
    incidentId?: string,
    actionLabel?: string
  ): RoleNotification {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      severity,
      incidentId,
      actionLabel
    };
  }
}
