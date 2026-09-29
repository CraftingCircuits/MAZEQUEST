# MazeQuest — ML Model Training & Evaluation Documentation (Phase 8C)

## 1. Executive Summary

Phase 8C implements offline machine learning model training, hyperparameter selection, 5-Fold Stratified Cross-Validation, model-by-model preprocessing pipelines, untouched test-set evaluation, confusion matrix visualization, model interpretability analysis, and model serialization for **MazeQuest**.

The pipeline loads the authoritative Phase 8B synthetic dataset ($N = 2,000$), trains three approved multiclass classifiers (**Decision Tree**, **K-Nearest Neighbors**, and **Logistic Regression**) on 5 spatial input features ($X$), evaluates performance on an untouched 400-record Test split, exports 3x3 confusion matrix PNGs, saves machine-readable `ml/evaluation/results.json`, and serializes trained model pipelines to `ml/models/*.joblib`.

---

## 2. Confirmed ML Problem Formulation

- **Problem Type**: Supervised Multiclass Classification
- **Input Vector ($X$)**: 5 spatial topological features (normalized ratios)
- **Target Variable ($y$)**: Algorithmic / Search Difficulty tier
  - `0`: Easy ($CI_{search} \le 1.2311$)
  - `1`: Medium ($1.2311 < CI_{search} \le 1.7412$)
  - `2`: Hard ($CI_{search} > 1.7412$)
- **Objective**: Learn mapping function $f: X \rightarrow y$ from spatial maze geometry to search difficulty without running search solvers during inference.

---

## 3. Input Features vs. Target Isolation (Target Leakage Safeguards)

### Approved Model Input Features ($X$)
```python
FEATURE_COLUMNS = [
    'wall_density',
    'dead_end_ratio',
    'branching_ratio',
    'straight_corridor_ratio',
    'turn_corridor_ratio'
]
```

### Strictly Excluded Target-Generation Metrics ($M_{target}$)
The following 6 search benchmark fields are **STRICTLY EXCLUDED** from model input $X$:
- `shortest_path_length`
- `manhattan_dist`
- `path_detour_factor`
- `bfs_nodes_explored`
- `search_expansion_ratio`
- `complexity_index_search`

**Leakage Safeguard Status**: No direct/circular target leakage was identified. Spatial input features ($X$) naturally correlate with the search-derived target ($y$), which is expected and represents the core learning objective of the ML task. Automated assertion guards in the training script enforce that no direct target-generation metrics enter vector $X$.

---

## 4. Train / Test Dataset Split

Phase 8C preserves the exact Phase 8B split (seed = 42):
- **Training Set**: $1,600$ records ($80\%$)
- **Testing Set**: $400$ records ($20\%$, untouched during hyperparameter selection and training)

---

## 5. Model Configurations & Preprocessing Pipelines

To eliminate preprocessing leakage between folds and test data, feature scaling is encapsulated inside `scikit-learn` `Pipeline` objects:

1. **Decision Tree Classifier**:
   - `DecisionTreeClassifier(random_state=42, criterion='gini')`
   - Preprocessing: None (Decision Trees are invariant to monotonic scaling).

2. **K-Nearest Neighbors (KNN)**:
   - `Pipeline([('scaler', StandardScaler()), ('knn', KNeighborsClassifier(n_neighbors=7))])`
   - Hyperparameter Selection: Evaluated $K \in [3, 5, 7, 9]$ using 5-Fold Stratified CV on Training set. $K=7$ yielded highest mean CV accuracy ($0.4050$) and was selected.

3. **Logistic Regression**:
   - `Pipeline([('scaler', StandardScaler()), ('lr', LogisticRegression(random_state=42, max_iter=1000))])`
   - Preprocessing: `StandardScaler` fitted exclusively inside pipeline folds.

---

## 6. 5-Fold Stratified Cross-Validation (Training Split Only)

Cross-validation was conducted exclusively on the 1,600 Training records using `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`:

| Model | Fold 1 Acc | Fold 2 Acc | Fold 3 Acc | Fold 4 Acc | Fold 5 Acc | Mean CV Acc | CV Std | Mean Weighted F1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Decision Tree** | 0.4000 | 0.3531 | 0.3656 | 0.4125 | 0.4062 | **0.3875** | $\pm 0.0236$ | 0.3811 |
| **KNN ($K=7$)** | 0.3656 | 0.3844 | 0.4031 | 0.4094 | 0.4625 | **0.4050** | $\pm 0.0326$ | 0.4035 |
| **Logistic Regression** | 0.4469 | 0.3812 | 0.4781 | 0.4344 | 0.4812 | **0.4444** | $\pm 0.0363$ | 0.4231 |

---

## 7. Factual Model Test Evaluation (400 Untouched Test Records)

Models were evaluated on the 400 untouched Test records:

| Model | Test Acc | Weighted Precision | Weighted Recall | Weighted F1 | Macro F1 | Mean CV Acc |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Decision Tree** | 0.3650 | 0.3613 | 0.3650 | 0.3594 | 0.3596 | 0.3875 |
| **K-Nearest Neighbors ($K=7$)** | 0.3675 | 0.3700 | 0.3675 | 0.3677 | 0.3674 | 0.4050 |
| **Logistic Regression** | **0.4500** | **0.4414** | **0.4500** | **0.4304** | **0.4268** | **0.4444** |

*Factual Observation*: Logistic Regression achieved the highest observed test accuracy ($0.4500$) among the three evaluated models on this dataset.

### Per-Class Test Performance (Logistic Regression)
- **Easy (Class 0)**: Precision = $0.5089$, Recall = $0.4161$, F1 = $0.4578$, Support = 137
- **Medium (Class 1)**: Precision = $0.3544$, Recall = $0.2205$, F1 = $0.2718$, Support = 127
- **Hard (Class 2)**: Precision = $0.4545$, Recall = $0.6985$, F1 = $0.5507$, Support = 136

---

## 8. Confusion Matrix Verification

Confusion matrix PNG plots were generated and saved to [`ml/evaluation/confusion_matrices/`](../ml/evaluation/confusion_matrices/):
- [`decision_tree_confusion_matrix.png`](../ml/evaluation/confusion_matrices/decision_tree_confusion_matrix.png)
- [`knn_confusion_matrix.png`](../ml/evaluation/confusion_matrices/knn_confusion_matrix.png)
- [`logistic_regression_confusion_matrix.png`](../ml/evaluation/confusion_matrices/logistic_regression_confusion_matrix.png)

### Factual Confusion Matrix Verification

1. **Logistic Regression**:
   $$\begin{pmatrix} 57 & 27 & 53 \\ 38 & 28 & 61 \\ 17 & 24 & 95 \end{pmatrix}$$
   - Row 0 (Actual Easy): $57 + 27 + 53 = 137$
   - Row 1 (Actual Medium): $38 + 28 + 61 = 127$
   - Row 2 (Actual Hard): $17 + 24 + 95 = 136$
   - Diagonal sum: $57 + 28 + 95 = 180$ correct predictions ($180 / 400 = 0.4500$).

2. **Decision Tree**:
   $$\begin{pmatrix} 62 & 41 & 34 \\ 45 & 51 & 31 \\ 51 & 52 & 33 \end{pmatrix}$$
   - Diagonal sum: $62 + 51 + 33 = 146$ correct predictions ($146 / 400 = 0.3650$).

3. **K-Nearest Neighbors ($K=7$)**:
   $$\begin{pmatrix} 52 & 45 & 40 \\ 42 & 49 & 36 \\ 37 & 53 & 46 \end{pmatrix}$$
   - Diagonal sum: $52 + 49 + 46 = 147$ correct predictions ($147 / 400 = 0.3675$).

---

## 9. Feature Importance & Model Interpretability

### Decision Tree Feature Importances (Sum Verification)
1. `straight_corridor_ratio`: **$0.3173$** ($31.73\%$)
2. `turn_corridor_ratio`: **$0.2638$** ($26.38\%$)
3. `dead_end_ratio`: **$0.2026$** ($20.26\%$)
4. `branching_ratio`: **$0.1334$** ($13.34\%$)
5. `wall_density`: **$0.0829$** ($8.29\%$)

