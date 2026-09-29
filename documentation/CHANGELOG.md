# CHANGELOG

All notable changes to the **MazeQuest** project will be documented in this file.

---

## [Phase 8 — Gameplay UX & Difficulty Selection] - 2026-09-29

### Added & Implemented
- **Home Page Cleanup**: Removed academic AI & ML project badge from `index.html`. Preserved branding, description, and game functionality.
- **Difficulty Selection Screen (`#difficulty-shell`)**: Implemented pre-gameplay difficulty selection flow (`HOME -> DIFFICULTY SELECTION -> GAMEPLAY`) featuring a 3-stepped slider (EASY, MEDIUM, HARD), visual preview card, and circular help modal.
- **Dynamic Theme Engine**: Created CSS theme variables (`.theme-easy`, `.theme-medium`, `.theme-hard`) driving 200–300 ms smooth transitions for visual previews, emojis (😊, 🤔, 😤), slider fill/thumb, Play button, and HUD mode pill badges.
- **State Management & Level Progression**: Integrated `selectedDifficulty` state into `GameState` and `App`, ensuring chosen difficulty persists across level progression (`Level 1 -> Level 2 -> Level 3`).
- **Topology-Aware Maze Generation**: Enhanced `MazeGenerator.generateForDifficulty` with controlled dead-end braiding (`braidRatio`: 10% for Easy, 25% for Medium, 40% for Hard) to introduce distractor loops, alternate routes, and non-obvious Start-to-Goal paths.
- **AI & Gameplay Regression Verification**: Confirmed 100% solver compatibility across BFS, DFS, Best-First, and A* on braided mazes, including AI visualization playback and factual algorithm comparison charts.
- **Documentation**: Created `documentation/DIFFICULTY_SYSTEM.md`, updated `documentation/SYSTEM_ARCHITECTURE.md`, `README.md`, `documentation/CHANGELOG.md`, and added Phase 8 UX questions (Q31–Q34) to `documentation/VIVA_NOTES.md`.

---

## [Phase 8C — ML Model Training & Evaluation] - 2026-09-29

### Added & Implemented
- **ML Training Architecture & Preprocessing**: Implemented `ml/training/preprocessing.py` enforcing strict schema verification (24 fields, 2,000 records), zero target leakage assertions, and model-by-model pipeline encapsulation with `StandardScaler`.
- **Model Training & Cross-Validation**: Implemented `ml/training/train_models.py` executing 5-Fold Stratified Cross-Validation on the 1,600-record Training split and investigating KNN hyperparameter $K \in [3, 5, 7, 9]$ (selecting $K=7$).
- **Test Set Evaluation & Visualization**: Implemented `ml/training/evaluate_models.py` evaluating Decision Tree, KNN, and Logistic Regression on 400 untouched Test records, generating 3x3 confusion matrix plots (`decision_tree_confusion_matrix.png`, `knn_confusion_matrix.png`, `logistic_regression_confusion_matrix.png`), conducting error analysis, and analyzing `wall_density` behavior.
- **Pipeline Runner & Serialization**: Implemented `ml/training/pipeline_runner.py` exporting machine-readable `ml/evaluation/results.json` and serializing trained pipelines to `ml/models/*.joblib`.
- **Automated ML Unit Tests**: Created `ml/training/test_ml_pipeline.py` with 6 automated unit tests validating schema, leak-free feature isolation, pipeline preprocessing, and output shape assertions.
- **Documentation & Viva Notes**: Created `documentation/ML_MODEL_TRAINING.md`, updated `documentation/SYSTEM_ARCHITECTURE.md`, `README.md`, `documentation/CHANGELOG.md`, and added Section 8 to `documentation/VIVA_NOTES.md` (30 Viva Q&As).

---

## [Phase 8B — ML Feature Extraction & Dataset Generation] - 2026-09-29

