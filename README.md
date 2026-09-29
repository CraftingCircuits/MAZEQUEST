# MAZEQUEST

> **Find the path. Outsmart the maze.**

MazeQuest is an academic web-based maze adventure game built to demonstrate state-space AI search algorithms and machine learning difficulty prediction.

---

## Current Status: Feature-Complete Engine & Pre-Inference Integration

The project has completed its core development phases:
1. **Interactive UI & Difficulty System**: Pre-gameplay 3-stepped difficulty slider (EASY, MEDIUM, HARD) with dynamic 200–300 ms theme transitions, emoji state indicators, and persistent difficulty across level progression.
2. **Topology-Aware Maze Generation**: Procedural generation using Recursive Backtracking combined with controlled dead-end braiding (10% to 40% braid ratios) to introduce distractor loops and non-obvious routes.
3. **Four AI Search Solvers**: Deterministic solvers for Breadth-First Search (BFS), Depth-First Search (DFS), Greedy Best-First Search, and A* Search.
4. **AI Visualization & Comparison**: Asynchronous step-by-step search exploration animation and factual multi-solver comparison benchmarks with path validation checks.
5. **Machine Learning Pipeline**: Complete dataset generation (2,000 synthetic mazes), feature engineering (5 spatial features), and ML model training/evaluation (Decision Tree, KNN, Logistic Regression) with serialized model artifacts and confusion matrix visual reports.

---

## Main Features

- **Procedural Maze Engine**: Seeded random generation supporting 100% reproducible grids and controlled dead-end wall removal.
- **Stepped Difficulty Selection**: Select between Easy ($15\times15$), Medium ($21\times21$), and Hard ($25\times25$) modes before starting a game session.
- **Responsive HTML5 Canvas Engine**: Crisp 60 FPS grid rendering with custom player avatar, start/goal indicators, and translucent exploration overlays.
- **AI Search Controls**: Run any solver on demand with adjustable speed presets (Slow, Normal, Fast) or compare all four algorithms synchronously.
- **Offline ML Training & Evaluation**: Stratified 5-Fold Cross-Validation, feature scaling pipelines, confusion matrix export, and model serialization using Python `scikit-learn`.

---

## Tech Stack & Architecture

- **Frontend Core**: HTML5, Vanilla CSS3 (Custom Properties & Glassmorphism System), Vanilla JavaScript (ES6+ Modules).
- **AI Search Solvers**:
  - `BFSSolver.js`: Level-by-level queue traversal guaranteeing optimal shortest paths in unweighted graphs.
  - `DFSSolver.js`: Deep LIFO stack traversal returning valid maze paths.
  - `BestFirstSolver.js`: Heuristic search ($f(n) = h(n)$) using Manhattan Distance.
  - `AStarSolver.js`: Optimal heuristic search ($f(n) = g(n) + h(n)$).
- **AI Comparison Engine**: `AIComparator.js` providing synchronous multi-solver benchmarking, path continuity validation, A* vs BFS optimality verification, and comparative bar chart rendering.
- **AI Visualization Engine**: `AIVisualizer.js` providing step-by-step exploration playback, final path highlights, speed controls, and animation cancellation guards.
- **Procedural & Feature Engine**:
  - `MazeGenerator.js`: Recursive Backtracking with Mulberry32 PRNG seed support and controlled dead-end braiding.
  - `mazeFeatureExtractor.js`: Extracts 5 spatial features ($X$) and 6 target-generation benchmark metrics ($M_{target}$).
  - `datasetGenerator.js`: Synthesizes 2,000 mazes using train-only percentile cuts ($P_{33.3}^{train}$ and $P_{66.7}^{train}$).
- **Offline ML Pipeline**: Python 3.13 (`pandas`, `scikit-learn`, `matplotlib`, `joblib`) implementing 5-Fold Stratified CV, preprocessing pipelines, confusion matrix rendering, and `.joblib` serialization.

---

## Difficulty System

MazeQuest provides three stepped difficulty levels aligned with the ML target classification schema:

| Mode | Grid Size | Braid Ratio | Visual Theme | Emoji | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EASY** (0) | $15 \times 15$ | 10% (0.10) | Emerald Green (`#10b981`) | 😊 | Relaxed maze size with open paths and light distractor routes. |
| **MEDIUM** (1) | $21 \times 21$ | 25% (0.25) | Amber Orange (`#f59e0b`) | 🤔 | Balanced maze size with moderate branching and misleading turns. |
| **HARD** (2) | $25 \times 25$ | 40% (0.40) | Crimson Red (`#ef4444`) | 😤 | Dense maze size with high branching and complex distractor loops. |

Difficulty is selected before starting a session and remains active across level progression (`Level 1 -> Level 2 -> Level 3`).

---

## Machine Learning Results Summary

Models were trained on 1,600 training records using 5-Fold Stratified Cross-Validation and evaluated on 400 untouched test records:

| Model Algorithm | Hyperparameters / Pipeline | Test Accuracy | Precision (Macro) | Recall (Macro) | F1-Score (Macro) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | `StandardScaler`, $C=1.0, \text{lbfgs}$ | **98.75%** | 0.9877 | 0.9876 | **0.9876** |
| **Decision Tree** | `max_depth=5, min_samples_split=5` | **97.25%** | 0.9734 | 0.9731 | **0.9731** |
| **K-Nearest Neighbors** | `StandardScaler`, $K=7, \text{distance}$ weights | **96.50%** | 0.9658 | 0.9654 | **0.9654** |

---

## Project Structure

```text
MazeQuest/
│
├── index.html                  # Main Web Application & Game Shell
├── README.md                   # Project Overview & Quick Start
│
├── data/
│   └── ml/
│       ├── dataset.csv         # Authoritative 2,000 synthetic maze dataset (CSV)
│       └── dataset.json        # Authoritative 2,000 synthetic maze dataset (JSON)
│
├── ml/
│   ├── README.md               # ML Module directory overview
│   ├── features/
│   │   ├── mazeFeatureExtractor.js     # Spatial feature & benchmark metric extractor
│   │   └── mazeFeatureExtractor.test.js# Automated feature extractor unit test suite
│   ├── dataset/
│   │   ├── datasetGenerator.js # 2,000 synthetic maze dataset generator
│   │   ├── datasetValidator.js # Schema, bounds, and summary stats validator
│   │   ├── datasetGenerator.test.js# Automated dataset generator test suite
│   │   └── runDatasetPipeline.js   # Dataset pipeline executable runner
│   ├── training/
│   │   ├── preprocessing.py    # Schema validation, feature isolation, and pipeline builders
│   │   ├── train_models.py     # KNN K investigation, 5-Fold Stratified CV, model fitting
│   │   ├── evaluate_models.py  # Test evaluation, confusion matrix PNG generator, error analysis
│   │   ├── pipeline_runner.py  # End-to-end ML training runner script
│   │   └── test_ml_pipeline.py # Automated unit test suite for ML pipeline
│   ├── evaluation/
│   │   ├── results.json        # Machine-readable evaluation metrics & metadata
│   │   └── confusion_matrices/ # 3x3 Confusion matrix PNG plots
│   └── models/
│       ├── decision_tree.joblib# Serialized Decision Tree model
│       ├── knn_pipeline.joblib # Serialized KNN pipeline with StandardScaler
│       └── logistic_regression_pipeline.joblib # Serialized Logistic Regression pipeline
│
├── frontend/
│   ├── css/
│   │   └── main.css            # Stylesheet, CSS variables, themes, HUD, Canvas, AI Panel, Comparison Modal
│   └── js/
│       ├── config.js           # Configuration constants
│       ├── app.js              # Application controller shell & view transitions
│       ├── main.js             # ES Module entry point
│       └── engine/
│           ├── game_state.js   # Game state manager & level progression logic
│           ├── renderer.js     # HTML5 Canvas renderer with AI visualization overlay
│           └── input_handler.js# WASD & Arrow keys keyboard controller
│
├── maze/
│   ├── maze_generator.js       # Procedural generator with seed support & dead-end braiding
│   ├── feature_extractor.js    # Reusable topological maze feature extractor re-export
│   └── EXPLANATION.md          # Generation algorithm & collision docs
│
├── ai/
│   ├── common/
│   │   ├── search_result.js    # Standardized AI search result schema
│   │   └── priority_queue.js   # Min-heap priority queue data structure
│   ├── visualization/
│   │   └── visualizer.js       # Asynchronous AI search visualization controller
│   ├── comparison/
│   │   ├── comparator.js       # Synchronous 4-algorithm comparison engine
│   │   └── comparator_test.js  # Comparison test suite runner
│   ├── bfs/
│   │   ├── bfs.js              # Pure Breadth-First Search solver
│   │   ├── bfs_test.js         # BFS test suite runner
│   │   └── EXPLANATION.md      # BFS theory & worked example
│   ├── dfs/
│   │   ├── dfs.js              # Pure Depth-First Search solver
│   │   ├── dfs_test.js         # DFS test suite runner
│   │   └── EXPLANATION.md      # DFS theory & worked example
│   ├── best_first/
│   │   ├── best_first.js       # Pure Greedy Best-First Search solver
│   │   ├── best_first_test.js  # Best-First test suite runner
│   │   └── EXPLANATION.md      # Best-First theory & worked example
│   └── astar/
│       ├── astar.js            # Pure A* Search solver
│       ├── astar_test.js        # A* test suite runner
│       └── EXPLANATION.md      # A* theory & worked example
│
└── documentation/
    ├── SYSTEM_ARCHITECTURE.md  # Detailed technical blueprint
    ├── DIFFICULTY_SYSTEM.md    # Difficulty selection architecture & dead-end braiding docs
    ├── AI_SEARCH_ARCHITECTURE.md# Formal state-space formulation & solver comparison
    ├── AI_VISUALIZATION.md     # AI Search Visualization architecture & data flow
    ├── AI_COMPARISON.md        # AI Algorithm Comparison architecture & data flow
    ├── ML_PROBLEM_DEFINITION.md# Machine Learning problem formulation & feature spec
    ├── ML_FEATURE_EXTRACTION.md# Feature extraction, target derivation & validation docs
    ├── ML_MODEL_TRAINING.md    # ML model training, cross-validation & evaluation docs
    ├── LEVEL_SYSTEM.md         # Level progression architecture & data flow
    ├── CHANGELOG.md            # Version history
    └── VIVA_NOTES.md           # Academic Q&A and viva preparation notes
```

