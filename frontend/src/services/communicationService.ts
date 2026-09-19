import { IncidentMessage, UserRole } from '../types';

export const INITIAL_INCIDENT_MESSAGES: IncidentMessage[] = [
  {
    id: 'msg-01',
    incidentId: 'INC-0042',
    senderId: 'system-ai',
    senderName: 'FANTOM Sentinel AI',
    senderRole: 'ENGINEER',
    type: 'AI_ALERT',
    message: 'CRITICAL ANOMALY: Station 03 Bearing #02 vibration spiked to 6.8 mm/s. Correlation r = 0.94 with Variant B chatter defects.',
    timestamp: '12m ago'
  },
  {
    id: 'msg-02',
    incidentId: 'INC-0042',
    senderId: 'usr-owner-01',
    senderName: 'Vikramaditya Singhania (Owner)',
    senderRole: 'OWNER',
    type: 'TEXT',
    message: 'What is the estimated production impact on the shift margin?',
    timestamp: '10m ago'
  },
  {
    id: 'msg-03',
    incidentId: 'INC-0042',
    senderId: 'usr-eng-01',
    senderName: 'Dr. Ananya Ray (Lead Engineer)',
    senderRole: 'ENGINEER',
    type: 'TEXT',
    message: 'Station 03 utilization is at 96.4% with 142 units buffered in queue. Total shift run loss is projecting at -$116,100 if unaddressed. I am dispatching technician Ravi Patel from Zone B immediately.',
    timestamp: '8m ago'
  },
  {
    id: 'msg-04',
    incidentId: 'INC-0042',
    senderId: 'system-dispatch',
    senderName: 'Dispatch Engine',
    senderRole: 'ENGINEER',
    type: 'SYSTEM',
    message: 'Worker WRK-01 (Ravi Patel) accepted maintenance task. Distance: 38m, ETA: 45s.',
    timestamp: '6m ago'
  },
  {
    id: 'msg-05',
    incidentId: 'INC-0042',
    senderId: 'usr-wrk-01',
    senderName: 'Ravi Patel (Worker 01)',
    senderRole: 'WORKER',
    type: 'TEXT',
    message: "I've reached CNC-04 and initiated Lockout / Tagout (LOTO) safety protocol. Ready for spindle inspection.",
    timestamp: '4m ago'
  },
  {
    id: 'msg-06',
    incidentId: 'INC-0042',
    senderId: 'usr-eng-01',
    senderName: 'Dr. Ananya Ray (Lead Engineer)',
    senderRole: 'ENGINEER',
    type: 'TEXT',
    message: 'Please inspect Bearing #02 first using the handheld triaxial contact sensor.',
    timestamp: '3m ago'
  }
];

export class CommunicationService {
  static getInitialMessages(): IncidentMessage[] {
    return [...INITIAL_INCIDENT_MESSAGES];
  }

  static getMessagesByIncident(messages: IncidentMessage[], incidentId: string): IncidentMessage[] {
    return messages.filter((m) => m.incidentId === incidentId);
  }

  static createMessage(
    incidentId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    text: string,
    type: 'TEXT' | 'SYSTEM' | 'STATUS_UPDATE' | 'AI_ALERT' = 'TEXT'
  ): IncidentMessage {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      incidentId,
      senderId,
      senderName,
      senderRole,
      message: text,
      timestamp: 'Just now',
      type
    };
  }
}
