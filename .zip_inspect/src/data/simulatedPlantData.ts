import { 
  SimulatedPlantArea, 
  SimulatedBatch, 
  SimulatedInspectionImage, 
  EngineeringActionRecord, 
  SimulatedWorkerInstruction,
  DefectPatternData 
} from '../types/simulatedPlant';

export const INITIAL_SIMULATED_AREAS: SimulatedPlantArea[] = [
  {
    id: 'AREA-01',
    name: 'Incoming Material',
    line: 'Line 01 (Infeed Bay)',
    currentBatch: 'B-2051',
    productsProcessed: 320,
    defectsDetected: 2,
    criticalDefects: 0,
    qualityStatus: 'NORMAL',
    inspectionStatus: 'ACTIVE',
    productionStatus: 'RUNNING',
    operatorInCharge: 'M. Vance (Infeed Specialist)',
    cycleTimeSec: 14.2,
    lastInspectionTime: '10:48 AM'
  },
  {
    id: 'AREA-02',
    name: 'Machining',
    line: 'Line 02 (CNC Milling Cell)',
    currentBatch: 'B-2049',
    productsProcessed: 280,
    defectsDetected: 6,
    criticalDefects: 1,
    qualityStatus: 'WATCH',
    inspectionStatus: 'ACTIVE',
    productionStatus: 'RUNNING',
    operatorInCharge: 'R. Kowalski (Lead Machinist)',
    cycleTimeSec: 28.5,
    lastInspectionTime: '10:49 AM'
  },
  {
    id: 'AREA-03',
    name: 'Surface Processing',
    line: 'Line 02 (Chemical & Blast)',
    currentBatch: 'B-2048',
    productsProcessed: 240,
    defectsDetected: 5,
    criticalDefects: 1,
    qualityStatus: 'WARNING',
    inspectionStatus: 'ELEVATED',
    productionStatus: 'RUNNING',
    operatorInCharge: 'S. Chen (Surface Tech)',
    cycleTimeSec: 22.0,
    lastInspectionTime: '10:50 AM'
  },
  {
    id: 'AREA-04',
    name: 'Assembly',
    line: 'Line 03 (Precision Cell)',
    currentBatch: 'B-2047',
    productsProcessed: 195,
    defectsDetected: 3,
    criticalDefects: 0,
    qualityStatus: 'NORMAL',
    inspectionStatus: 'ACTIVE',
    productionStatus: 'RUNNING',
    operatorInCharge: 'A. Patel (Assembly Lead)',
    cycleTimeSec: 34.1,
    lastInspectionTime: '10:46 AM'
  },
  {
    id: 'AREA-05',
    name: 'Quality Inspection',
    line: 'Line 02 (AOI Optical Bay)',
    currentBatch: 'B-2048',
    productsProcessed: 180,
    defectsDetected: 8,
    criticalDefects: 2,
    qualityStatus: 'WARNING',
    inspectionStatus: 'ELEVATED',
    productionStatus: 'RUNNING',
    operatorInCharge: 'K. Lindqvist (Senior QA)',
    cycleTimeSec: 18.3,
    lastInspectionTime: '10:51 AM'
  },
  {
    id: 'AREA-06',
    name: 'Final Inspection',
    line: 'Line 02 (High-Res Verification)',
    currentBatch: 'B-2048',
    productsProcessed: 120,
    defectsDetected: 9,
    criticalDefects: 3,
    qualityStatus: 'STOP RECOMMENDED',
    inspectionStatus: 'HOLD',
    productionStatus: 'UNDER REVIEW',
    operatorInCharge: 'T. Becker (Quality Inspector)',
    cycleTimeSec: 21.4,
    lastInspectionTime: '10:52 AM'
  },
  {
    id: 'AREA-07',
    name: 'Packaging',
    line: 'Line 03 (Automated Crate Bay)',
    currentBatch: 'B-2045',
    productsProcessed: 110,
    defectsDetected: 1,
    criticalDefects: 0,
    qualityStatus: 'NORMAL',
    inspectionStatus: 'ACTIVE',
    productionStatus: 'RUNNING',
    operatorInCharge: 'J. Davis (Dispatch Logistics)',
    cycleTimeSec: 12.8,
    lastInspectionTime: '10:45 AM'
  }
];

