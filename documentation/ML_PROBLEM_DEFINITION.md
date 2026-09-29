# MAZEQUEST — MACHINE LEARNING PROBLEM DEFINITION & FEATURE DESIGN DOCUMENTATION

This document defines the authoritative Machine Learning problem formulation, feature engineering schema, labeling methodology, target leakage prevention, dataset schema, and technical pipeline architecture for **MazeQuest** (Phase 8A Corrected).

---

## 1. Executive Summary & Critical Architectural Revision

During Phase 8A architecture review, a **Critical Target Leakage Issue** was identified in naïve difficulty-labeling designs:

> **Target Leakage Trap**: If a composite difficulty score ($CI$) is calculated from features like `normalizedPathLength`, `deadEndRatio`, and `astarNodesExplored`, and those exact same features are fed to the ML model as input vector $X$, the classifier merely fits the deterministic algebraic formula $CI = g(X)$ rather than learning genuine predictive relationships.

### The Corrected Non-Circular Architecture
To eliminate target leakage and ensure meaningful machine learning, MazeQuest enforces **Strict Conceptual & Data Separation**:

```text
                  Procedural Maze Grid (Matrix)
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
  Spatial Analysis (Pure Grid)                Search Solver Execution
        │                                               │
        ▼                                               ▼
Input Feature Vector X                        Search Benchmark Metrics M_target
- wallDensity                                 - pathDetourFactor
- deadEndRatio                                - searchExpansionRatio
- branchingPointRatio                         (bfsNodesExplored / openCells)
- straightCorridorRatio                                 │
- turnCorridorRatio                                     ▼
        │                                    Composite Search Score CI_search
        │                                               │
        │                                               ▼ (Training Percentiles)
        │                                     Ground-Truth Target Label y
        │                                     (0=Easy, 1=Medium, 2=Hard)
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                ▼
                       ML Classifier f(X) -> y
         Model predicts search difficulty (y) from spatial geometry (X)!
```

---

## 2. Machine Learning Problem Statement

### 2.1 Formal Supervised Classification Formulation
The Machine Learning component of **MazeQuest** is formulated as a **Supervised Multiclass Classification** problem.

$$\hat{y} = f(X)$$

- **Input Vector ($X \in \mathbb{R}^k$)**: A vector of $k$ pure spatial, local geometric, and topological grid features extracted directly from a 2D maze matrix *before* running search solvers.
- **Target Variable ($y \in \{0, 1, 2\})$**: A discrete categorical difficulty label (`0`=Easy, `1`=Medium, `2`=Hard) derived from independent search expansion and path detour benchmark metrics.

### 2.2 Learning Objective & Latency Goal
Train an interpretable classifier (Decision Tree, K-Nearest Neighbors, Logistic Regression) capable of predicting a generated maze's structural difficulty tier in the browser. Browser inference is designed to be lightweight, with actual latency empirically benchmarked during Phase 9 implementation.

---

## 3. Exhaustive Evaluation of Candidate Labeling Strategies

We evaluate six candidate difficulty-labeling strategies against seven strict academic criteria:

### Strategy A: Composite Score using the SAME Features as Model Inputs (REJECTED)
- **Label Generation**: $CI = 0.40 \cdot \text{normalizedPathLength} + 0.30 \cdot \text{deadEndRatio} + 0.30 \cdot \left(\frac{\text{astarNodesExplored}}{\text{openCellCount}}\right) \rightarrow \text{Thresholds}$.
- **ML Input Vector $X$**: Contains `normalizedPathLength`, `deadEndRatio`, `astarNodesExplored`.
- **Target Leakage Risk**: **CRITICAL CIRCULAR TARGET LEAKAGE**. $y$ is a deterministic mathematical function of $X$. A Decision Tree will create splits directly reproducing the linear weights.
- **Academic Defensibility**: **UNACCEPTABLE**. The model learns a hardcoded scoring rule rather than predicting difficulty from spatial grid characteristics.

