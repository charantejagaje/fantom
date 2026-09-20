export interface AimlGlossaryItem {
  id: string;
  industrialTerm: string;
  aimlTerm: string;
  category: 'cv_anomaly' | 'prob_stats' | 'uncertainty_drift' | 'systems_optimization';
  shortBadge: string;
  mathOrFormula?: string;
  analogy: string;
  detailedExplanation: string;
  whyItMattersInML: string;
}

export const AIML_GLOSSARY: Record<string, AimlGlossaryItem> = {
  'telemetry-twin': {
    id: 'telemetry-twin',
    industrialTerm: 'Telemetry Twin / Digital Twin',
    aimlTerm: 'Multivariate Time-Series Streaming Pipeline',
    category: 'systems_optimization',
    shortBadge: 'Time-Series Streaming',
    mathOrFormula: 'X_t = [vibration_t, temp_t, cycle_t, ...] \\in \\mathbb{R}^d',
    analogy: 'Think of this like continuous sensor feature logging in a real-time IoT pipeline, where each machine streams numerical feature vectors every second.',
    detailedExplanation: 'A digital twin in machine learning is essentially a live surrogate model fed by streaming sensor features. Instead of running offline on static CSVs, models process sliding temporal windows to detect drifts in state.',
    whyItMattersInML: 'Provides high-frequency telemetry data for streaming anomaly detection, predictive maintenance, and online inference.'
  },
  'covariate-shift': {
    id: 'covariate-shift',
    industrialTerm: 'Defect Drift / Machine Anomaly Drift',
    aimlTerm: 'Covariate Shift / Input Distribution Drift',
    category: 'uncertainty_drift',
    shortBadge: 'Covariate Shift P(X)',
    mathOrFormula: 'P_{train}(X) \\neq P_{test}(X), \\text{ while } P(Y|X) \\text{ remains constant}',
    analogy: 'Imagine training a model on images of cars in daylight, and suddenly the test camera only captures nighttime foggy roads. The input distribution shifted.',
    detailedExplanation: 'As bearings in CNC machines wear down, physical vibrations gradually drift from the normal baseline (e.g., mean vibration shifts from 2.1 mm/s to 6.8 mm/s). The underlying physics did not change, but the input feature space moved outside the normal training envelope.',
    whyItMattersInML: 'Standard ML models degrade silently under covariate shift. Detecting drift using KS-tests or PSI (Population Stability Index) allows triggering retraining or alert dispatches.'
  },
  'optical-localization': {
    id: 'optical-localization',
    industrialTerm: 'Optical Coordinate Localization (AOI)',
    aimlTerm: 'Computer Vision Defect Segmentation & Keypoint Mapping',
    category: 'cv_anomaly',
    shortBadge: 'CV Spatial Heatmap (X, Y)',
    mathOrFormula: '\\hat{y}_{loc} = \\arg\\max_{(x,y)} \\text{CAM}(x, y)',
    analogy: 'Similar to Class Activation Mapping (Grad-CAM) or YOLO bounding-box detection, identifying the exact sub-millimeter pixel coordinates where a defect resides on a 3D component.',
    detailedExplanation: 'Automated Optical Inspection (AOI) uses high-resolution matrix cameras to extract spatial coordinates (X: 68.4%, Y: 32.1%) on part geometry. In ML, this maps to semantic segmentation or object detection bounding boxes on geometric meshes.',
    whyItMattersInML: 'Rather than outputting a binary "pass/fail" classification, spatial localization produces interpretable feature maps that engineers can visually audit.'
  },
  'bayesian-confidence': {
    id: 'bayesian-confidence',
    industrialTerm: 'Bayesian Confidence Scoring (e.g. 91% Conf)',
    aimlTerm: 'Calibrated Posterior Probability P(Defect | Evidence)',
    category: 'prob_stats',
    shortBadge: 'Posterior P(Y|X)',
    mathOrFormula: 'P(\\text{Defect} | X) = \\frac{P(X | \\text{Defect}) \\cdot P(\\text{Defect})}{P(X)}',
    analogy: 'Applying Bayes\' Rule: we start with a low prior chance of defects (4%), but after seeing sharp high-frequency vibration and optical chatter, the posterior probability jumps to 91%.',
    detailedExplanation: 'Raw neural network logits often exhibit overconfidence (e.g., a standard softmax might say 99% confident even when unsure). Bayesian scoring combines historical defect priors with likelihood evidence from sensor observations to produce well-calibrated probabilities.',
    whyItMattersInML: 'Calibrated probabilities ensure operators don\'t halt expensive production lines on uncalibrated false alarms (Platt scaling / temperature scaling in action).'
  },
  'epistemic-uncertainty': {
    id: 'epistemic-uncertainty',
    industrialTerm: 'Novel / Uncertain Defect (42% Confidence)',
    aimlTerm: 'Epistemic Uncertainty & Out-of-Distribution (OOD) Detection',
    category: 'uncertainty_drift',
    shortBadge: 'OOD / Epistemic Uncertainty',
    mathOrFormula: '\\mathcal{H}(P(Y|x)) = -\\sum_c P(y_c|x) \\log P(y_c|x) \\gg \\tau',
    analogy: 'If a classifier trained on cats and dogs sees an elephant, a bad model confidently calls it a dog. A smart model recognizes high entropy and flags: "I have never seen this pattern before!"',
    detailedExplanation: 'Epistemic uncertainty arises from a lack of training data in a specific region of feature space. When part PRD-B17-4122 exhibits an unseen multi-harmonic groove, FANTOM refuses to force it into a known category, assigning high entropy (42% confidence) and requesting human inspection.',
    whyItMattersInML: 'Crucial for AI Safety and Active Learning: flagging low-confidence OOD samples prevents catastrophic misclassifications and routes them to human labelers.'
  },
  'bayesian-dag': {
    id: 'bayesian-dag',
    industrialTerm: 'Hierarchical Association Tree / Root Cause Graph',
    aimlTerm: 'Probabilistic Graphical Model (Bayesian DAG)',
    category: 'prob_stats',
    shortBadge: 'Bayesian DAG / PGM',
    mathOrFormula: 'P(X_1, \\dots, X_n) = \\prod_{i=1}^n P(X_i | \\text{Parents}(X_i))',
    analogy: 'A Directed Acyclic Graph (DAG) like in your AI class, where nodes are random variables (Defect, Batch, Station, Vibration) and arrows show probabilistic conditional dependencies.',
    detailedExplanation: 'Root cause analysis links symptom nodes (Surface Chatter) to latent operating states (Spindle Bearing Vibration). FANTOM models this as a probabilistic network where evidence propagates backward from defect observations to machine physics.',
    whyItMattersInML: 'Avoids treating root causes as black boxes by explicitly representing variable dependencies, d-separation, and conditional independence.'
  },
  'pearson-correlation': {
    id: 'pearson-correlation',
    industrialTerm: 'Observed Association (r = 0.94)',
    aimlTerm: 'Pearson Linear Correlation Coefficient',
    category: 'prob_stats',
    shortBadge: 'Pearson r = 0.94',
    mathOrFormula: 'r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}',
    analogy: 'Measures how tightly two variables track each other on a scatter plot. r = 0.94 is a very strong positive linear correlation (close to +1.0).',
    detailedExplanation: 'Sensor telemetry from Bearing #02 shows that as vibration amplitude increases, defect occurrence increases almost in lockstep. The calculated correlation factor is r = 0.94 across 180 inspected parts.',
    whyItMattersInML: 'Useful for initial feature selection and bivariate screening, but requires causal validation to rule out spurious correlations.'
  },
  'causation-caveat': {
    id: 'causation-caveat',
    industrialTerm: 'Epidemiological Caveat (Non-Causal Assertion)',
    aimlTerm: 'Correlation vs Causation & Confounding Variables',
    category: 'prob_stats',
    shortBadge: 'Correlation ≠ Causation',
    mathOrFormula: 'P(Y | X) \\neq P(Y | do(X))',
    analogy: 'Ice cream sales and shark attacks both spike in summer (high r), but ice cream doesn\'t cause shark attacks — hot weather is the confounder.',
    detailedExplanation: 'Observing that Bearing #02 vibrates when defects occur does not prove vibration physically gouges the metal — both might be caused by an unmeasured confounder (like bad alloy batch hardness). True causality requires Judea Pearl\'s do-calculus or intervention experiments.',
    whyItMattersInML: 'Teaches students why observational ML models fail in decision-making: predicting outcomes is different from choosing optimal interventions.'
  },
  'queuing-bottleneck': {
    id: 'queuing-bottleneck',
    industrialTerm: 'Bottleneck Throttling & Queue Accumulation (S03)',
    aimlTerm: 'Queuing Theory (Little\'s Law) & Pipeline Latency Bottleneck',
    category: 'systems_optimization',
    shortBadge: 'Little\'s Law L = λW',
    mathOrFormula: 'L = \\lambda W, \\quad \\rho = \\frac{\\lambda}{\\mu} \\to 1 \\implies \\text{Queue explodes}',
    analogy: 'Like a slow GPU in a distributed model training pipeline: if batch preparation feeds data faster than the GPU forward pass (utilization > 95%), intermediate memory buffers fill up and starve downstream workers.',
    detailedExplanation: 'Station 03 has 96.4% utilization. According to queuing theory, when arrival rate (lambda) approaches service rate (mu), the queue size (L) grows asymptotically, throttling the entire manufacturing pipeline throughput by 14%.',
    whyItMattersInML: 'Essential for ML Systems Engineering: understanding backpressure, data loader pipelines, inference server throughput, and GPU utilization bottlenecks.'
  },
  'profitability-waterfall': {
    id: 'profitability-waterfall',
    industrialTerm: 'Profitability Margin Waterfall (EBIT Impact)',
    aimlTerm: 'Cost-Sensitive Learning / Expected Utility Loss Function',
    category: 'systems_optimization',
    shortBadge: 'Cost Loss Matrix L(y, ŷ)',
    mathOrFormula: '\\text{Loss} = C_{FN} \\cdot \\text{Scrap} + C_{FP} \\cdot \\text{Downtime} + C_{bottleneck} \\cdot \\text{Throughput}',
    analogy: 'In spam filtering, a False Positive is more expensive than a False Negative. Here, letting a cracked blade escape (False Negative) costs $128 in scrap, while unnecessary line stops cost $24,600 in downtime.',
    detailedExplanation: 'In real-world ML, 0-1 loss or accuracy is useless. Every prediction has an asymmetric dollar cost. The Margin Waterfall computes the real-world operational loss function by aggregating scrap, rework, downtime, and throughput penalties.',
    whyItMattersInML: 'Bridges pure accuracy/F1 metrics to business value: demonstrates why practitioners optimize for expected economic utility rather than raw accuracy.'
  },
  'simulation-lab': {
    id: 'simulation-lab',
    industrialTerm: 'Counterfactual Policy Evaluation: Predictive Interventions',
    aimlTerm: 'Counterfactual Inference & Policy Evaluation (What-If Analysis)',
    category: 'systems_optimization',
    shortBadge: 'Counterfactual do(π)',
    mathOrFormula: '\\mathbb{E}[Y | do(A = a)] \\approx f_{\\text{surrogate}}(a, X)',
    analogy: 'Testing an autonomous vehicle policy in CARLA simulator before putting the car on real highways to see if changing steering gains avoids crashes.',
    detailedExplanation: 'Before executing a physical intervention (like shifting 25% of passes to Station 04), engineers evaluate the counterfactual outcome on a surrogate model. This validates whether the policy recovers throughput (+10.2%) and profit (+$38,400) without introducing new risks.',
    whyItMattersInML: 'Central to Reinforcement Learning and Offline Policy Evaluation: predicting the return of a new policy without deploying dangerous unverified actions to physical production.'
  },
  'decision-support': {
    id: 'decision-support',
    industrialTerm: 'Evidence Dossier & Prescriptive Dispatch',
    aimlTerm: 'Human-in-the-Loop Decision Support & Feature Attribution',
    category: 'systems_optimization',
    shortBadge: 'Human-in-the-Loop AI',
    mathOrFormula: '\\text{Decision} = \\text{Human}(\\hat{y}, \\text{Attributions}, \\text{Risks})',
    analogy: 'An AI copilot for doctors that shows the X-ray bounding box, confidence, and differential diagnoses, but leaves the final surgical incision to the human surgeon.',
    detailedExplanation: 'Industrial AI operates as an advisory layer. Instead of granting automated PLC execution rights to an algorithm, FANTOM presents transparent evidence dossiers with confidence scores and risks, allowing the shift supervisor to authorize worker dispatch.',
    whyItMattersInML: 'Demonstrates responsible AI deployment: high-stakes applications require interpretability, guardrails, and human oversight rather than blind automation.'
  }
};