export const INITIAL_SIMULATED_BATCHES: SimulatedBatch[] = [
  {
    id: 'B-2048',
    batchNumber: 'B-2048',
    component: 'Metal Housing (Aviation Grade)',
    productionLine: 'Line 02',
    inspectionArea: 'Final Inspection',
    totalInspected: 120,
    passed: 111,
    defects: 9,
    critical: 3,
    attentionCount: 4,
    qualityStatus: 'STOP RECOMMENDED',
    productionStatus: 'UNDER REVIEW',
    crackCount: 3,
    startTime: '08:00 AM',
    notes: 'Repeated crack pattern flagged by AI optical system. Engineering review recommended.'
  },
  {
    id: 'B-2047',
    batchNumber: 'B-2047',
    component: 'Turbine Impeller (Variant B)',
    productionLine: 'Line 02',
    inspectionArea: 'Machining',
    totalInspected: 150,
    passed: 144,
    defects: 6,
    critical: 1,
    attentionCount: 3,
    qualityStatus: 'WATCH',
    productionStatus: 'RUNNING',
    crackCount: 1,
    startTime: '06:30 AM',
    notes: 'Single surface scratch identified during rough deburr pass. Normal disposition applied.'
  },
  {
    id: 'B-2046',
    batchNumber: 'B-2046',
    component: 'Bearing Housing Ring',
    productionLine: 'Line 01',
    inspectionArea: 'Surface Processing',
    totalInspected: 180,
    passed: 178,
    defects: 2,
    critical: 0,
    attentionCount: 2,
    qualityStatus: 'NORMAL',
    productionStatus: 'RUNNING',
    crackCount: 0,
    startTime: '04:00 AM',
    notes: 'Nominal surface roughness maintained. Batch verified clean.'
  },
  {
    id: 'B-2045',
    batchNumber: 'B-2045',
    component: 'Cylinder Head Manifold',
    productionLine: 'Line 03',
    inspectionArea: 'Assembly',
    totalInspected: 95,
    passed: 93,
    defects: 2,
    critical: 0,
    attentionCount: 1,
    qualityStatus: 'NORMAL',
    productionStatus: 'RUNNING',
    crackCount: 0,
    startTime: '02:00 AM',
    notes: 'Minor gasket alignment tolerance alert cleared after visual re-check.'
  }
];