$$\text{Sum} = 0.3173 + 0.2638 + 0.2026 + 0.1334 + 0.0829 = 1.0000 \quad (100.00\%)$$
*(Note: Unrounded floating-point sum equals exactly 1.0000; minor 4th-decimal-place display rounding preserves exact unit sum).*

### Logistic Regression Standardized Coefficients
- **Easy Class (0)**: Positive coefficient on `dead_end_ratio` ($+0.6275$), `straight_corridor_ratio` ($+0.5258$), `turn_corridor_ratio` ($+0.5244$), `wall_density` ($+0.3218$).
- **Hard Class (2)**: Negative coefficient on `dead_end_ratio` ($-0.5892$), `wall_density` ($-0.3392$), `straight_corridor_ratio` ($-0.3114$), positive coefficient on `branching_ratio` ($+0.1774$).

### KNN Interpretability
KNN is an instance-based non-parametric classifier. It makes predictions by voting among $K=7$ nearest neighbors in 5D standardized Euclidean space, so it has no static feature weight coefficients.

---

## 10. `wall_density` Interpretation & Grid Dimension Association

`wall_density` is strongly associated with maze dimension in this dataset because the recursive-backtracking generator produces a fixed open-cell count for each maze dimension:
- `0.5689` ($15 \times 15$)
- `0.5488` ($21 \times 21$)
- `0.5408` ($25 \times 25$)

Decision Tree assigns an $8.29\%$ feature importance weight to `wall_density`, indicating that grid dimension contributes to decision tree split selection alongside corridor layout metrics (`straight_corridor_ratio` and `turn_corridor_ratio`).

---

## 11. Empirical Post-Hoc Error Analysis

Statistical analysis of misclassified test instances reveals the following factual patterns:

### Logistic Regression Misclassification Breakdown
1. **Actual Easy (Class 0) predicted as Hard (Class 2)** ($53$ test samples):
   - Mean `wall_density`: $0.5469$ (median = $0.5488$), indicating these samples are concentrated in $25\times25$ mazes (`wall_density` = 0.5408).
   - Mean `complexity_index_search`: $0.9980$ (true Easy range).
   - *Data Pattern*: Because Logistic Regression assigned a negative coefficient to `wall_density` for Class 2 ($-0.3392$), $25\times25$ grid dimensions increase the logit for Hard prediction even when search complexity is low.

2. **Actual Medium (Class 1) predicted as Hard (Class 2)** ($61$ test samples):
   - Mean `wall_density`: $0.5474$ (median = $0.5488$), similarly concentrated in $25\times25$ mazes.
   - Mean `complexity_index_search`: $1.4880$.

3. **Actual Medium (Class 1) predicted as Easy (Class 0)** ($38$ test samples):
   - Mean `wall_density`: $0.5663$ (median = $0.5689$), concentrated in $15\times15$ mazes (`wall_density` = 0.5689).
   - Mean `complexity_index_search`: $1.4504$.

---

## 12. Reproducibility & Artifact Serialization

- **Random State**: Seed = 42 for dataset splitting, cross-validation, and model initialization.
- **Environment Versions**:
  - Python: `3.13.5`
  - pandas: `2.3.2`
  - numpy: `2.3.3`
  - scikit-learn: `1.8.0`
  - matplotlib: `3.10.6`
  - joblib: `1.5.3`
- **Output Files**:
  - [`ml/evaluation/results.json`](../ml/evaluation/results.json)
  - [`ml/models/decision_tree.joblib`](../ml/models/decision_tree.joblib)
  - [`ml/models/knn_pipeline.joblib`](../ml/models/knn_pipeline.joblib)
  - [`ml/models/logistic_regression_pipeline.joblib`](../ml/models/logistic_regression_pipeline.joblib)

---

## 13. Academic Limitations

1. **Synthetic Data Distribution**: Models are trained on procedurally generated Recursive Backtracking mazes. Generalization to hand-crafted or non-grid mazes is unproven.
2. **Algorithmic vs Human Difficulty**: Difficulty labels reflect BFS search space expansion and path detour factor ($CI_{search}$), which measure solver graph complexity rather than human player cognitive load.
3. **Discrete Grid Sizes**: The dataset is restricted to 3 grid sizes ($15\times15, 21\times21, 25\times25$), tying `wall_density` values to discrete dimension steps.
