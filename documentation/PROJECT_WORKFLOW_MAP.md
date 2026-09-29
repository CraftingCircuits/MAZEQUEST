# MAZEQUEST — COMPLETE PROJECT WORKFLOW & DOCUMENTATION ROADMAP

---

## 1. Project Purpose

**MazeQuest** is an academic web-based maze adventure game designed to demonstrate:
1. **State-Space AI Search Algorithms**: BFS, DFS, Greedy Best-First, and A* Search.
2. **Procedural Maze Generation**: Recursive Backtracking with controlled dead-end braiding for topology improvement.
3. **Machine Learning Difficulty Classification**: Supervised models (Decision Tree, KNN, Logistic Regression) predicting maze complexity from spatial features.

---

## 2. Application Starting Point

```text
User
  ↓ (opens browser at http://localhost:8000)
index.html
  ↓ (loads stylesheet)
frontend/css/main.css
  ↓ (loads ES Module entry point)
frontend/js/main.js
  ↓ (instantiates & initializes)
frontend/js/app.js
  ↓ (initializes GameState & Renderer)
frontend/js/engine/game_state.js + frontend/js/engine/renderer.js
  ↓ (generates initial procedural maze)
maze/maze_generator.js
  ↓ (renders canvas & waits for user input)
Gameplay Ready
```

---

## 3. Complete Runtime Workflow

```text
Home Screen (`#landing-shell`)
  │
  ▼ [Click "Start Game"]
Difficulty Selection (`#difficulty-shell`)
  │ (User drags slider: EASY = 15x15, MEDIUM = 21x21, HARD = 25x25)
  │ (Dynamic CSS transitions update emoji & visual theme)
  ▼ [Click "Play Game"]
Game Initialization (`App.startSelectedDifficultyGame()`)
  │
  ├─► Procedural Maze Generation (`MazeGenerator.generateForDifficulty()`)
  │     └─► Recursive Backtracking + Dead-End Braiding (10% - 40% loops)
  │
  ├─► Gameplay Loop (`#game-shell`)
  │     ├─► Player Movement (`InputHandler.js` → WASD / Arrow Keys)
  │     ├─► Boundary & Wall Collision (`GameState.movePlayer()`)
  │     ├─► Real-time Timer & Moves HUD Refresh
  │     └─► Goal Reached (`'G'`) → Victory Overlay → Next Level
  │
  ├─► AI Search Solvers (`ai/` directory)
  │     ├─► User selects solver (BFS, DFS, Best-First, A*)
  │     ├─► Synchronous Execution (`Solver.solve(grid, start, goal)`)
  │     └─► Asynchronous Step Visualizer (`AIVisualizer.js`)
  │
  └─► Four-Algorithm AI Comparison (`AIComparator.js`)
        ├─► Executes BFS, DFS, Best-First, and A* on identical maze
        ├─► Validates path optimality & BFS vs A* length equality
        └─► Renders comparison table & proportional CSS bar charts