export const INITIAL_SIMULATED_IMAGES: SimulatedInspectionImage[] = [
  // BATCH B-2048 (Final Inspection & Surface Processing)
  {
    id: 'IMG-2048-01',
    plantAreaId: 'AREA-06',
    plantAreaName: 'Final Inspection',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'CRITICAL',
    defectType: 'Thermal Surface Crack',
    severity: 'CRITICAL',
    confidenceScore: 94,
    imageUrl: '/assets/neu_det/crazing_1.jpg',
    inspectionTimestamp: '10:41 AM',
    summary: 'A visible linear discontinuity appears across the machined flange radius.',
    visualEvidence: [
      'High-contrast branching fissures matching thermal fatigue cracking',
      'Discontinuity length measured at 14.2mm along structural stress plane',
      'Surface contrast ratio exceeds critical acceptance limit by 42%'
    ],
    possibleCauses: [
      'Excessive mechanical stress during clamping',
      'Rapid thermal gradient between cooling spray and tool contact',
      'Contact damage from guide roller mispositioning'
    ],
    recommendedNextStep: 'Inspect the affected component and compare the indication against the applicable quality limit. Pause Line 02 to check tool pressure.',
    isCrack: true,
    requiresReview: true
  },
  {
    id: 'IMG-2048-02',
    plantAreaId: 'AREA-06',
    plantAreaName: 'Final Inspection',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'CRITICAL',
    defectType: 'Surface Micro-Crack Cluster',
    severity: 'CRITICAL',
    confidenceScore: 92,
    imageUrl: '/assets/neu_det/crazing_2.jpg',
    inspectionTimestamp: '10:44 AM',
    summary: 'Secondary visible crack formation detected on adjacent component face.',
    visualEvidence: [
      'Interconnected micro-crack web in identical geometric coordinate zone',
      'Indicates repeated thermal/mechanical stress pattern on Line 02',
      'High acoustic emission correlation detected at spindle 4'
    ],
    possibleCauses: [
      'Spindle chatter harmonic vibration at 12,800 RPM',
      'Coolant nozzle flow obstruction causing cyclic overheating',
      'Material batch inclusion notch-sensitivity'
    ],
    recommendedNextStep: 'Quarantine part. Recommend simulated line pause to prevent crack propagation across remaining batch units.',
    isCrack: true,
    requiresReview: true
  },
  {
    id: 'IMG-2048-03',
    plantAreaId: 'AREA-05',
    plantAreaName: 'Quality Inspection',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'CRITICAL',
    defectType: 'Structural Stress Crack',
    severity: 'CRITICAL',
    confidenceScore: 96,
    imageUrl: '/assets/neu_det/scratches_2.jpg',
    inspectionTimestamp: '10:47 AM',
    summary: 'Severe linear fracture notch detected near mounting lug.',
    visualEvidence: [
      'Deep grooving with clear jagged edge profile',
      'Penetration depth estimated at 0.45mm (> 0.20mm allowable spec)',
      'Third crack indication in Batch B-2048 within 15 minutes'
    ],
    possibleCauses: [
      'Carbide insert chipping on tool station T04',
      'Debris jammed between guide shoe and workpiece',
      'Feed-rate overdrive during roughing cycle'
    ],
    recommendedNextStep: 'Issue immediate simulated hold for Batch B-2048. Escalate to Chief Quality Engineer.',
    isCrack: true,
    requiresReview: true
  },
  {
    id: 'IMG-2048-04',
    plantAreaId: 'AREA-03',
    plantAreaName: 'Surface Processing',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'DEFECTIVE',
    defectType: 'Abrasive Scratching',
    severity: 'WARNING',
    confidenceScore: 88,
    imageUrl: '/assets/neu_det/scratches_1.jpg',
    inspectionTimestamp: '10:35 AM',
    summary: 'Longitudinal friction marks along outer housing wall.',
    visualEvidence: [
      'Parallel scratch lines along feed direction',
      'Surface roughness exceeds Ra 1.8µm specification'
    ],
    possibleCauses: [
      'Hard particulate swarf caught on transfer rail',
      'Pinch roll surface wear'
    ],
    recommendedNextStep: 'Clean transfer rail and perform buffing re-check.',
    isCrack: false,
    requiresReview: true
  },
  {
    id: 'IMG-2048-05',
    plantAreaId: 'AREA-05',
    plantAreaName: 'Quality Inspection',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'DEFECTIVE',
    defectType: 'Oxide Scale Patches',
    severity: 'WARNING',
    confidenceScore: 89,
    imageUrl: '/assets/neu_det/patches_1.jpg',
    inspectionTimestamp: '10:30 AM',
    summary: 'Uneven dark oxide scale accumulation across sheet boundary.',
    visualEvidence: [
      'Non-uniform optical reflectance pattern',
      'Localized descaling nozzle pressure deficiency'
    ],
    possibleCauses: [
      'Descaling spray header nozzle clogging',
      'Furnace exit temperature variance'
    ],
    recommendedNextStep: 'Send for secondary pickling pass.',
    isCrack: false,
    requiresReview: false
  },
  {
    id: 'IMG-2048-06',
    plantAreaId: 'AREA-06',
    plantAreaName: 'Final Inspection',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'ATTENTION',
    defectType: 'Surface Color Variation',
    severity: 'LOW',
    confidenceScore: 78,
    imageUrl: '/assets/neu_det/patches_2.jpg',
    inspectionTimestamp: '10:25 AM',
    summary: 'Minor visual shading difference without structural defect.',
    visualEvidence: [
      'Slight optical hue variation on edge',
      'Within allowable non-functional tolerance'
    ],
    possibleCauses: [
      'Coolant film drying marks',
      'Ambient lighting strobe shadow'
    ],
    recommendedNextStep: 'Log for monitoring. No immediate part rejection required.',
    isCrack: false,
    requiresReview: false
  },
  {
    id: 'IMG-2048-07',
    plantAreaId: 'AREA-06',
    plantAreaName: 'Final Inspection',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'GOOD',
    defectType: 'Clean Surface Specimen',
    severity: 'NORMAL',
    confidenceScore: 99,
    imageUrl: '/assets/neu_det/normal_reference_1.jpg',
    inspectionTimestamp: '10:15 AM',
    summary: 'Uniform surface finish complying with dimensional tolerance.',
    visualEvidence: [
      'Homogeneous grain structure',
      'No visual discontinuities, cracks, or pits detected'
    ],
    possibleCauses: [
      'Optimal machining conditions'
    ],
    recommendedNextStep: 'Approve and advance along conveyor.',
    isCrack: false,
    requiresReview: false
  },
  {
    id: 'IMG-2048-08',
    plantAreaId: 'AREA-06',
    plantAreaName: 'Final Inspection',
    productionLine: 'Line 02',
    batchNumber: 'B-2048',
    component: 'Metal Housing',
    qualityGroup: 'GOOD',
    defectType: 'Nominal Specimen',
    severity: 'NORMAL',
    confidenceScore: 98,
    imageUrl: '/assets/neu_det/normal_reference_1.jpg',
    inspectionTimestamp: '10:10 AM',
    summary: 'Complies with all surface inspection standards.',
    visualEvidence: [
      'Optical contrast nominal across 100% surface'
    ],
    possibleCauses: [],
    recommendedNextStep: 'Advance to packaging.',
    isCrack: false,
    requiresReview: false
  },

  // BATCH B-2047 (Machining & Pre-Form)
  {
    id: 'IMG-2047-01',
    plantAreaId: 'AREA-02',
    plantAreaName: 'Machining',
    productionLine: 'Line 02',
    batchNumber: 'B-2047',
    component: 'Turbine Impeller',
    qualityGroup: 'CRITICAL',
    defectType: 'Single Surface Micro-Crack',
    severity: 'CRITICAL',
    confidenceScore: 91,
    imageUrl: '/assets/neu_det/crazing_1.jpg',
    inspectionTimestamp: '07:15 AM',
    summary: 'Isolated hairline indication on trailing blade edge.',
    visualEvidence: [
      'Single linear discontinuity detected',
      'No secondary indications found in surrounding batch units'
    ],
    possibleCauses: [
      'Isolated localized casting void',
      'Tool touch-off error'
    ],
    recommendedNextStep: 'Perform ultrasonic depth verification.',
    isCrack: true,
    requiresReview: true
  },
  {
    id: 'IMG-2047-02',
    plantAreaId: 'AREA-02',
    plantAreaName: 'Machining',
    productionLine: 'Line 02',
    batchNumber: 'B-2047',
    component: 'Turbine Impeller',
    qualityGroup: 'DEFECTIVE',
    defectType: 'Pitted Surface Cavitation',
    severity: 'WARNING',
    confidenceScore: 86,
    imageUrl: '/assets/neu_det/pitted_surface_1.jpg',
    inspectionTimestamp: '06:45 AM',
    summary: 'Micron-scale pitting on blade root surface.',
    visualEvidence: [
      'Pitting clusters on suction side',
      'Depth measured below critical threshold'
    ],
    possibleCauses: [
      'Chemical over-etching in pre-wash'
    ],
    recommendedNextStep: 'Rework surface via skin-pass buffing.',
    isCrack: false,
    requiresReview: false
  },
  {
    id: 'IMG-2047-03',
    plantAreaId: 'AREA-02',
    plantAreaName: 'Machining',
    productionLine: 'Line 02',
    batchNumber: 'B-2047',
    component: 'Turbine Impeller',
    qualityGroup: 'GOOD',
    defectType: 'Nominal Blade Pass',
    severity: 'NORMAL',
    confidenceScore: 99,
    imageUrl: '/assets/neu_det/normal_reference_1.jpg',
    inspectionTimestamp: '06:30 AM',
    summary: 'Flawless airfoil finish complying with specification.',
    visualEvidence: ['Smooth profile, zero defect indications.'],
    possibleCauses: [],
    recommendedNextStep: 'Pass to next station.',
    isCrack: false,
    requiresReview: false
  },

  // BATCH B-2046 (Surface Processing)
  {
    id: 'IMG-2046-01',
    plantAreaId: 'AREA-03',
    plantAreaName: 'Surface Processing',
    productionLine: 'Line 01',
    batchNumber: 'B-2046',
    component: 'Bearing Housing Ring',
    qualityGroup: 'ATTENTION',
    defectType: 'Minor Slag Inclusion',
    severity: 'LOW',
    confidenceScore: 82,
    imageUrl: '/assets/neu_det/inclusion_1.jpg',
    inspectionTimestamp: '04:45 AM',
    summary: 'Sub-millimeter non-metallic inclusion trapped on outer chamfer.',
    visualEvidence: ['Small dark spot outside critical sealing perimeter.'],
    possibleCauses: ['Refractory particle in raw cast.'],
    recommendedNextStep: 'Acceptable under Class-2 industrial standards.',
    isCrack: false,
    requiresReview: false
  },
  {
    id: 'IMG-2046-02',
    plantAreaId: 'AREA-03',
    plantAreaName: 'Surface Processing',
    productionLine: 'Line 01',
    batchNumber: 'B-2046',
    component: 'Bearing Housing Ring',
    qualityGroup: 'GOOD',
    defectType: 'Approved Ring Surface',
    severity: 'NORMAL',
    confidenceScore: 97,
    imageUrl: '/assets/neu_det/normal_reference_1.jpg',
    inspectionTimestamp: '04:15 AM',
    summary: 'All optical verification criteria satisfied.',
    visualEvidence: ['Uniform finish.'],
    possibleCauses: [],
    recommendedNextStep: 'Advance to assembly.',
    isCrack: false,
    requiresReview: false
  }
];