### Added & Implemented
- **Modular Feature Extractor Structure**: Created `ml/features/mazeFeatureExtractor.js` and `ml/features/mazeFeatureExtractor.test.js` implementing spatial input vector $X$ (`wallDensity`, `deadEndRatio`, `branchingPointRatio`, `straightCorridorRatio`, `turnCorridorRatio`) and search benchmark vector $M_{target}$ (`shortestPathLength`, `manhattanDistance`, `pathDetourFactor`, `searchExpansionRatio`, `complexityIndexSearch`).
- **Synthetic Dataset Generator Engine**: Created `ml/dataset/datasetGenerator.js` to generate $N = 2,000$ synthetic mazes ($15\times15 \rightarrow 800$, $21\times21 \rightarrow 800$, $25\times25 \rightarrow 400$) using Mulberry32 PRNG seed offset.
- **Train-Only Quantile Thresholding**: Implemented deterministic 80%/20% Train/Test split where $P_{33.3}^{train} = 1.2311$ and $P_{66.7}^{train} = 1.7412$ are computed exclusively on the 1,600 Training records to label both train and test sets into ternary classes ($y \in \{0, 1, 2\}$: Easy, Medium, Hard).
- **Dataset Validator & Pipeline Runner**: Created `ml/dataset/datasetValidator.js` and `ml/dataset/runDatasetPipeline.js` to run schema checks, range validations, missing-value assertions, summary statistics calculations (`min, max, mean, median, std`), and export authoritative `data/ml/dataset.csv` and `data/ml/dataset.json`.
- **Unit Test Suites**: Implemented 25 automated unit tests covering spatial features, corridor ratios, detour handling, edge cases (Start = Goal), dataset generation, and quantile threshold isolation.
- **Documentation Updates**: Created `documentation/ML_FEATURE_EXTRACTION.md`, updated `documentation/SYSTEM_ARCHITECTURE.md`, `documentation/VIVA_NOTES.md` (20 Phase 8B Viva Q&As), `documentation/CHANGELOG.md`, and `README.md`.

---

## [Phase 8A — ML Problem Definition & Feature Design (Corrected)] - 2026-09-29

### Added & Corrected
- **Target Leakage Architecture Revision**: Eliminated circular target leakage by separating pure spatial grid input features $X$ (`wallDensity`, `deadEndRatio`, `branchingPointRatio`, `straightCorridorRatio`, `turnCorridorRatio`) from search output benchmark metrics $M_{target}$ (`pathDetourFactor`, `searchExpansionRatio`).
- **ML Feature Extractor Class Update**: Updated `maze/feature_extractor.js` exposing `MazeFeatureExtractor.extract(grid, start, goal)` returning separated `{ featuresX, benchmarkM }` vectors.
- **Train/Test Threshold Leakage Protocol**: Defined strict training-split quantile thresholding where percentile cuts ($P_{33.3}^{train}, P_{66.7}^{train}$) are calculated exclusively on the 80% training set and applied to the 20% test set.
- **ML Problem Definition Documentation**: Updated `documentation/ML_PROBLEM_DEFINITION.md` with 6 candidate labeling strategy analyses, mathematical proofs of leakage elimination, dataset separation schema, and hybrid JS/Python training architecture.
- **Academic Viva Preparation Notes Update**: Updated Section 6 of `documentation/VIVA_NOTES.md` with viva Q&As covering target leakage prevention, spatial vs search separation, and train/test threshold isolation.

---

## [Phase 7C — AI Algorithm Comparison] - 2026-09-29

