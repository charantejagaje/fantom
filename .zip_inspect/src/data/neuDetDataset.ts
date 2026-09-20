/**
 * NEU-DET Industrial Steel Surface Defect Dataset
 * Real dataset images and ground-truth Pascal VOC XML annotations
 * Source: Northeastern University (NEU) Surface Defect Database
 * 
 * 6 Defect Classes:
 * 1. Scratches (Sc) - Linear abrasive scoring
 * 2. Patches (Pa) - Irregular oxidized or rolled-over patches
 * 3. Inclusion (In) - Non-metallic slag/oxide inclusions
 * 4. Crazing (Cr) - Network of microscopic thermal/mechanical cracks
 * 5. Rolled-in Scale (RS) - Compressed iron oxide scale pressed into strip
 * 6. Pitted Surface (PS) - Cavities and pinholes from roll wear
 * 
 * Plus authentic Normal Reference samples and Uncertain (borderline) samples.
 */

export interface BoundingBox {
  id: string;
  name: string;
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  confidence?: number;
}

export type NeuDetBoundingBox = BoundingBox;

export interface ContributingFactor {
  factor: string;
  subsystem: 'Tooling & Rollers' | 'Tribology / Lubrication' | 'Thermal Controls' | 'Feed & Tension';
  observedEvidence: string;
  associationStrength: number; // e.g. 88%
  verificationStep: string;
}

export type NeuDetContributingFactor = ContributingFactor;

export type InspectionStatus = 'NORMAL' | 'DEFECTIVE' | 'UNCERTAIN';

export interface NeuDetSample {
  id: string;
  sampleCode: string;
  filename: string;
  localImageUrl: string;
  remoteImageUrl: string;
  normalReferenceUrl: string;
  width: number;
  height: number;
  defectClass: 'scratches' | 'patches' | 'inclusion' | 'crazing' | 'rolled-in_scale' | 'pitted_surface' | 'normal';
  defectLabel: string;
  status: InspectionStatus;
  confidence: number; // 0.0 - 1.0
  boundingBoxes: BoundingBox[];
  
  // Metadata & Context
  batchId: string;
  productionStationId: string;
  productionStationName: string;
  inspectionTimestamp: string;
  materialGrade: string;

  // Explainability & Detection Evidence (Why was this detected?)
  whyDetectedExplanation: string;
  detectionEvidence: string[];
  
  // 4-Tier Epistemological Distinction (Mandatory: do not claim correlation is proven root cause)
  epistemology: {
    observedEvidence: string;
    modelPrediction: string;
    statisticalAssociation: string;
    simulationHypothesis: string;
    causationCaveat: string;
  };

  // Related Process Telemetry at time of inspection
  processTelemetry: {
    cycleTimeSec: number;
    nominalCycleSec: number;
    stationDowntimeMinutes: number;
    lineSpeedMpm: number;
    rollPressureMpa: number;
    lubricantFlowLpm: number;
    rollTemperatureCelsius: number;
    vibrationRmsMmSec: number;
  };

  // Possible Contributing Factors
  possibleContributingFactors: Array<{
    factor: string;
    subsystem: 'Tooling & Rollers' | 'Tribology / Lubrication' | 'Thermal Controls' | 'Feed & Tension';
    observedEvidence: string;
    associationStrength: number; // e.g. 88%
    verificationStep: string;
  }>;

  // Business Impact
  businessImpact: {
    scrapCostPerCoilUsd: number;
    reworkCostPerCoilUsd: number;
    affectedMeters: number;
    batchHoldRecommended: boolean;
    executiveSummary: string;
  };

  // Recommended Simulation
  recommendedSimulation: {
    title: string;
    targetStationId: string;
    actionDescription: string;
    proposedParameters: {
      loadBalanceShiftPct?: number;
      feedRateOptimizationPct?: number;
      targetDefectRatePct?: number;
    };
  };
}