---

## How to Run

1. Open a local HTTP web server in the project root directory:
   - Using Python: `python -m http.server 8000`
   - Using VS Code Live Server extension.
2. Open a web browser and navigate to `http://localhost:8000`.
3. Click **Start Game**, select a difficulty (Easy, Medium, Hard), and click **Play Game**.
4. In the gameplay AI Control Panel:
   - Click **Run AI** to animate the selected solver.
   - Click **Compare** to run all 4 solvers synchronously and view comparative charts.

To re-run the ML Training Pipeline via Python CLI:
```bash
python -m ml.training.pipeline_runner
```

To run the ML Pipeline Unit Tests:
```bash
python -m unittest ml/training/test_ml_pipeline.py
```

---

## Documentation References

- [System Architecture](documentation/SYSTEM_ARCHITECTURE.md)
- [Difficulty System & Topology](documentation/DIFFICULTY_SYSTEM.md)
- [AI Search Architecture](documentation/AI_SEARCH_ARCHITECTURE.md)
- [AI Search Visualization](documentation/AI_VISUALIZATION.md)
- [AI Algorithm Comparison](documentation/AI_COMPARISON.md)
- [ML Problem Definition](documentation/ML_PROBLEM_DEFINITION.md)
- [ML Feature Extraction](documentation/ML_FEATURE_EXTRACTION.md)
- [ML Model Training](documentation/ML_MODEL_TRAINING.md)
- [Level Progression System](documentation/LEVEL_SYSTEM.md)
- [Viva Preparation Notes](documentation/VIVA_NOTES.md)
- [Changelog](documentation/CHANGELOG.md)

---

## Future Scope

- **Phase 8D ML Inference Integration**: Transpile decision rules or export model weights for real-time in-browser difficulty prediction on the HUD.
- **Adaptive Difficulty**: Dynamically select upcoming maze grid sizes and braiding ratios based on player movement performance metrics.
- **Expanded Grid Topologies**: Support non-square lattices, hexagonal grids, or custom user-drawn maze obstacles.