### Strategy B: Spatial Inputs ($X$) vs. Independent Search Benchmark Target ($y$) (SELECTED & RECOMMENDED)
- **Label Generation**: Derived from Search Benchmark Metrics ($M_{target}$) calculated via solver execution:
  $$CI_{search} = 0.50 \times \text{pathDetourFactor} + 0.50 \times \text{searchExpansionRatio}$$
  Where $\text{pathDetourFactor} = \frac{\text{shortestPathLength}}{\text{ManhattanDistance(Start, Goal)}}$ and $\text{searchExpansionRatio} = \frac{\text{bfsNodesExplored}}{\text{openCellCount}}$.
- **ML Input Vector $X$**: Contains **ONLY** spatial grid matrix properties:
  $$X = [\text{wallDensity}, \text{deadEndRatio}, \text{branchingPointRatio}, \text{straightCorridorRatio}, \text{turnCorridorRatio}]$$
- **Target Leakage Risk**: **ZERO CIRCULAR LEAKAGE**. $X$ contains no solver search metrics or path lengths. The model must learn how spatial wall arrangements and corridor turn frequencies ($X$) predict global search space expansion and path detours ($y$).
- **Practical Implementation**: Clean and reproducible using `MazeFeatureExtractor`.
- **Class Balance**: Controlled equal representation via training split percentile quantiles.
- **Academic Defensibility**: **EXCELLENT**. Recommended for MazeQuest.

### Strategy C: Human Player Performance Data
- **Label Generation**: Collected solve times, move counts, and restarts from human play sessions.
- **Target Leakage Risk**: Zero. Ideal real-world ground truth.
- **Practical Implementation**: Impractical for initial synthetic dataset generation of $N=2,000$ mazes in an offline pipeline without crowdsourced playtesting.
- **Academic Defensibility**: High conceptually, but unfeasible for synthetic dataset generation.

### Strategy D: Simulated Bounded-Rationality Player Agent
- **Label Generation**: Steps taken by a Depth-Limited Search agent with local 3-cell visibility or random tie-breaking.
- **Target Leakage Risk**: Low if $X$ contains spatial features.
- **Practical Implementation**: Requires implementing a separate noisy agent simulation loop.
- **Academic Defensibility**: Moderate, but simulated agents introduce artificial random-walk noise that may not accurately represent human spatial navigation intuition.

### Strategy E: Generator Construction Parameters
- **Label Generation**: Labels assigned based on maze generation carving bias (e.g. winding probability $p_{wind}$).
- **Target Leakage Risk**: Zero if carving parameters are kept private and excluded from $X$.
- **Practical Implementation**: Requires modifying `MazeGenerator` API to expose carving parameters.
- **Academic Defensibility**: Good, but limits training to mazes generated by specific parameter-tuned algorithms.

### Strategy F: Single Metric Thresholding (e.g., Shortest Path Length) (REJECTED)
- **Label Generation**: `if (shortestPathLength > 25) Hard; else Easy;`
- **Target Leakage Risk**: **HIGH** if `shortestPathLength` is in $X$.
- **Class Balance**: Poor (unbalanced without grid size normalization).
- **Academic Defensibility**: Low (arbitrary hard-coded rule).

---

## 4. Final Difficulty Labeling Strategy & Leakage Protection Proof

### 4.1 Ground-Truth Target Label Specification
The ground-truth label $y \in \{0, 1, 2\}$ is generated from the continuous Search Complexity Index ($CI_{search}$):

$$CI_{search} = 0.50 \times \left( \frac{\text{shortestPathLength}}{\text{ManhattanDistance(Start, Goal)}} \right) + 0.50 \times \left( \frac{\text{bfsNodesExplored}}{\text{openCellCount}} \right)$$

Percentile quantile thresholds ($P_{33.3}^{train}, P_{66.7}^{train}$) are calculated **EXCLUSIVELY on the Training Split (80%)** to define:
- **Easy (`0`)**: $CI_{search} \le P_{33.3}^{train}$
- **Medium (`1`)**: $P_{33.3}^{train} < CI_{search} \le P_{66.7}^{train}$
- **Hard (`2`)**: $CI_{search} > P_{66.7}^{train}$

### 4.2 Proof of Target Leakage Prevention
"The information used to construct the target label must NOT be reproduced in the model's input features."

