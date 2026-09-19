import { User, WorkerUser } from '../types';

export interface DemoCredential {
  email: string;
  password: string;
  role: 'OWNER' | 'ENGINEER' | 'WORKER';
  user: User | WorkerUser;
  label: string;
  badge: string;
  description: string;
}

export const DEMO_OWNER: User = {
  id: 'usr-owner-01',
  name: 'Vikramaditya Singhania',
  email: 'owner@fantom.ai',
  role: 'OWNER',
  avatar: 'VS',
  department: 'Executive Operations & Capital Strategy',
  location: 'HQ Plant Command, Bengaluru',
  status: 'ONLINE',
  skills: ['Capital Allocation', 'Operational Margin Analysis', 'Plant Safety Compliance']
};

export const DEMO_ENGINEER: User = {
  id: 'usr-eng-01',
  name: 'Dr. Ananya Ray',
  email: 'engineer@fantom.ai',
  role: 'ENGINEER',
  avatar: 'AR',
  department: 'Advanced Manufacturing Systems & Diagnostics',
  location: 'Telemetry Command Bay 2',
  status: 'ONLINE',
  skills: ['Vibration Spectrum Analysis', '5-Axis CNC Telemetry', 'Root Cause Modeling', 'Digital Twin Simulation']
};

export const DEMO_WORKERS: WorkerUser[] = [
  {
    id: 'usr-wrk-01',
    name: 'Ravi Patel',
    email: 'worker1@fantom.ai',
    role: 'WORKER',
    workerId: 'WRK-01',
    avatar: 'RP',
    department: 'Precision Machining Field Service',
    location: 'Production Zone B (CNC Bay)',
    status: 'ONLINE',
    availability: 'AVAILABLE',
    zone: 'Zone B',
    zoneLocation: { x: 38, y: 15 },
    skills: ['CNC Maintenance', 'Bearing Replacement', 'Spindle Alignment', 'Thermal Recalibration'],
    phone: '+91 98450 12891'
  },
  {
    id: 'usr-wrk-02',
    name: 'Amit Kumar',
    email: 'worker2@fantom.ai',
    role: 'WORKER',
    workerId: 'WRK-02',
    avatar: 'AK',
    department: 'Electrical & Drive Robotics',
    location: 'Production Zone A (In-feed)',
    status: 'BUSY',
    availability: 'BUSY',
    zone: 'Zone A',
    zoneLocation: { x: 71, y: 40 },
    skills: ['Drive Systems', 'Electrical Substation', 'Coolant Pumps'],
    phone: '+91 98450 44219'
  },
  {
    id: 'usr-wrk-03',
    name: 'Suresh Nair',
    email: 'worker3@fantom.ai',
    role: 'WORKER',
    workerId: 'WRK-03',
    avatar: 'SN',
    department: 'Mechanical Tooling & Assembly',
    location: 'Production Zone C (Finish Line)',
    status: 'ONLINE',
    availability: 'AVAILABLE',
    zone: 'Zone C',
    zoneLocation: { x: 54, y: 65 },
    skills: ['Tooling Re-indexing', 'Hydraulics', 'Optical Sensor Calibrations'],
    phone: '+91 98450 78203'
  }
];

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: 'owner@fantom.ai',
    password: 'owner123',
    role: 'OWNER',
    user: DEMO_OWNER,
    label: 'Owner / Executive',
    badge: 'EXECUTIVE',
    description: 'High-level business health, margin waterfall, bottlenecks, approvals, and ROI.'
  },
  {
    email: 'engineer@fantom.ai',
    password: 'engineer123',
    role: 'ENGINEER',
    user: DEMO_ENGINEER,
    label: 'Lead Plant Engineer',
    badge: 'ENGINEERING',
    description: 'Deep 3D digital twin, Bayesian root-cause analysis, simulation lab, and worker dispatch.'
  },
  {
    email: 'worker1@fantom.ai',
    password: 'worker123',
    role: 'WORKER',
    user: DEMO_WORKERS[0],
    label: 'Worker 01 (Ravi Patel)',
    badge: 'ZONE B • CNC EXPERT',
    description: 'Mobile-first operator dashboard: 38m from CNC-04, available for critical dispatch.'
  },
  {
    email: 'worker2@fantom.ai',
    password: 'worker123',
    role: 'WORKER',
    user: DEMO_WORKERS[1],
    label: 'Worker 02 (Amit Kumar)',
    badge: 'ZONE A • BUSY',
    description: 'Field mechatronic currently servicing rough turning infeed (71m away).'
  },
  {
    email: 'worker3@fantom.ai',
    password: 'worker123',
    role: 'WORKER',
    user: DEMO_WORKERS[2],
    label: 'Worker 03 (Suresh Nair)',
    badge: 'ZONE C • AVAILABLE',
    description: 'Assembly line technician located in finish packaging (54m away).'
  }
];
