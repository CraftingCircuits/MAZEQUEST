# MazeQuest — ML Inference & Integration Architecture (Phase 8D Step 1)

## 1. Executive Summary

This document defines the deployment architecture and technical analysis for integrating machine learning difficulty prediction into **MazeQuest** (Phase 8D).

The objective is to evaluate newly generated maze grids in real time using the 5 spatial features developed in Phase 8B and trained in Phase 8C, predicting difficulty tiers (`Easy`, `Medium`, `Hard`) in $<1\text{ms}$ natively inside the browser with **zero backend server dependencies**.

---

## 2. Training vs. Inference Architecture

```text
TRAINING PIPELINE (Phase 8C - Offline Python)
2,000 Mazes ──► Spatial Extractor (X) ──► 5-Fold Stratified CV ──► Trained Models (.joblib)
                    ▲                                                     │
                    │                                                     ▼
              BFS Solver (M_target) ──► CI_search ──► Difficulty Target y ──► Parameters Export
                                                                                │
================================================================================│================
INFERENCE PIPELINE (Phase 8D - Browser JS)                                     ▼
New Maze ──► Spatial Feature Extractor (X) ──► JS Inference Engine (Pre-trained Parameters) ──► HUD Display
             (Zero Search Solvers Used)                                                    ("Easy", "Medium", "Hard")
```

| Dimension | Offline Training (Phase 8C) | In-Browser Inference (Phase 8D) |
| :--- | :--- | :--- |
| **Runtime Environment** | Python 3.13 (`scikit-learn`, `pandas`) | Vanilla JavaScript ES Modules (Browser) |
| **Execution Trigger** | Batch processing over $N=2,000$ dataset | Single event upon maze generation |
| **Input Feature Vector ($X$)** | 5 spatial features | 5 spatial features (exact identical formulas) |
| **Target Generation ($M_{target}$)** | BFS solver runs to compute $CI_{search}$ | **STRICTLY EXCLUDED** (Solver never runs) |
| **Execution Time Target** | Seconds per batch | $<1\text{ms}$ per maze |

---

## 3. Runtime Input Features vs. Excluded Search Metrics

### Runtime Input Features ($X$) — 5 Spatial Metrics
The browser inference engine computes **ONLY** these 5 spatial features from the raw 2D grid matrix ($O(N)$ scan):
1. `wall_density`: $\frac{\text{wallCount}}{\text{totalCells}}$
2. `dead_end_ratio`: $\frac{\text{deadEndCount}}{\text{openCellCount}}$ (cell with 1 cardinal open neighbor; Start & Goal excluded)
3. `branching_ratio`: $\frac{\text{branchingPointCount}}{\text{openCellCount}}$ (cell with $\ge 3$ cardinal open neighbors)
4. `straight_corridor_ratio`: $\frac{\text{straightCorridorCount}}{\text{openCellCount}}$ (cell with 2 collinear opposite open neighbors)
5. `turn_corridor_ratio`: $\frac{\text{turnCorridorCount}}{\text{openCellCount}}$ (cell with 2 orthogonal 90-degree adjacent open neighbors)

### Strictly Excluded Search Metrics ($M_{target}$)
The following target-generation fields **MUST NOT BE CALCULATED** during inference:
- `shortest_path_length`
- `manhattan_dist`
- `path_detour_factor`
- `bfs_nodes_explored`
- `search_expansion_ratio`
- `complexity_index_search`

---

## 4. Analysis of Candidate Deployment Approaches

### Approach A — Export Decision Tree to JavaScript
- **Description**: Converting `decision_tree.joblib` into a JSON tree structure or JavaScript recursive decision rules.
- **Model Payload**: 1,055 nodes, max depth 22, 528 leaves (~50KB payload).
- **Inference Math**: $O(\text{depth})$ nested `if/else` comparisons.
- **Measured Test Accuracy**: $0.3650$ ($36.50\%$).

### Approach B1 — Export Logistic Regression Parameters to JavaScript
- **Description**: Exporting `StandardScaler` mean/scale vectors and `LogisticRegression` weight matrix/intercepts into a lightweight JS object (~1KB).
- **Model Payload**: 18 numerical floating-point parameters:
  - Scaler Mean $\boldsymbol{\mu} \in \mathbb{R}^5$
  - Scaler Scale $\boldsymbol{\sigma} \in \mathbb{R}^5$
  - Weight Matrix $\mathbf{W} \in \mathbb{R}^{3 \times 5}$
  - Intercept Vector $\mathbf{b} \in \mathbb{R}^3$
- **Inference Math**:
  1. Standardize vector: $z_j = \frac{x_j - \mu_j}{\sigma_j}$
  2. Compute linear logits: $s_k = \sum_{j=1}^5 W_{k,j} z_j + b_k$ for $k \in \{0, 1, 2\}$
  3. Select predicted class: $\hat{y} = \arg\max_k (s_k)$
- **Measured Test Accuracy**: $0.4500$ ($45.00\%$).

### Approach B2 — Export KNN Parameters & Matrix to JavaScript
- **Description**: Exporting scaler parameters, training feature matrix ($1,600 \times 5 = 8,000$ floats), and target labels into JS.
- **Model Payload**: ~70KB vector payload.
- **Inference Math**: Compute 1,600 5D Euclidean distances, sort array, take top $K=7$ majority vote.
- **Measured Test Accuracy**: $0.3675$ ($36.75\%$).