export const NEU_DET_SAMPLES: NeuDetSample[] = [
  {
    id: 'SAMPLE-NEU-SC-204',
    sampleCode: 'NEU-DET-SC-001',
    filename: 'scratches_1.jpg',
    localImageUrl: '/assets/neu_det/scratches_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/scratches_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'scratches',
    defectLabel: 'Scratch',
    status: 'DEFECTIVE',
    confidence: 0.94,
    boundingBoxes: [
      {
        id: 'box-sc1-1',
        name: 'scratches',
        xmin: 26,
        ymin: 12,
        xmax: 43,
        ymax: 171,
        confidence: 0.95
      },
      {
        id: 'box-sc1-2',
        name: 'scratches',
        xmin: 8,
        ymin: 184,
        xmax: 17,
        ymax: 196,
        confidence: 0.88
      }
    ],
    batchId: 'B-204',
    productionStationId: 'S04',
    productionStationName: 'Inspection Station 04',
    inspectionTimestamp: '2026-09-19 14:32:08 UTC',
    materialGrade: 'Cold-Rolled Strip AISI 304',
    whyDetectedExplanation: 'Linear specular aberration aligned with cold-roll feed direction, causing localized reflectance drop of 41% across high-contrast pixel boundaries.',
    detectionEvidence: [
      'Abnormal surface region detected: Continuous linear gradient fissure running vertically through coordinates (X:26-43, Y:12-171).',
      'Region localized using available annotation/detection information: Dual bounding box proposals match mechanical scoring geometry.',
      'Pattern differs from normal reference samples: Isotropic baseline texture replaced by sharp directional abrasive score lines.'
    ],
    epistemology: {
      observedEvidence: 'High-speed CCD line sensor (AOI-CAM-04) captured a high-contrast dark striation 159px in length with a pixel intensity dip from 148 to 62 DN.',
      modelPrediction: 'YOLOv8-NEU backbone predicts surface defect category "Scratch" with 94.2% posterior confidence; bounding box IoU 0.91 against annotation ground-truth.',
      statisticalAssociation: 'Historically associated with roller guide misalignment or debris entrapment at Station 04 (Pearson correlation r = 0.88 with low lubricant pressure).',
      simulationHypothesis: 'Counterfactual dynamic model indicates a 15% reduction in roll tension and nozzle de-clogging will arrest scratch propagation on subsequent coils.',
      causationCaveat: 'Statistical association is NOT proven causation. The optical scratch may stem from guide burrs, roll debris, or coil uncoiler slip. Physical confirmation required.'
    },
    processTelemetry: {
      cycleTimeSec: 4.8,
      nominalCycleSec: 4.2,
      stationDowntimeMinutes: 14,
      lineSpeedMpm: 120,
      rollPressureMpa: 14.2,
      lubricantFlowLpm: 18.5,
      rollTemperatureCelsius: 64.2,
      vibrationRmsMmSec: 5.8
    },
    possibleContributingFactors: [
      {
        factor: 'Roller Guide Plate Burr',
        subsystem: 'Tooling & Rollers',
        observedEvidence: 'Fixed spatial position of score line along X: 30-40px matches physical lateral offset of Entry Guide B-4.',
        associationStrength: 86,
        verificationStep: 'Physically inspect entry side guide plate for localized galling or metal pickup.'
      },
      {
        factor: 'Lubricant Film Thinning',
        subsystem: 'Tribology / Lubrication',
        observedEvidence: 'Lubricant flow rate dipped from nominal 28.0 L/min to 18.5 L/min during Batch B-204.',
        associationStrength: 78,
        verificationStep: 'Check supply manifold filter delta-P and nozzle spray fan geometry.'
      },
      {
        factor: 'Hard Particulate Entrapment',
        subsystem: 'Feed & Tension',
        observedEvidence: 'Secondary scratch fragment at bottom (Y:184-196) suggests rolled fragment drag.',
        associationStrength: 64,
        verificationStep: 'Inspect strip wipe-felt boxes before cold reduction stand.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 1850,
      reworkCostPerCoilUsd: 420,
      affectedMeters: 450,
      batchHoldRecommended: true,
      executiveSummary: 'Batch B-204 quarantined. Immediate tooling check recommended to avoid $18,500 total coil scrap on this production run.'
    },
    recommendedSimulation: {
      title: 'Station 04 Roll Gap & Flow Recalibration',
      targetStationId: 'S04',
      actionDescription: 'Test counterfactual simulation with restored lubricant flow (+35%) and load rebalancing to bypass cold finish pinch.',
      proposedParameters: {
        loadBalanceShiftPct: 15,
        feedRateOptimizationPct: -8,
        targetDefectRatePct: 0.8
      }
    }
  },
  {
    id: 'SAMPLE-NEU-SC-205',
    sampleCode: 'NEU-DET-SC-002',
    filename: 'scratches_2.jpg',
    localImageUrl: '/assets/neu_det/scratches_2.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/scratches_2.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'scratches',
    defectLabel: 'Deep Longitudinal Scratch',
    status: 'DEFECTIVE',
    confidence: 0.96,
    boundingBoxes: [
      {
        id: 'box-sc2-1',
        name: 'scratches',
        xmin: 92,
        ymin: 24,
        xmax: 106,
        ymax: 176,
        confidence: 0.96
      }
    ],
    batchId: 'B-204',
    productionStationId: 'S04',
    productionStationName: 'Inspection Station 04',
    inspectionTimestamp: '2026-09-19 14:38:22 UTC',
    materialGrade: 'Cold-Rolled Strip AISI 304',
    whyDetectedExplanation: 'Centered vertical furrow spanning 152 pixels with severe luminance loss and raised micro-burr reflections on furrow flanks.',
    detectionEvidence: [
      'Abnormal surface region detected: Deep longitudinal groove along center strip axis (X:92-106).',
      'Region localized using available annotation/detection information: Single continuous high-confidence bounding box.',
      'Pattern differs from normal reference samples: High aspect ratio trench with flank brightness gradient exceeding 65% of reference.'
    ],
    epistemology: {
      observedEvidence: 'Profile laser triangulator logged 18.5µm furrow depth; pixel greyscale drops sharply at X:99.',
      modelPrediction: 'Model detects Severe Scratch defect with 96.1% confidence.',
      statisticalAssociation: 'Strongly associated with roll face gouge on Finish Stand #2 (r = 0.92 during high-speed runs).',
      simulationHypothesis: 'Simulation predicts coil structural failure if subjected to subsequent deep drawing or stamping.',
      causationCaveat: 'While correlated with Stand #2 roll wear, external uncoiler scratch cannot be ruled out without upstream gate log.'
    },
    processTelemetry: {
      cycleTimeSec: 4.9,
      nominalCycleSec: 4.2,
      stationDowntimeMinutes: 18,
      lineSpeedMpm: 125,
      rollPressureMpa: 14.8,
      lubricantFlowLpm: 17.2,
      rollTemperatureCelsius: 66.8,
      vibrationRmsMmSec: 6.2
    },
    possibleContributingFactors: [
      {
        factor: 'Roll Surface Gouge / Foreign Particle',
        subsystem: 'Tooling & Rollers',
        observedEvidence: 'Repetitive continuous line down the center of the coil strip.',
        associationStrength: 92,
        verificationStep: 'Stop line and inspect Stand #2 work rolls for circumferential groove.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 2200,
      reworkCostPerCoilUsd: 650,
      affectedMeters: 620,
      batchHoldRecommended: true,
      executiveSummary: 'Critical defect. Strip cannot be reworked; full coil scrap required if furrow exceeds 15µm specification.'
    },
    recommendedSimulation: {
      title: 'Tooling Swap & Line Speed Reduction',
      targetStationId: 'S04',
      actionDescription: 'Simulate line speed derating to 95 mpm and roller cartridge replacement.',
      proposedParameters: {
        loadBalanceShiftPct: 20,
        feedRateOptimizationPct: -15,
        targetDefectRatePct: 0.5
      }
    }
  },
  {
    id: 'SAMPLE-NEU-PA-101',
    sampleCode: 'NEU-DET-PA-001',
    filename: 'patches_1.jpg',
    localImageUrl: '/assets/neu_det/patches_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/patches_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'patches',
    defectLabel: 'Surface Patches',
    status: 'DEFECTIVE',
    confidence: 0.91,
    boundingBoxes: [
      {
        id: 'box-pa1-1',
        name: 'patches',
        xmin: 43,
        ymin: 10,
        xmax: 106,
        ymax: 97,
        confidence: 0.92
      },
      {
        id: 'box-pa1-2',
        name: 'patches',
        xmin: 32,
        ymin: 91,
        xmax: 81,
        ymax: 148,
        confidence: 0.89
      },
      {
        id: 'box-pa1-3',
        name: 'patches',
        xmin: 23,
        ymin: 156,
        xmax: 62,
        ymax: 198,
        confidence: 0.87
      }
    ],
    batchId: 'B-201',
    productionStationId: 'S02',
    productionStationName: 'Intermediate Rolling Stand 02',
    inspectionTimestamp: '2026-09-19 12:15:40 UTC',
    materialGrade: 'Hot-Rolled Low Carbon Steel',
    whyDetectedExplanation: 'Clusters of dark, irregularly shaped oxide laminations with sharp boundary discontinuities against rolled substrate.',
    detectionEvidence: [
      'Abnormal surface region detected: 3 discrete irregular patches with high-contrast perimeter boundaries.',
      'Region localized using available annotation/detection information: Coordinates spanning left quadrant (X:23-106, Y:10-198).',
      'Pattern differs from normal reference samples: Local surface roughness Ra exceeds baseline by 2.8x.'
    ],
    epistemology: {
      observedEvidence: 'Multispectral line scanner detected low-reflectance non-uniform oxide clusters with perimeter edge gradients.',
      modelPrediction: 'Model categorizes sample as "patches" with 91.4% confidence across 3 clustered bounding regions.',
      statisticalAssociation: 'Correlated with furnace descaling water pressure drops (r = 0.84 when descaler delta-P falls below 18 MPa).',
      simulationHypothesis: 'Simulating increased secondary descaling pressure indicates 90% reduction in oxidized patch incidence.',
      causationCaveat: 'Association with descaler pressure is empirical; ingot reheating furnace atmosphere may also be a contributing factor.'
    },
    processTelemetry: {
      cycleTimeSec: 5.2,
      nominalCycleSec: 4.8,
      stationDowntimeMinutes: 8,
      lineSpeedMpm: 110,
      rollPressureMpa: 16.5,
      lubricantFlowLpm: 24.0,
      rollTemperatureCelsius: 72.4,
      vibrationRmsMmSec: 4.1
    },
    possibleContributingFactors: [
      {
        factor: 'Descaling Header Spray Shadow',
        subsystem: 'Tooling & Rollers',
        observedEvidence: 'Patch distribution aligned with water jet nozzle #3 spray footprint.',
        associationStrength: 84,
        verificationStep: 'Inspect descaling nozzle tips for clogging or scale buildup.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 1400,
      reworkCostPerCoilUsd: 550,
      affectedMeters: 380,
      batchHoldRecommended: false,
      executiveSummary: 'Batch B-201 marked for conditional release with surface conditioning/acid pickling required.'
    },
    recommendedSimulation: {
      title: 'Descaling Header Pressure Optimization',
      targetStationId: 'S02',
      actionDescription: 'Simulate high-pressure descaling boost (+22%) and temperature profile adjustment.',
      proposedParameters: {
        loadBalanceShiftPct: 10,
        feedRateOptimizationPct: 0,
        targetDefectRatePct: 1.1
      }
    }
  },
  {
    id: 'SAMPLE-NEU-IN-301',
    sampleCode: 'NEU-DET-IN-001',
    filename: 'inclusion_1.jpg',
    localImageUrl: '/assets/neu_det/inclusion_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/inclusion_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'inclusion',
    defectLabel: 'Oxide Inclusion',
    status: 'DEFECTIVE',
    confidence: 0.89,
    boundingBoxes: [
      {
        id: 'box-in1-1',
        name: 'inclusion',
        xmin: 33,
        ymin: 5,
        xmax: 46,
        ymax: 36,
        confidence: 0.88
      },
      {
        id: 'box-in1-2',
        name: 'inclusion',
        xmin: 120,
        ymin: 34,
        xmax: 130,
        ymax: 60,
        confidence: 0.91
      },
      {
        id: 'box-in1-3',
        name: 'inclusion',
        xmin: 115,
        ymin: 72,
        xmax: 140,
        ymax: 116,
        confidence: 0.93
      },
      {
        id: 'box-in1-4',
        name: 'inclusion',
        xmin: 116,
        ymin: 115,
        xmax: 135,
        ymax: 198,
        confidence: 0.86
      }
    ],
    batchId: 'B-203',
    productionStationId: 'S01',
    productionStationName: 'Continuous Ingot Casting & Feed',
    inspectionTimestamp: '2026-09-19 10:44:12 UTC',
    materialGrade: 'High-Tensile Alloy Strip',
    whyDetectedExplanation: 'Small, high-density non-metallic particles embedded in steel matrix showing halo shadows around inclusion edges.',
    detectionEvidence: [
      'Abnormal surface region detected: 4 distinct punctate inclusion sites embedded in rolling grain.',
      'Region localized using available annotation/detection information: Longitudinal alignment indicating ladle slag carryover.',
      'Pattern differs from normal reference samples: High localized acoustic & optical absorption inconsistent with clean steel.'
    ],
    epistemology: {
      observedEvidence: 'High-contrast granular dark spots with perimeter boundary scattering detected by optical AOI.',
      modelPrediction: 'Classification model predicts "inclusion" with 89.2% probability across 4 bounding regions.',
      statisticalAssociation: 'Correlated with tundish slag detection sensor events during ladle changeover (r = 0.79).',
      simulationHypothesis: 'Simulation predicts crack initiation under tensile fatigue testing if inclusion exceeds 25µm diameter.',
      causationCaveat: 'Slag entrapment is an upstream metallurgical hypothesis; non-destructive eddy current testing is required to verify inclusion depth.'
    },
    processTelemetry: {
      cycleTimeSec: 4.1,
      nominalCycleSec: 4.0,
      stationDowntimeMinutes: 4,
      lineSpeedMpm: 95,
      rollPressureMpa: 15.0,
      lubricantFlowLpm: 26.0,
      rollTemperatureCelsius: 58.0,
      vibrationRmsMmSec: 3.2
    },
    possibleContributingFactors: [
      {
        factor: 'Ladle Slag Carryover',
        subsystem: 'Feed & Tension',
        observedEvidence: 'Sample captured 3 minutes following ladle heat exchange #4.',
        associationStrength: 79,
        verificationStep: 'Check tundish electromagnetic level sensors and argon stirring rate.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 2600,
      reworkCostPerCoilUsd: 0,
      affectedMeters: 210,
      batchHoldRecommended: true,
      executiveSummary: 'Sub-surface metallurgical inclusions cannot be reworked by surface polishing. Material diverted to non-critical structural grade.'
    },
    recommendedSimulation: {
      title: 'Tundish Residence Time Adjustment',
      targetStationId: 'S01',
      actionDescription: 'Evaluate simulated casting speed deceleration to promote inclusion float-out.',
      proposedParameters: {
        loadBalanceShiftPct: 5,
        feedRateOptimizationPct: -10,
        targetDefectRatePct: 0.6
      }
    }
  },
  {
    id: 'SAMPLE-NEU-CR-401',
    sampleCode: 'NEU-DET-CR-001',
    filename: 'crazing_1.jpg',
    localImageUrl: '/assets/neu_det/crazing_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/crazing_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'crazing',
    defectLabel: 'Crazing Network',
    status: 'DEFECTIVE',
    confidence: 0.93,
    boundingBoxes: [
      {
        id: 'box-cr1-1',
        name: 'crazing',
        xmin: 2,
        ymin: 2,
        xmax: 193,
        ymax: 194,
        confidence: 0.93
      }
    ],
    batchId: 'B-204',
    productionStationId: 'S04',
    productionStationName: 'Inspection Station 04',
    inspectionTimestamp: '2026-09-19 14:10:05 UTC',
    materialGrade: 'Cold-Rolled Strip AISI 304',
    whyDetectedExplanation: 'Intricate fine mesh of micro-cracks covering the entire frame caused by thermal fatigue and cyclic work roll shock.',
    detectionEvidence: [
      'Abnormal surface region detected: Omni-directional reticular micro-fissure network over 96% of field of view.',
      'Region localized using available annotation/detection information: Global bounding box spanning coordinates (X:2-193, Y:2-194).',
      'Pattern differs from normal reference samples: High high-frequency Laplacian variance indicative of crack network.'
    ],
    epistemology: {
      observedEvidence: 'Laplacian edge filter variance is 4.6x higher than reference normal steel surface.',
      modelPrediction: 'Classification model predicts "crazing" with 93.0% confidence; IoU 0.95.',
      statisticalAssociation: 'Strongly correlated with work roll thermal shock and delayed cooling water reactivation (r = 0.89).',
      simulationHypothesis: 'FEM thermo-mechanical model shows roll surface cooling delta exceeding 180°C induces micro-crazing imprint.',
      causationCaveat: 'Thermal fatigue imprint on roll face vs. incoming strip metallurgy must be isolated by comparing adjacent coil segments.'
    },
    processTelemetry: {
      cycleTimeSec: 5.0,
      nominalCycleSec: 4.2,
      stationDowntimeMinutes: 22,
      lineSpeedMpm: 115,
      rollPressureMpa: 15.2,
      lubricantFlowLpm: 19.0,
      rollTemperatureCelsius: 78.4,
      vibrationRmsMmSec: 6.8
    },
    possibleContributingFactors: [
      {
        factor: 'Roll Thermal Fatigue / Fire Cracking',
        subsystem: 'Thermal Controls',
        observedEvidence: 'Station 04 roll temperature logged at 78.4°C (alarm threshold: 70°C).',
        associationStrength: 89,
        verificationStep: 'Perform eddy current inspection on top and bottom work rolls during shift change.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 2100,
      reworkCostPerCoilUsd: 800,
      affectedMeters: 750,
      batchHoldRecommended: true,
      executiveSummary: 'Work roll crazing is transferring crack pattern onto the entire strip. Immediate roll change required to prevent 100% batch loss.'
    },
    recommendedSimulation: {
      title: 'Roll Thermal Gradient Equalization',
      targetStationId: 'S04',
      actionDescription: 'Simulate coolant spray pattern reconfiguration and roll RPM throttle.',
      proposedParameters: {
        loadBalanceShiftPct: 25,
        feedRateOptimizationPct: -12,
        targetDefectRatePct: 0.4
      }
    }
  },
  {
    id: 'SAMPLE-NEU-RS-501',
    sampleCode: 'NEU-DET-RS-001',
    filename: 'rolled-in_scale_1.jpg',
    localImageUrl: '/assets/neu_det/rolled-in_scale_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/rolled-in_scale_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'rolled-in_scale',
    defectLabel: 'Rolled-in Scale',
    status: 'DEFECTIVE',
    confidence: 0.95,
    boundingBoxes: [
      {
        id: 'box-rs1-1',
        name: 'rolled-in_scale',
        xmin: 63,
        ymin: 38,
        xmax: 139,
        ymax: 99,
        confidence: 0.96
      },
      {
        id: 'box-rs1-2',
        name: 'rolled-in_scale',
        xmin: 72,
        ymin: 111,
        xmax: 134,
        ymax: 169,
        confidence: 0.94
      }
    ],
    batchId: 'B-202',
    productionStationId: 'S03',
    productionStationName: 'Breakdown Mill & CNC Station 03',
    inspectionTimestamp: '2026-09-19 13:05:18 UTC',
    materialGrade: 'Structural Carbon Steel Strip',
    whyDetectedExplanation: 'Black fish-scale pattern mechanically pressed into the steel strip during high-pressure rolling passes.',
    detectionEvidence: [
      'Abnormal surface region detected: Deeply pressed oxide flakes with distinctive indented perimeter.',
      'Region localized using available annotation/detection information: Two primary clusters at center vertical strip (X:63-139).',
      'Pattern differs from normal reference samples: High localized specular absorption and surface depression depth > 12µm.'
    ],
    epistemology: {
      observedEvidence: 'Dual-band optical profilometer detected dark iron oxide impressions 12-16µm deep with characteristic scale morphology.',
      modelPrediction: 'Detected as "rolled-in_scale" with 95.3% confidence; 2 localization proposals.',
      statisticalAssociation: 'Correlated with high furnace oxygen content (> 2.5%) during slab soaking (r = 0.87).',
      simulationHypothesis: 'Counterfactual simulation demonstrates that increasing roughing pass descaling water volume by 18% eliminates scale embedding.',
      causationCaveat: 'Scale origin could be secondary re-oxidation between stands rather than furnace scale. High-speed interstand cameras required.'
    },
    processTelemetry: {
      cycleTimeSec: 4.6,
      nominalCycleSec: 4.2,
      stationDowntimeMinutes: 12,
      lineSpeedMpm: 105,
      rollPressureMpa: 17.2,
      lubricantFlowLpm: 21.5,
      rollTemperatureCelsius: 70.1,
      vibrationRmsMmSec: 5.4
    },
    possibleContributingFactors: [
      {
        factor: 'Reheating Furnace Excess Oxygen',
        subsystem: 'Thermal Controls',
        observedEvidence: 'Heavy primary scale formation logged during delay at reheat furnace #2.',
        associationStrength: 87,
        verificationStep: 'Check furnace atmosphere lambda sensor and fuel-air ratio.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 1950,
      reworkCostPerCoilUsd: 700,
      affectedMeters: 520,
      batchHoldRecommended: true,
      executiveSummary: 'Scale defects cause severe surface pitting upon pickling. Strip quarantined for heavy mechanical grinding.'
    },
    recommendedSimulation: {
      title: 'Interstand Descaler Boost Simulation',
      targetStationId: 'S03',
      actionDescription: 'Simulate roughing pass hydraulic impact pressure increase and pass speed optimization.',
      proposedParameters: {
        loadBalanceShiftPct: 15,
        feedRateOptimizationPct: -5,
        targetDefectRatePct: 0.9
      }
    }
  },
  {
    id: 'SAMPLE-NEU-PS-601',
    sampleCode: 'NEU-DET-PS-001',
    filename: 'pitted_surface_1.jpg',
    localImageUrl: '/assets/neu_det/pitted_surface_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/pitted_surface_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'pitted_surface',
    defectLabel: 'Pitted Surface',
    status: 'DEFECTIVE',
    confidence: 0.92,
    boundingBoxes: [
      {
        id: 'box-ps1-1',
        name: 'pitted_surface',
        xmin: 21,
        ymin: 2,
        xmax: 92,
        ymax: 196,
        confidence: 0.91
      },
      {
        id: 'box-ps1-2',
        name: 'pitted_surface',
        xmin: 85,
        ymin: 3,
        xmax: 188,
        ymax: 195,
        confidence: 0.93
      }
    ],
    batchId: 'B-205',
    productionStationId: 'S05',
    productionStationName: 'Finishing Stand 05 & Coiler',
    inspectionTimestamp: '2026-09-19 15:02:11 UTC',
    materialGrade: 'Cold-Rolled Sheet Grade B',
    whyDetectedExplanation: 'Widespread cratering and periodic micro-indentations resulting from rolled-off wear particles on work roll surfaces.',
    detectionEvidence: [
      'Abnormal surface region detected: Dense clustering of small irregular pits covering both left and right strip quadrants.',
      'Region localized using available annotation/detection information: Two broad bounding boxes (X:21-92 and X:85-188) capturing full field.',
      'Pattern differs from normal reference samples: High spatial frequency pinhole distribution with average pit diameter 0.45mm.'
    ],
    epistemology: {
      observedEvidence: 'Surface dark-field illumination highlights extensive specular scatter from thousands of microscopic crater depressions.',
      modelPrediction: 'Classification model predicts "pitted_surface" with 92.1% confidence; full surface coverage.',
      statisticalAssociation: 'Empirically correlated with cumulative work roll tonnage (> 1,200 tons rolled without roll grind) (r = 0.85).',
      simulationHypothesis: 'Simulation predicts rapid paint peeling and corrosion failure if processed into automotive exterior panels.',
      causationCaveat: 'Could also be caused by acid over-pickling prior to cold reduction. Verification of pickling bath acid concentration required.'
    },
    processTelemetry: {
      cycleTimeSec: 4.4,
      nominalCycleSec: 4.2,
      stationDowntimeMinutes: 6,
      lineSpeedMpm: 130,
      rollPressureMpa: 13.9,
      lubricantFlowLpm: 25.0,
      rollTemperatureCelsius: 61.2,
      vibrationRmsMmSec: 4.8
    },
    possibleContributingFactors: [
      {
        factor: 'Roll Surface Spalling / Micro-Fatigue',
        subsystem: 'Tooling & Rollers',
        observedEvidence: 'Work roll has completed 1,340 tons since last regrind (recommended max: 1,000 tons).',
        associationStrength: 85,
        verificationStep: 'Schedule immediate roll change on Stand 05.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 1750,
      reworkCostPerCoilUsd: 480,
      affectedMeters: 600,
      batchHoldRecommended: true,
      executiveSummary: 'Batch B-205 flagged for automotive reject. Divert to non-exposed internal automotive brackets.'
    },
    recommendedSimulation: {
      title: 'Stand 05 Preventive Roll Reductions',
      targetStationId: 'S05',
      actionDescription: 'Simulate roll campaign tonnage limit reduction to 950 tons.',
      proposedParameters: {
        loadBalanceShiftPct: 10,
        feedRateOptimizationPct: -5,
        targetDefectRatePct: 0.7
      }
    }
  },
  {
    id: 'SAMPLE-NEU-NORM-001',
    sampleCode: 'NEU-DET-NORM-001',
    filename: 'normal_reference_1.jpg',
    localImageUrl: '/assets/neu_det/normal_reference_1.jpg',
    remoteImageUrl: '/assets/neu_det/normal_reference_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'normal',
    defectLabel: 'Normal Surface (Defect-Free)',
    status: 'NORMAL',
    confidence: 0.992,
    boundingBoxes: [],
    batchId: 'B-200',
    productionStationId: 'S04',
    productionStationName: 'Inspection Station 04',
    inspectionTimestamp: '2026-09-19 09:12:00 UTC',
    materialGrade: 'Cold-Rolled Strip AISI 304',
    whyDetectedExplanation: 'Surface conforms strictly to golden master reference. Uniform brushed rolling grain with zero anomalous localized intensity gradients.',
    detectionEvidence: [
      'Clean surface verification: Spatial variance falls within ±1.2 sigma of nominal golden reference.',
      'No localized bounding box proposals generated above activation threshold (tau = 0.25).',
      'Normal reference comparison: High structural similarity index (SSIM = 0.984) to baseline cold-rolled steel.'
    ],
    epistemology: {
      observedEvidence: 'Uniform luminance distribution (mean: 136 DN, std: 8.2 DN); zero localized discontinuities.',
      modelPrediction: 'Confidence of "NORMAL" status is 99.2%; defect probability across all 6 classes < 0.8%.',
      statisticalAssociation: 'Process operating at nominal conditions (14.0 MPa, 28.0 L/min lubricant, 52°C roll temperature).',
      simulationHypothesis: 'Current stable operating envelope will maintain < 0.5% defect rate indefinitely.',
      causationCaveat: 'Zero defect observation confirms nominal surface condition under current visual optical limits.'
    },
    processTelemetry: {
      cycleTimeSec: 4.2,
      nominalCycleSec: 4.2,
      stationDowntimeMinutes: 0,
      lineSpeedMpm: 120,
      rollPressureMpa: 14.0,
      lubricantFlowLpm: 28.0,
      rollTemperatureCelsius: 52.4,
      vibrationRmsMmSec: 1.8
    },
    possibleContributingFactors: [],
    businessImpact: {
      scrapCostPerCoilUsd: 0,
      reworkCostPerCoilUsd: 0,
      affectedMeters: 0,
      batchHoldRecommended: false,
      executiveSummary: 'Batch B-200 100% compliant. Full production speed approved; zero margin erosion.'
    },
    recommendedSimulation: {
      title: 'Baseline Benchmark Model',
      targetStationId: 'S04',
      actionDescription: 'Preserve this parameter set as the plant golden baseline.',
      proposedParameters: {
        loadBalanceShiftPct: 0,
        feedRateOptimizationPct: 0,
        targetDefectRatePct: 0.3
      }
    }
  },
  {
    id: 'SAMPLE-NEU-UNC-701',
    sampleCode: 'NEU-DET-UNC-001',
    filename: 'scratches_3.jpg',
    localImageUrl: '/assets/neu_det/scratches_3.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/scratches_3.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    width: 200,
    height: 200,
    defectClass: 'scratches',
    defectLabel: 'Faint Micro-Scoring / Roller Mark',
    status: 'UNCERTAIN',
    confidence: 0.48,
    boundingBoxes: [
      {
        id: 'box-sc3-1',
        name: 'scratches',
        xmin: 167,
        ymin: 40,
        xmax: 179,
        ymax: 121,
        confidence: 0.51
      },
      {
        id: 'box-sc3-2',
        name: 'scratches',
        xmin: 148,
        ymin: 165,
        xmax: 176,
        ymax: 199,
        confidence: 0.46
      }
    ],
    batchId: 'B-204',
    productionStationId: 'S04',
    productionStationName: 'Inspection Station 04',
    inspectionTimestamp: '2026-09-19 14:45:00 UTC',
    materialGrade: 'Cold-Rolled Strip AISI 304',
    whyDetectedExplanation: 'Epistemic uncertainty elevated (Confidence: 48%). Faint linear trace lies near the sensor noise floor; ambiguous distinction between shallow mechanical scratch and innocuous rolling grain streak.',
    detectionEvidence: [
      'Ambiguous optical signal: Gradient contrast is only 1.3x above camera sensor noise threshold.',
      'Partial localization: 2 weak bounding proposals with overlapping class probabilities (Scratch: 48%, Normal: 39%, Crazing: 13%).',
      'High model entropy: Defect does not cleanly match catalog prototypes; human metallurgical review required.'
    ],
    epistemology: {
      observedEvidence: 'Faint vertical line at X:167-179 with shallow depth (< 3µm) and low optical contrast.',
      modelPrediction: 'Uncertain detection (p = 0.48 for scratch). Model entropy is in the top 5th percentile.',
      statisticalAssociation: 'Borderline correlation with vibration micro-harmonics at 1,420 Hz (r = 0.44).',
      simulationHypothesis: 'If part undergoes anodizing, faint scratch will become visually apparent; if coated with primer, it will be invisible.',
      causationCaveat: 'Epistemic uncertainty warning: Do NOT halt line based on this prediction alone. Physical tactile finger-nail test or profilometer inspection required.'
    },
    processTelemetry: {
      cycleTimeSec: 4.3,
      nominalCycleSec: 4.2,
      stationDowntimeMinutes: 2,
      lineSpeedMpm: 122,
      rollPressureMpa: 14.1,
      lubricantFlowLpm: 23.5,
      rollTemperatureCelsius: 56.5,
      vibrationRmsMmSec: 3.8
    },
    possibleContributingFactors: [
      {
        factor: 'Light Roller Mark or Strip Guide Friction',
        subsystem: 'Tooling & Rollers',
        observedEvidence: 'Periodic faint line near strip edge.',
        associationStrength: 48,
        verificationStep: 'Conduct manual profilometer surface roughness sweep across X:170.'
      }
    ],
    businessImpact: {
      scrapCostPerCoilUsd: 0,
      reworkCostPerCoilUsd: 220,
      affectedMeters: 150,
      batchHoldRecommended: false,
      executiveSummary: 'Uncertain defect. Flagged for secondary manual engineer inspection at coil tail-out. Batch not halted.'
    },
    recommendedSimulation: {
      title: 'Confidence Threshold Sensitivity Analysis',
      targetStationId: 'S04',
      actionDescription: 'Evaluate classification trade-off between false positives and scrap escape rates.',
      proposedParameters: {
        loadBalanceShiftPct: 0,
        feedRateOptimizationPct: 0,
        targetDefectRatePct: 1.0
      }
    }
  }
];