```

---

## 4. Main Folder/File Map

| Area | Actual Path | Responsibility |
| :--- | :--- | :--- |
| **Entry Point** | `index.html` | Application HTML shell, markup layouts, HUD bar, modals. |
| **Styles** | `frontend/css/main.css` | Glassmorphism design tokens, theme states, layout math. |
| **App Controller** | `frontend/js/app.js` | View router, UI listener bindings, state orchestration. |
| **Config** | `frontend/js/config.js` | Global app constants, versioning, title strings. |
| **Game State** | `frontend/js/engine/game_state.js` | Level tracker, move counter, timer, `selectedDifficulty` state. |
| **Canvas Renderer**| `frontend/js/engine/renderer.js` | HTML5 Canvas grid, avatar, path highlights, AI overlays. |
| **Input Handler** | `frontend/js/engine/input_handler.js` | Keyboard event listener (WASD and Arrow keys). |
| **Maze Generator** | `maze/maze_generator.js` | Recursive Backtracking PRNG generator & dead-end braiding. |
| **Feature Re-export**| `maze/feature_extractor.js` | Reusable spatial feature extractor wrapper. |
| **AI Solvers** | `ai/bfs/bfs.js`, `ai/dfs/dfs.js`, `ai/best_first/best_first.js`, `ai/astar/astar.js` | Deterministic state-space search solver implementations. |
| **AI Common** | `ai/common/search_result.js`, `ai/common/priority_queue.js` | Standard `SearchResult` schema & Min-Heap Priority Queue. |
| **AI Visualizer** | `ai/visualization/visualizer.js` | Asynchronous exploration animation & cancellation guard. |
| **AI Comparator** | `ai/comparison/comparator.js` | Multi-solver synchronous benchmark & validation suite. |
| **ML Features** | `ml/features/mazeFeatureExtractor.js` | Spatial feature ($X$) & target metric ($M_{\text{target}}$) calculator. |
| **ML Generator** | `ml/dataset/datasetGenerator.js` | Synthesizes 2,000 mazes with train-only quantile cuts. |
| **ML Validator** | `ml/dataset/datasetValidator.js` | Dataset schema, range, and summary statistics validator. |
| **ML Datasets** | `data/ml/dataset.csv`, `data/ml/dataset.json` | Authoritative 2,000 synthetic maze dataset files. |
| **ML Training** | `ml/training/preprocessing.py`, `train_models.py`, `evaluate_models.py`, `pipeline_runner.py` | Python ML pipeline (Stratified 5-Fold CV, fitting, evaluation). |
| **ML Models** | `ml/models/*.joblib` | Serialized Decision Tree, KNN, and Logistic Regression models. |
| **ML Evaluation** | `ml/evaluation/results.json`, `ml/evaluation/confusion_matrices/` | Metrics JSON & exported 3x3 confusion matrix PNG plots. |
| **Documentation** | `documentation/*.md` | Complete architectural, technical, and viva documentation. |
| **Viva Notes** | `documentation/VIVA_NOTES.md` | Academic Q&A covering 34 core exam questions. |

---

## 5. Frontend/Game Reading Sequence

Follow this exact sequence to understand how the browser game functions:

1. `index.html`
   → **Explains**: DOM layout structure, view containers (`#landing-shell`, `#difficulty-shell`, `#game-shell`), and modal markup.
   → **Why read here**: Gives a complete overview of the user interface components.
2. `frontend/js/config.js`
   → **Explains**: Basic system constants.
   → **Why read here**: Sets baseline application parameters.
3. `frontend/js/engine/game_state.js`
   → **Explains**: How maze grid state, player position, moves count, timer, and `selectedDifficulty` are tracked.
   → **Why read here**: Core data model behind all gameplay.
4. `frontend/js/engine/renderer.js`
   → **Explains**: HTML5 Canvas rendering loop, cell coordinate mapping, avatar drawing, and AI search overlay layers.
   → **Why read here**: Connects data matrix to visual graphics.
5. `maze/maze_generator.js`
   → **Explains**: Recursive Backtracking generator, PRNG seed initialization, and controlled dead-end braiding.
   → **Why read here**: Shows how gameplay mazes are procedurally generated.
6. `frontend/js/engine/input_handler.js`
   → **Explains**: Keydown listener binding and directional delta mapping.
   → **Why read here**: Controls player movement.
7. `frontend/js/app.js`
   → **Explains**: Main controller orchestrating view transitions, slider event listeners, game initialization, and solver calls.
   → **Why read here**: Connects UI, Game Engine, Maze Generator, and AI module together.

---

## 6. AI Reading Sequence

Follow this sequence to understand state-space AI search algorithms and tools:

```text
AI Fundamentals & State Space Formulation
  └─► Read: documentation/AI_SEARCH_ARCHITECTURE.md

Standardized Search Schema & Data Structures
  ├─► Read: ai/common/search_result.js
  └─► Read: ai/common/priority_queue.js

Individual Solver Implementations & Theory
  ├─► BFS:        Read ai/bfs/EXPLANATION.md        → Inspect ai/bfs/bfs.js
  ├─► DFS:        Read ai/dfs/EXPLANATION.md        → Inspect ai/dfs/dfs.js
  ├─► Best-First: Read ai/best_first/EXPLANATION.md → Inspect ai/best_first/best_first.js
  └─► A*:         Read ai/astar/EXPLANATION.md      → Inspect ai/astar/astar.js

AI Exploration Visualization Engine
  ├─► Read: documentation/AI_VISUALIZATION.md
  └─► Inspect: ai/visualization/visualizer.js

Four-Algorithm Empirical Comparison & Validation
  ├─► Read: documentation/AI_COMPARISON.md
  ├─► Inspect: ai/comparison/comparator.js
  └─► Test: ai/comparison/comparator_test.js
```

---

## 7. ML Reading Sequence

Follow this sequence to understand the Machine Learning pipeline:

```text
ML Problem Definition & Target Leakage Prevention
  └─► Read: documentation/ML_PROBLEM_DEFINITION.md

Spatial Feature Engineering & Benchmark Target Metrics
  ├─► Read: documentation/ML_FEATURE_EXTRACTION.md
  └─► Inspect: ml/features/mazeFeatureExtractor.js

Synthetic Dataset Generation & Train-Only Percentile Thresholds
  ├─► Inspect: ml/dataset/datasetGenerator.js
  ├─► Inspect: ml/dataset/datasetValidator.js
  └─► Inspect: data/ml/dataset.csv + data/ml/dataset.json

Offline Python ML Pipeline & Model Training
  ├─► Read: documentation/ML_MODEL_TRAINING.md
  ├─► Inspect: ml/training/preprocessing.py
  ├─► Inspect: ml/training/train_models.py
  ├─► Inspect: ml/training/evaluate_models.py
  └─► Run: ml/training/pipeline_runner.py

Evaluation Artifacts & Serialized Models
  ├─► Inspect: ml/evaluation/results.json
  ├─► View: ml/evaluation/confusion_matrices/*.png
  └─► Models: ml/models/*.joblib

Future In-Browser ML Inference Architecture
  └─► Read: documentation/ML_INFERENCE_ARCHITECTURE.md
```

---

## 8. AI + ML + Game Connection

This end-to-end diagram illustrates how Game, AI, and ML subsystems interface:

```text
================================================================================
                                GAMEPLAY FLOW
================================================================================
User selects Difficulty (EASY / MEDIUM / HARD)
  │
  ▼
MazeGenerator.generateForDifficulty(selectedDifficulty)
  │ (Applies grid dimensions & braidRatio)
  ▼
Generated Maze Matrix Grid (0=path, 1=wall, S=Start, G=Goal)
  │
  ├─────────────────────────────────────────┐
  ▼                                         ▼
GAMEPLAY ENGINE                       AI SEARCH ENGINE
- Player moves via WASD               - BFS, DFS, Best-First, A* solve maze
- Collision detection                 - AIVisualizer animates search
- HUD timer & move count              - AIComparator benchmarks solvers

================================================================================
                                MACHINE LEARNING FLOW
================================================================================
Generated Maze Matrix Grid
  │
  ▼
Spatial Feature Extractor (`ml/features/mazeFeatureExtractor.js`)
  │ (Extracts 5 spatial features X in O(N) time)
  ▼
X = [wall_density, dead_end_ratio, branching_ratio, straight_corridor_ratio, turn_corridor_ratio]
  │
  ▼
Trained ML Classifier (`ml/models/` / Phase 8D Inference Engine)
  │ (Independently predicts difficulty class without reading selectedDifficulty)
  ▼
Predicted Difficulty (Class 0: Easy, Class 1: Medium, Class 2: Hard)
```

### Critical Distinction:
- **User-Selected Difficulty**: A procedural **gameplay parameter** controlling maze dimensions and dead-end braiding ratios before maze generation.
- **ML Predicted Difficulty**: An **independent inference evaluation** of spatial features $X$ extracted from the generated maze, running without hardcoded rules.

---

## 9. Training vs Inference

| Purpose | Actual Path | Environment | Primary Language |
| :--- | :--- | :--- | :--- |
| **Dataset Generation** | `ml/dataset/datasetGenerator.js` | Node.js / Browser | JavaScript (ES6 Modules) |
| **Feature Extraction** | `ml/features/mazeFeatureExtractor.js` | Browser / Node.js | JavaScript (ES6 Modules) |
| **Model Preprocessing** | `ml/training/preprocessing.py` | Local Python CLI | Python 3.10+ (`scikit-learn`) |
| **Model Training & CV** | `ml/training/train_models.py` | Local Python CLI | Python 3.10+ (`scikit-learn`) |
| **Test Set Evaluation** | `ml/training/evaluate_models.py` | Local Python CLI | Python 3.10+ (`matplotlib`) |
| **Full Pipeline Runner**| `ml/training/pipeline_runner.py` | Local Python CLI | Python 3.10+ |
| **Model Artifacts** | `ml/models/*.joblib` | Disk Storage | Serialized Python Binaries |
| **Phase 8D Inference** | `frontend/js/app.js` (Phase 8D) | Client Browser | Pure JavaScript ($< 1\text{ms}$) |

---

## 10. Important Documentation Files

| Topic | Documentation File Path | Focus Area |
| :--- | :--- | :--- |
| **System Blueprint** | `documentation/SYSTEM_ARCHITECTURE.md` | Architecture, data flow, module boundaries. |
| **Difficulty & Braiding**| `documentation/DIFFICULTY_SYSTEM.md` | Difficulty states, theme tokens, dead-end braiding algorithm. |
| **AI Search Formulation**| `documentation/AI_SEARCH_ARCHITECTURE.md` | Formal state-space design, heuristic definitions, solver comparison. |
| **AI Visualization** | `documentation/AI_VISUALIZATION.md` | Asynchronous playback controller, frame loops, cancellation safety. |
| **AI Comparison** | `documentation/AI_COMPARISON.md` | Synchronous multi-solver benchmarking & path validation checks. |
| **ML Problem Formulation**| `documentation/ML_PROBLEM_DEFINITION.md` | Spatial feature spec, leakage elimination, Quantile thresholding. |
| **ML Feature Extraction** | `documentation/ML_FEATURE_EXTRACTION.md` | Feature formulas, benchmark metrics, dataset validation suite. |
| **ML Model Training** | `documentation/ML_MODEL_TRAINING.md` | 5-Fold Stratified CV, test evaluation, confusion matrices, error analysis. |
| **ML Inference Engine** | `documentation/ML_INFERENCE_ARCHITECTURE.md` | Phase 8D in-browser JS inference architecture blueprint. |
| **Level System** | `documentation/LEVEL_SYSTEM.md` | Session level progression and reset contracts. |
| **Viva Examination Q&A**| `documentation/VIVA_NOTES.md` | 34 comprehensive academic viva questions and answers. |
| **Changelog History** | `documentation/CHANGELOG.md` | Phase-by-phase version changelog. |

---

## 11. 30-Minute Reading Path

For a fast, practical understanding of MazeQuest in under 30 minutes:

1. **Read**: `README.md` (High-level features, tech stack, difficulty table, and ML results)
2. **Read**: `documentation/SYSTEM_ARCHITECTURE.md` (System modules and runtime data flow)
3. **Read**: `documentation/DIFFICULTY_SYSTEM.md` (UX slider, visual themes, and braiding algorithm)
4. **Inspect**: `frontend/js/app.js` (How views, controls, solvers, and renderer connect)
5. **Inspect**: `maze/maze_generator.js` (How mazes are procedurally generated)

---

## 12. Deep Understanding Reading Path

For complete mastery of the entire codebase and research methodology:

1. **Game Engine**: `index.html` → `frontend/css/main.css` → `frontend/js/engine/game_state.js` → `frontend/js/engine/renderer.js` → `maze/maze_generator.js` → `frontend/js/app.js`
2. **AI Search Subsystem**: `documentation/AI_SEARCH_ARCHITECTURE.md` → `ai/common/search_result.js` → `ai/bfs/bfs.js` → `ai/dfs/dfs.js` → `ai/best_first/best_first.js` → `ai/astar/astar.js` → `documentation/AI_VISUALIZATION.md` → `ai/visualization/visualizer.js` → `documentation/AI_COMPARISON.md` → `ai/comparison/comparator.js`
3. **ML Subsystem**: `documentation/ML_PROBLEM_DEFINITION.md` → `documentation/ML_FEATURE_EXTRACTION.md` → `ml/features/mazeFeatureExtractor.js` → `ml/dataset/datasetGenerator.js` → `documentation/ML_MODEL_TRAINING.md` → `ml/training/preprocessing.py` → `ml/training/train_models.py` → `ml/training/evaluate_models.py` → `documentation/ML_INFERENCE_ARCHITECTURE.md`
4. **Academic Viva & Defense**: `documentation/VIVA_NOTES.md`

---

## 13. Quick "Where Do I Look?" Index

| Question / Feature | File Path |
| :--- | :--- |
| **How does procedural maze generation work?** | `maze/maze_generator.js` (`MazeGenerator.generate`) |
| **How does dead-end braiding create loops?** | `maze/maze_generator.js` (`MazeGenerator.applyDeadEndBraiding`) |
| **Where is player movement handled?** | `frontend/js/engine/input_handler.js` |
| **Where are collisions checked?** | `frontend/js/engine/game_state.js` (`GameState.movePlayer`) |
| **How does BFS guarantee shortest path?** | `ai/bfs/bfs.js` & `ai/bfs/EXPLANATION.md` |
| **How does A* calculate heuristic values?** | `ai/astar/astar.js` & `ai/astar/EXPLANATION.md` |
| **Where is the priority queue implemented?** | `ai/common/priority_queue.js` |
| **How are AI search animations rendered?** | `ai/visualization/visualizer.js` |
| **Where is 4-algorithm comparison executed?** | `ai/comparison/comparator.js` |
| **How are spatial ML features extracted?** | `ml/features/mazeFeatureExtractor.js` |
| **Where is the 2,000-maze dataset stored?** | `data/ml/dataset.csv` & `data/ml/dataset.json` |
| **Where are ML models trained in Python?** | `ml/training/train_models.py` |
| **Where are confusion matrices saved?** | `ml/evaluation/confusion_matrices/` |
| **Where are serialized model binaries?** | `ml/models/*.joblib` |
| **Where do I study for viva exam questions?** | `documentation/VIVA_NOTES.md` |

---

## 14. Final Mental Model

```text
                                   MAZEQUEST
                                       │
  ┌───────────────────┬────────────────┴───────────────────┬───────────────────┐
  ▼                   ▼                                    ▼                   ▼
GAME ENGINE      MAZE GENERATOR                         AI MODULE           ML MODULE
(Canvas, Input,  (Recursive Backtracking,               (BFS, DFS,          (Features X,
 State, UX,      Seeded PRNG,                           Best-First, A*,     Dataset, CV,
 Difficulty)     Dead-End Braiding)                     Visualizer, Comp)   LogReg, DT, KNN)
```

- **GAME ENGINE**: Manages browser user interface, canvas rendering, WASD keyboard movement, and level state persistence.
- **MAZE GENERATOR**: Generates 100% connected 2D grid mazes with difficulty-controlled dead-end braiding.
- **DIFFICULTY SYSTEM**: Allows pre-gameplay selection of Easy, Medium, or Hard grid dimensions and braiding ratios with smooth CSS theme transitions.
- **AI MODULE**: Provides pure deterministic search algorithms, asynchronous step-by-step exploration visualization, and empirical 4-solver comparison benchmarks.
- **ML MODULE**: Extracts 5 spatial topological features ($X$), generates synthetic dataset, trains classification models in Python, exports evaluation artifacts, and prepares for in-browser inference.
- **INFERENCE**: Evaluates extracted spatial features $X$ in $<1\text{ms}$ during runtime to predict difficulty independently.