### Approach C — Backend Inference API (Python Flask / FastAPI)
- **Description**: Hosting `.joblib` models on a remote Python server exposing a `POST /predict` HTTP REST endpoint.
- **Model Payload**: Server-side deployment.
- **Inference Math**: Remote Python `joblib` evaluation over HTTP.
- **Measured Test Accuracy**: Matches Python model used ($0.4500$).

---

## 5. Factual Evaluation Across 10 Decision Criteria

| Criteria | Approach A (Decision Tree JS) | Approach B1 (Logistic Regression JS) | Approach B2 (KNN JS) | Approach C (Backend Python API) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Prediction Correctness** | Exact match to tree splits | Exact floating-point logit match | Exact Euclidean distance match | Exact Python model match |
| **2. Preserve Model Exactly** | Preserves 1,055 tree nodes | Preserves 18 exact parameters | Preserves 1,600 training vectors | Preserves raw `.joblib` |
| **3. Browser Compatibility** | Pure JS (Native) | Pure JS (Native) | Pure JS (Native) | Incompatible with static web host |
| **4. Additional Dependencies**| None (0 dependencies) | None (0 dependencies) | None (0 dependencies) | Python, Flask/FastAPI, Uvicorn |
| **5. Deployment Complexity** | Zero (Static frontend) | Zero (Static frontend) | Zero (Static frontend) | High (Server setup, SSL, CORS) |
| **6. Runtime Simplicity** | Fast ($O(\text{depth})$ tree) | Fast ($O(K \cdot d)$ linear math) | Moderate ($O(N \cdot d)$ distances)| Slow (Network HTTP request) |
| **7. Project Architecture Fit**| Excellent (Vanilla ES Module)| Excellent (Vanilla ES Module)| Good (Vanilla ES Module) | Fails static architecture requirement |
| **8. Ease of Viva Explanation**| High (Rule splits) | High (Standardized linear logits)| Moderate (Distance voting) | Low (Over-engineered for static game) |
| **9. Maintainability** | High (Small JSON/JS) | High (18 numerical constants) | Moderate (64KB vector payload) | Low (Dual runtime maintenance) |
| **10. Measured Test Accuracy**| 0.3650 (36.50%) | **0.4500 (45.00%)** | 0.3675 (36.75%) | Matches model used (up to 0.4500) |

---

## 6. Architecture Selection Justification

Based on the explicit technical criteria:
- **Approach B1 (Logistic Regression in JavaScript)** provides the highest observed test accuracy on this dataset ($0.4500$), the smallest payload size (18 numerical float constants, ~1KB), zero external server dependencies, instant $<0.001\text{ms}$ in-browser inference, and perfect compatibility with static web hosting (GitHub Pages / Netlify).
- **Approach A (Decision Tree in JavaScript)** is also viable for rule inspection, but achieved lower test accuracy ($0.3650$) and requires exporting 1,055 tree nodes.
- **Approach C (Backend API)** requires external server infrastructure and breaks the zero-dependency static frontend requirement of MazeQuest.

---

## 7. Planned Inference Data Flow (Phase 8D Step 2)

```text
[Maze Generator] ──► Generate 2D Grid Matrix
                            │
                            ▼
[MazeFeatureExtractor] ──► Extract 5 Spatial Ratios X
                            │
                            ▼
[StandardScaler JS] ──► z_j = (x_j - mean_j) / scale_j
                            │
                            ▼
[LogisticRegression JS] ──► s_k = w_k^T z + b_k  (for k ∈ {0, 1, 2})
                            │
                            ▼
[DifficultyPredictor] ──► pred = argmax(s_k) ──► ["Easy", "Medium", "Hard"]
                            │
                            ▼
[UI Renderer / HUD] ──► Display "Difficulty: Medium" Banner
```

---

## 8. Artifact Inspection Details

Inspection of the Phase 8C serialized model files in `ml/models/` confirmed:

1. **`logistic_regression_pipeline.joblib`**:
   - `StandardScaler.mean_`: `[0.55535563, 0.05393544, 0.04884575, 0.65844906, 0.22979400]`
   - `StandardScaler.scale_`: `[0.01157726, 0.01072921, 0.01060150, 0.02729470, 0.02703779]`
   - `LogisticRegression.coef_` ($3 \times 5$ matrix):
     - Class 0 (Easy): `[+0.32182126, +0.62749220, -0.12254486, +0.52583697, +0.52438155]`
     - Class 1 (Medium): `[+0.01733759, -0.03825105, -0.05483334, -0.21444827, -0.21709348]`
     - Class 2 (Hard): `[-0.33915885, -0.58924115, +0.17737821, -0.31138870, -0.30728807]`
   - `LogisticRegression.intercept_` ($3$-vector):
     - `[-0.00407542, +0.04607552, -0.04200011]`
   - Class Ordering: `[0, 1, 2]` corresponding to Easy, Medium, Hard.
   - Feature Order: `['wall_density', 'dead_end_ratio', 'branching_ratio', 'straight_corridor_ratio', 'turn_corridor_ratio']`.

---

## 9. Verification & Validation Performed

- Verified `ml/models/decision_tree.joblib`, `ml/models/knn_pipeline.joblib`, and `ml/models/logistic_regression_pipeline.joblib` exist.
- Verified exact 5-feature vector ordering and class label assignments.
- Verified feature extraction formulas in `ml/features/mazeFeatureExtractor.js` match Phase 8B definitions.
- Confirmed zero modifications were made to training models, dataset, or gameplay code.