### Added
- **AI Comparator Engine**: Implemented `ai/comparison/comparator.js` to execute all four search solvers (**BFS**, **DFS**, **Greedy Best-First**, **A***) synchronously on the exact same maze grid instance.
- **Automated Path Validation & Optimality Suite**: Added path continuity checks (endpoint alignment, non-wall steps, orthogonal adjacent steps) and A* vs BFS path length equality verification on solvable unweighted grid mazes.
- **Automated Comparator Test Suite**: Created `ai/comparison/comparator_test.js` validating solvable maze execution, same-maze repeatability, unsolvable maze failure handling, and start equals goal edge cases.
- **Comparison UI Control & Modal Overlay**: Added "Compare" button (`#btn-compare-ai`) to the AI control panel and built a glassmorphism comparison modal (`#ai-comparison-modal`) in `index.html` and `main.css`.
- **Factual Comparison Table & Proportional Bar Charts**: Implemented a responsive comparison table and dual proportional CSS bar charts for **Nodes Explored** and **Execution Time** without subjective algorithm rankings or winner labels.
- **AI Comparison Architecture Documentation**: Created `documentation/AI_COMPARISON.md` detailing architecture, data flow, metrics definitions, and non-destructive benchmarking rules.
- **Academic Viva Notes Update**: Added Section 5 to `documentation/VIVA_NOTES.md` with 12 viva questions and answers covering comparative benchmarking, metric interpretation, and optimality checks.

---

## [Phase 7B — Four-Algorithm AI Visualization] - 2026-09-29

### Added
- **Four-Algorithm Unified Visualization Flow**: Integrated all four AI search solvers (**BFS**, **DFS**, **Greedy Best-First**, **A***) into the shared `AIVisualizer` controller.
- **Algorithm Selector UI**: Connected UI dropdown selector (`#select-algorithm`) to execute the selected solver dynamically on the current maze grid upon clicking **Run AI**.
- **Common SearchResult Standardization**: Verified that all four solvers consume the uniform `solve(mazeGrid, startPos, goalPos)` signature and return standard `SearchResult` objects (`algorithm`, `success`, `path`, `visitedNodes`, `nodesExplored`, `pathLength`, `executionTimeMs`).
- **Same-Maze Preservation**: Guaranteed that AI visualization runs non-destructively on the existing maze grid without mutating maze walls, start/goal coordinates, level number, or player state.
- **Player Gameplay & Safety Isolation**: Confirmed player keyboard navigation (WASD / Arrow Keys) operates independently before, during, and after AI search visualization.
- **Four-Algorithm Visualization Documentation**: Updated `documentation/AI_VISUALIZATION.md` with architectural data-flow diagrams, component descriptions, statistics HUD specifications, and cancellation safety rules.
- **Academic Viva Notes Update**: Added 10 viva questions and answers covering four-algorithm visual decoupling, common result schemas, same-maze comparison principles, and search strategy trade-offs in `documentation/VIVA_NOTES.md`.

---

## [Phase 7A — AI Search Visualization Engine] - 2026-09-29

### Added
- **AI Visualization Controller**: Implemented `ai/visualization/visualizer.js` to animate search node expansion (`visitedNodes`) and final path (`path`) on the HTML5 Canvas asynchronously without blocking the UI main thread.
- **Canvas Renderer Overlay Support**: Updated `CanvasRenderer.render(gameState, vizState)` to render translucent indigo/cyan exploration overlays, emerald path trails, and pulsing current evaluation markers without altering underlying grid data.
- **AI Control Panel & Stats Banner**: Updated `index.html` and `main.css` adding algorithm dropdown selector (BFS, DFS, Best-First, A*), speed selector (Slow, Normal, Fast), "Run AI" button, "Clear Overlay" button, and factual statistics banner.
- **Animation Cancellation Guards**: Added `visualizer.cancel()` logic clearing active timeouts and resetting state when players restart levels, generate new mazes, advance levels, or move manually.
- **Visualization Architecture Documentation**: Created `documentation/AI_VISUALIZATION.md` detailing architectural decoupling, timing separation, animation lifecycle, and cancellation guards.

---

## [Phase 6D — A* Search Solver] - 2026-09-29

### Added
- **A* Search Solver**: Implemented `ai/astar/astar.js` using evaluation function $f(n) = g(n) + h(n)$.
- **Automated A* Test Suite**: Created `ai/astar/astar_test.js`.
