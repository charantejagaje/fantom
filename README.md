# FANTOM-INDSUTRIAL AI DECISION INTELLIGENCE

## AI Decision-Support System for Square / Rectangular Steel Tube Manufacturing

LineSentinel AI is a software-only AI system for a multi-stage square and rectangular steel-tube manufacturing line.

**Core idea:**  
**Defect → Possible Cause → Bottleneck → Throughput/Loss → Cost Impact → Recommendation**

## 1. Problem

Steel-tube manufacturing can face defects, downtime, high cycle times, bottlenecks, scrap, and rework. These problems can affect both production and cost.

Our goal is not only to detect a defective tube. We connect quality information with production and economic information to help identify possible contributing factors, production constraints, business impact, and useful advisory actions.

## 2. Manufacturing Scenario

We focus on **square / rectangular steel-tube manufacturing**.

```text
Steel Coil / Raw Steel
        ↓
Forming / Roll Forming
        ↓
Welding
        ↓
Sizing / Straightening
        ↓
Cutting
        ↓
Surface Finishing
        ↓
Quality Inspection
        ↓
Packing
```

## 3. Main Features

### Defect Analysis
Classify units as acceptable or defective. Defect categories are used only when supported by the dataset.

Possible demo examples:
- Weld defect
- Dimensional variation
- Surface defect
- Bending/deformation
- Poor straightness
- Wall-thickness variation
- Cut-length variation

### Confidence / Uncertainty
Predictions are grouped into:
- High Confidence
- Medium Confidence
- Needs Review

Uncertain cases are flagged instead of being blindly forced into a class.

### Possible Root-Cause Analysis
The system looks for observed relationships between defects and available factors such as:
- Batch
- Machine/station
- Cycle time
- Downtime
- Utilization
- Operating conditions

These are labelled **Observed Associations**, not proven causes.

### Bottleneck Analysis
Compare production stages using available:
- Utilization
- Cycle time
- Downtime
- Waiting/queue information when available

Identify the stage that appears to constrain production.

### Throughput and Loss
Estimate:
- Throughput
- Scrap
- Rework
- Downtime impact
- Production loss

### Cost / Profitability
Estimate:
- Scrap cost
- Rework cost
- Downtime cost
- Throughput-related loss
- Margin impact

Estimated or simulated values are labelled clearly.

### Recommendations
Every recommendation explains:
- **WHAT** — action to investigate
- **WHY** — reason
- **EVIDENCE** — supporting data
- **EXPECTED IMPACT** — possible effect

Recommendations are advisory only.

## 4. AI / ML Approach

Primary model:
**Random Forest Classifier**

Baseline:
**Logistic Regression**

Initial task:
**Acceptable vs Defective**

If the actual dataset contains valid defect-type labels, defect-type classification can also be added.

Evaluation:
- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

We will not claim a final accuracy before training and testing on the actual data.

## 5. Defect Size / Detection Precision

The minimum defect size we can reliably detect depends on the inspection data and its resolution.

For example, a target such as **3 mm detection** can only be claimed after testing data that supports that measurement level.

## 6. Data Sources

The hackathon is software-only. We do not directly connect physical factory equipment for judging.

In a real factory, inspection information could come from:
- Vision cameras
- Laser/dimensional sensors
- Ultrasonic inspection
- Eddy-current inspection
- Machine/process sensors

For the hackathon, the software uses organizer-provided inspection, production, and economic datasets.

If real data is not yet available, clearly labelled synthetic/demo data may be used for development.

## 7. System Architecture

```text
Inspection Data
Production Data
Economic Data
        ↓
Data Processing
        ↓
Feature Engineering
        ↓
AI / ML Analysis
        ↓
Defect Prediction + Confidence
        ↓
Possible Contributing Factors
        ↓
Bottleneck Detection
        ↓
Throughput / Loss
        ↓
Cost / Margin Impact
        ↓
Recommendations
        ↓
Dashboard
```

## 8. What Makes It Different

A basic defect system may stop at:

```text
Product → Defective / Not Defective
```

Our intended flow is:

```text
Product
   ↓
Is it defective?
   ↓
What factors are associated with the problem?
   ↓
Where is production constrained?
   ↓
What is the throughput/loss impact?
   ↓
What is the estimated cost impact?
   ↓
What should the factory investigate?
```

This makes the project a **decision-support system**, not only a classifier.

## 9. Software-Only and Advisory

The system does not:
- Control machines
- Connect to PLCs
- Control robots
- Perform automatic sorting
- Require a live factory connection for judging

Recommendations are simulated/advisory.

## 10. Checkpoint 2 Prototype

The working prototype should demonstrate:

1. Manufacturing data is loaded.
2. Defect analysis works.
3. Model confidence is shown.
4. Possible contributing factors are displayed.
5. A bottleneck is identified.
6. Throughput/loss is estimated.
7. Cost impact is estimated.
8. A recommendation is generated.
9. The complete result is shown in a professional dashboard.

## 11. Important Limitations

We clearly distinguish:
- Real data vs synthetic/demo data
- Model predictions vs measured results
- Observed association vs proven causation
- Estimated cost vs actual financial results
- Software simulation vs real factory control

We do not claim capabilities that the available data does not support.

## 12. Future Improvements

- Better defect classification
- Defect localization when positional data is available
- Better handling of unseen conditions
- False-accept / false-reject analysis
- Improved uncertainty calibration
- Stronger root-cause correlation
- Improved economic simulation
- Further UI/UX improvements

## 13. One-Line Explanation

> **LineSentinel AI does not just identify a bad steel tube; it connects the defect to possible process issues, production bottlenecks, throughput and cost impact, and gives an explainable recommendation for what to investigate.**