- **Model Input Vector $X$**: `[wallDensity, deadEndRatio, branchingPointRatio, straightCorridorRatio, turnCorridorRatio]`
- **Target Generation Inputs ($M_{target}$)**: `[shortestPathLength, ManhattanDistance, bfsNodesExplored, openCellCount]`

Notice that **no variable in $X$ appears in $M_{target}$**, and no variable in $M_{target}$ appears in $X$. The classifier is physically incapable of reconstructing $CI_{search}$ algebraically because it is never supplied with search node counts or solution path lengths. It must discover non-trivial spatial correlations between grid geometry ($X$) and search difficulty ($y$).

---

## 5. Train / Test Threshold Leakage Mitigation

### 5.1 Dataset-Level Threshold Leakage Risk
Calculating percentile thresholds ($P_{33.3}, P_{66.7}$) across the full $N = 2,000$ dataset *before* splitting into train/test sets causes **Train/Test Threshold Leakage**. The test set's distribution influences the quantile cuts used to label the training set, violating the core Machine Learning assumption that test data must remain completely unseen.

### 5.2 Corrected Split Protocol
1. Generate $N = 2,000$ synthetic mazes and extract raw features $X$ and benchmark metrics $M_{target}$.
2. Perform an **80% / 20% Train/Test Split** on raw data ($N_{train} = 1,600$, $N_{test} = 400$).
3. Compute quantile cut thresholds ($P_{33.3}^{train}, P_{66.7}^{train}$) **ONLY on $N_{train}$**.
4. Apply the fixed numerical values $P_{33.3}^{train}$ and $P_{66.7}^{train}$ to assign ground-truth difficulty labels $y$ to both $N_{train}$ and $N_{test}$.

---

## 6. Class Balance Strategy & Terminology

### 6.1 Correct Terminology
We explicitly avoid claiming that "real-world maze difficulty naturally has equal class probabilities." Instead, we describe our sampling policy as an **intentionally balanced synthetic dataset** or **controlled equal class representation** (~33.3% Easy, ~33.4% Medium, ~33.3% Hard in training data).

### 6.2 Sampling Rationale
Controlling class distribution during dataset synthesis ensures equal prior probability $P(y = c) = \frac{1}{3}$, preventing model majority-class bias and enabling reliable Macro F1-score evaluation.

---

## 7. Precise Feature Definitions

All spatial features operate on the 4-cardinal direction grid system (Up, Down, Left, Right).

### 7.1 Precise Definition of Dead End
A grid cell $(r, c)$ is defined as a **Dead End** if and only if:
1. It is a traversable path cell (`grid[r][c] !== 1`).
2. It is **NOT** the Start position (`startPos`) and **NOT** the Goal position (`goalPos`). (Excluding Start and Goal prevents mandatory spawn/endpoint coordinates from skewing trap counts).
3. The number of traversable cardinal neighbors (`grid[nr][nc] !== 1`) within grid boundaries is **exactly equal to 1**.

### 7.2 Precise Definition of Branching Point
A grid cell $(r, c)$ is defined as a **Branching Point** if and only if:
1. It is a traversable path cell (`grid[r][c] !== 1`).
2. The number of traversable cardinal neighbors (`grid[nr][nc] !== 1`) within grid boundaries is **greater than or equal to 3** ($\ge 3$).
3. Diagonal neighbors are ignored. Start and Goal cells are included if they have $\ge 3$ open neighbors.

---

## 8. Final Retained Feature Vector ($X$)

| Feature Name | Category | Data Type | Formula / Source | Predictive Utility | Leakage Protection Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `wallDensity` | Spatial | Float | $\frac{\text{wallCount}}{\text{totalCells}}$ | Measures grid tightness & corridor constraints | Pure matrix property; zero search solver data |
| `deadEndRatio` | Spatial | Float | $\frac{\text{deadEndCount}}{\text{openCellCount}}$ | Measures density of dead-end traps | Pure matrix property; Start/Goal endpoints excluded |
| `branchingPointRatio` | Spatial | Float | $\frac{\text{branchingPointCount}}{\text{openCellCount}}$ | Measures decision junction frequency | Pure matrix property; cardinal neighbors $\ge 3$ |
| `straightCorridorRatio` | Spatial | Float | $\frac{\text{straightCorridorCount}}{\text{openCellCount}}$ | Measures long straight hallway frequency | Pure matrix property; collinear cardinal neighbors |
| `turnCorridorRatio` | Spatial | Float | $\frac{\text{turnCorridorCount}}{\text{openCellCount}}$ | Measures corridor corner/turn frequency | Pure matrix property; orthogonal cardinal neighbors |