export const INITIAL_DEFECT_PATTERNS: DefectPatternData = {
  defectName: 'Surface Cracks & Thermal Fissures',
  batchHistory: [
    { batchNumber: 'B-2046', detectedCount: 0, severity: 'NORMAL' },
    { batchNumber: 'B-2047', detectedCount: 1, severity: 'NORMAL' },
    { batchNumber: 'B-2048', detectedCount: 3, severity: 'CRITICAL' }
  ],
  observation: 'Crack frequency has surged by 300% in the current active batch (B-2048) on Line 02.',
  recommendation: 'Repeated defect pattern detected. Review the affected process and inspect additional components. Production stop is recommended for engineering review.',
  isRepeatedPattern: true
};

export const INITIAL_ENGINEERING_ACTIONS: EngineeringActionRecord[] = [
  {
    id: 'ACT-901',
    timestamp: '10:42 AM',
    engineerAction: 'Batch placed on simulated hold',
    batchNumber: 'B-2048',
    productionLine: 'Line 02',
    reason: 'Repeated crack indications detected by optical camera',
    result: 'SIMULATED',
    details: 'Triggered inspection elevation and worker dispatch.'
  },
  {
    id: 'ACT-902',
    timestamp: '10:45 AM',
    engineerAction: 'Additional inspection requested',
    batchNumber: 'B-2048',
    productionLine: 'Line 02',
    reason: 'Critical defect alert on Final Inspection stage',
    result: 'SIMULATED',
    details: 'Increased strobe frequency on camera 06.'
  }
];

export const INITIAL_WORKER_INSTRUCTIONS: SimulatedWorkerInstruction[] = [
  {
    id: 'WINSTR-101',
    timestamp: '10:43 AM',
    area: 'Final Inspection',
    batchNumber: 'B-2048',
    instructionText: 'Hold affected components and send them for engineering review.',
    status: 'SIMULATED COMMAND',
    priority: 'CRITICAL'
  },
  {
    id: 'WINSTR-102',
    timestamp: '10:46 AM',
    area: 'Quality Inspection',
    batchNumber: 'B-2048',
    instructionText: 'Perform reinspection of Line 02 output before releasing downstream.',
    status: 'SIMULATED COMMAND',
    priority: 'URGENT'
  }
];
