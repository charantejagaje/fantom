# fantom

## 1. Problem Understanding

Manufacturing factories produce many products at high speed. A small defect, a slow machine, too much work waiting between steps, or a change in a production batch can reduce quality, production speed, and profit.

The problem is that these things are connected. A defect may be related to a process condition. A process problem may create a bottleneck. A bottleneck can reduce throughput and increase losses.

Our system is designed to bring these pieces together in one place.

### What our system will do

- Check whether a product is acceptable or defective.
- Identify the defect when the available data supports it.
- Show uncertainty instead of forcing a wrong answer for a new or unclear defect.
- Study production data to find bottlenecks and process problems.
- Estimate how these problems can affect throughput, losses, and profitability.
- Connect defect patterns with process and batch information to help find possible root causes.
- Give evidence-based recommendations. These recommendations are simulated/advisory only.

The goal is **not only to detect defects**. The goal is to help answer:

> **What is wrong? Why might it be happening? Where is the production flow affected? What is the business impact? What could be changed?**

---

## 2. Proposed Solution

We propose a software-only AI decision-support system that combines three main types of data:

1. **Inspection data** – information about product quality and defects.
2. **Production data** – information about stations, cycle times, batches, capacity, downtime, and other operating conditions.
3. **Economic data** – information needed to estimate cost, losses, and profitability.

The system processes these inputs and presents the results in one dashboard.

### Simple flow

```text
Inspection Data ─────┐
Production Data ─────┼──> AI/ML Analysis ──> Results ──> Dashboard
Economic Data ───────┘             │
                                   ├─ Defect Detection
                                   ├─ Defect Location (when supported)
                                   ├─ Uncertainty / New Defect Flag
                                   ├─ Root-Cause Analysis
                                   ├─ Bottleneck Detection
                                   ├─ Throughput and Loss Impact
                                   └─ Profitability Estimate
                                              │
                                              ↓
                                      Recommendations
```

---

## 3. Architecture

### Main parts of the system

**1. Data Input**  
Receives the organizer-provided inspection, production, and economic datasets.

**2. Data Processing**  
Cleans and prepares the data so that it can be used by the analysis models.

**3. AI/ML Layer**  
Analyzes quality and production patterns. The exact model will depend on the provided data.

**4. Root-Cause Analysis**  
Looks for relationships between defects and process/batch conditions to identify possible causes.

**5. Bottleneck and Impact Analysis**  
Finds production-flow constraints and estimates their effect on throughput and losses.

**6. Profitability Analysis**  
Uses the available economic information to estimate the effect of quality and process changes on profitability or margin.

**7. Recommendation Layer**  
Generates evidence-based, simulated suggestions for process improvement.

**8. Dashboard**  
Shows predictions, evidence, trends, bottlenecks, costs, and recommendations in an easy-to-understand format.

---

## 4. Our AI/ML Approach

The AI/ML approach will be selected based on the structure of the organizer-provided data.

### Defect prediction

The model will classify products as:

- Acceptable
- Defective

When supported by the data, it will also identify the defect category and location.

### Uncertainty handling

A prediction will not always be treated as correct with complete confidence. If the model is uncertain or the pattern looks new, the system can flag the case for review instead of forcing a label.

### Root-cause analysis

We will compare defect patterns with production conditions such as batch and process information. This helps identify conditions that are associated with recurring defects.

### Bottleneck detection

Production information such as cycle time, capacity, downtime, and work waiting between stages can be analyzed to find areas that restrict production flow.

### Impact estimation

The system will connect quality and production problems with throughput, losses, cost, and profitability using the available economic data.

### Explainability

For important predictions, the system will show the evidence or important factors behind the result so that users can understand why the system reached that conclusion.

---

## 5. Expected Output

The dashboard should give the user a clear view of:

- Product quality status
- Defect type and location when supported
- Confidence / uncertainty
- Possible process or batch relationships
- Production bottlenecks
- Throughput and loss impact
- Profitability / margin impact
- Recommended process changes

All recommendations and interventions are **simulated/advisory only**, as required by the problem statement.

---

## 6. Why This Is Different

A basic solution may only answer:

> **"Is this product defective?"**

Our proposed system aims to answer a larger industrial question:

> **"What is wrong with the product or process, what may be causing it, how is the production flow affected, what is the estimated business impact, and what change could be tested?"**

This follows the problem statement's requirement for a unified decision-support system instead of only an image classifier or an isolated KPI dashboard.

---

## 7. Checkpoint 1 Coverage

### Problem Understanding – 5 marks
We explain the connection between product quality, production flow, bottlenecks, losses, and profitability.

### Architecture – 5 marks
We define the flow from inspection, production, and economic data to AI/ML analysis, impact analysis, recommendations, and dashboard output.

### Approach – 5 marks
We explain our planned approach for defect prediction, uncertainty handling, root-cause correlation, bottleneck analysis, impact estimation, and explainability.

---

## 8. Current Scope

For the hackathon, the system will remain **software-only** and will use organizer-provided datasets.

No live camera feed, PLC connection, robotic sorting, machine control, or production-line hardware connection is required or permitted for judging.

---

## 9. Note on Model Selection

We will finalize the exact machine-learning models after inspecting the organizer-provided datasets. We will choose models that match the available data and the required tasks instead of choosing a model without checking the data first.