---

## 9. Feature Redundancy & Model Impact Analysis

### 9.1 Dropped Redundant Features
- `totalCells`: Dropped because it is mathematically $height \times width$.
- `wallCount`, `deadEndCount`, `branchingPointCount`: Dropped in favor of scale-invariant ratios (`wallDensity`, `deadEndRatio`, `branchingPointRatio`) to ensure generalization across variable grid dimensions.
- `shortestPathLength`, `bfsNodesExplored`, `astarNodesExplored`: **EXCLUDED FROM $X$** and reserved exclusively for target benchmark calculation ($M_{target}$) to prevent target leakage.

### 9.2 Algorithm-Specific Collinearity Handling
- **Decision Trees**: Robust against monotonic collinearity, but dropping redundant raw counts simplifies tree depth and feature importance analysis.
- **K-Nearest Neighbors (KNN)**: Highly sensitive to correlated features; using normalized ratios prevents scale distortion along distance axes.
- **Logistic Regression**: Removing collinear raw counts prevents coefficient instability and multi-collinearity inflation.

---

## 10. Dataset Schema & Variable Separation Matrix

```text
{
  "maze_id": "MAZE_00142",
  "seed": 482910,
  "height": 15,
  "width": 15,
  "total_cells": 225,
  "open_cell_count": 113,
  
  // Model Input Features Vector (X) - FED TO ML MODEL
  "wall_density": 0.4978,
  "dead_end_ratio": 0.1150,
  "branching_ratio": 0.0885,
  "straight_corridor_ratio": 0.3805,
  "turn_corridor_ratio": 0.4159,
  
  // Search Benchmark Metrics (M_target) - EXCLUDED FROM ML MODEL VECTOR X
  "shortest_path_length": 24,
  "manhattan_dist": 26,
  "path_detour_factor": 0.9231,
  "search_expansion_ratio": 0.7257,
  "complexity_index_search": 0.8244,
  
  // Target Ground-Truth Label (y) - TARGET TO PREDICT
  "difficulty": 1
}
```

---

## 11. Multi-Size Maze Generalization Strategy

To ensure the model learns structural spatial properties rather than memorizing fixed grid dimensions:
- **Dataset Sample Distribution ($N = 2,000$)**:
  - $15 \times 15$ Mazes: 800 samples (40%)
  - $21 \times 21$ Mazes: 800 samples (40%)
  - $25 \times 25$ Mazes: 400 samples (20%)
- **Scale Invariance**: All features in vector $X$ are normalized ratios relative to `openCellCount` or `totalCells`, ensuring identical feature scales across variable grid dimensions.

---

## 12. Python vs. JavaScript ML Architecture Decision

### 12.1 Recommended Architecture: Hybrid Pipeline
We select a **Hybrid Architecture** combining Python offline training with JavaScript in-browser inference:

1. **JavaScript ES Modules (Phase 8B)**: Generates $2,000$ synthetic mazes, extracts spatial features $X$ and benchmark metrics $M_{target}$, and exports `dataset.json` / `dataset.csv`.
2. **Python `scikit-learn` Pipeline (Phase 8C)**: Trains Decision Tree, KNN, and Logistic Regression models offline. Conducts 5-Fold Stratified Cross-Validation, generates confusion matrices, and extracts feature importances.
3. **JSON Decision Rules Export**: Exports trained decision tree rules into a lightweight `model_rules.json` file ($<5\text{KB}$).
4. **JavaScript Inference Engine (Phase 9)**: Evaluates `model_rules.json` natively in the browser in $<0.1\text{ms}$ with **zero backend server dependencies**.
