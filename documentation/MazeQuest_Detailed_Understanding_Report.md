# MAZEQUEST — DETAILED TECHNICAL UNDERSTANDING REPORT

---

## 1. Project Overview

**MazeQuest** is an academic web-based software project designed to bridge classical artificial intelligence graph search with modern statistical machine learning difficulty classification. Built using native web standards (HTML5, Vanilla CSS3, Vanilla ES6 JavaScript) and Python data science packages (`scikit-learn`, `pandas`), MazeQuest delivers an interactive maze adventure game while functioning as an empirical benchmarking lab.

The project encompasses three core components:
1. **Interactive Game Engine**: A 60 FPS HTML5 Canvas maze client with keyboard controls (WASD / Arrows), pre-gameplay 3-stepped difficulty selection (EASY, MEDIUM, HARD), dynamic glassmorphism visual themes, and persistent session level progression.
2. **Deterministic AI Search Module**: Implementation of four classic graph search algorithms—Breadth-First Search (BFS), Depth-First Search (DFS), Greedy Best-First Search, and A* Search—accompanied by an asynchronous step-by-step visualizer and a synchronous 4-algorithm comparator engine.
3. **Machine Learning Difficulty Classifier**: An offline machine learning subsystem that extracts 5 spatial topological features ($X$) from synthetic mazes and trains Decision Tree, K-Nearest Neighbors ($K=7$), and Logistic Regression classifiers on an algorithmic search difficulty index ($CI_{\text{search}}$).

---

## 2. Problem Statement

Procedural maze games commonly face two technical challenges:
1. **Corridor Predictability**: Standard Recursive Backtracking algorithms produce "perfect mazes" (spanning trees with zero cycles), resulting in a single simple path between any two points. Players can often visually trace the path from Start to Goal without real spatial exploration.
2. **Arbitrary Difficulty Calibration**: Difficulty is usually assigned solely by grid dimensions ($15\times15$ vs $25\times25$), ignoring topological structures like dead ends, junctions, corridor turns, and search space complexity.

MazeQuest resolves these issues by implementing **controlled dead-end braiding** (carving interior walls to create distractor loops), defining an objective algorithmic search complexity index ($CI_{\text{search}}$), and building a leak-free Machine Learning classification pipeline to evaluate topological difficulty.

---

## 3. Objectives

### A. Game Engine Objectives
- Build a zero-dependency HTML5 Canvas maze application with 60 FPS rendering.
- Implement directional keyboard controls (WASD and Arrow keys) with wall collision enforcement.
- Develop a 3-stepped pre-gameplay difficulty selector with 250ms smooth CSS glassmorphism theme transitions.
- Maintain persistent difficulty across linear level progression (`Level 1 -> Level 2 -> Level 3`).

### B. AI Search Objectives
- Formulate grid mazes as formal state-space graph search problems.
- Implement 4 deterministic solvers (BFS, DFS, Greedy Best-First, A*) outputting a uniform `SearchResult` schema.
- Develop an asynchronous step-by-step exploration visualizer with speed presets and cancellation guards.
- Build a synchronous 4-algorithm comparison engine with path continuity and optimality validation.

### C. Machine Learning Objectives
- Generate a 2,000 synthetic maze dataset across three grid sizes ($15\times15, 21\times21, 25\times25$).
- Extract 5 spatial input features ($X$) while isolating search target metrics ($M_{\text{target}}$) to prevent target leakage.
- Calculate train-only quantile thresholding ($P_{33.3}^{\text{train}}, P_{66.7}^{\text{train}}$) to label ternary difficulty targets ($y \in \{0, 1, 2\}$).
- Train, cross-validate (5-Fold Stratified CV), and evaluate Decision Tree, KNN, and Logistic Regression models in Python.

---

## 4. Complete Technology Stack

| Technology | Layer | Purpose & Justification |
| :--- | :--- | :--- |
| **HTML5** | Frontend Shell | Provides semantic document structure, canvas element (`#maze-canvas`), HUD bar, and modal markups in `index.html`. Chosen for zero-dependency browser compatibility. |
| **CSS3 (Vanilla)** | Styling & Themes | Implements custom properties (CSS variables), glassmorphism styling, and 250ms theme transitions (`.theme-easy`, `.theme-medium`, `.theme-hard`). Avoids external CSS framework overhead. |
| **JavaScript (ES6 Modules)**| Client Logic | Implements game state, canvas renderer, keyboard input handler, procedural maze generator, AI solvers, visualizer, and comparator. |
| **Python 3.13** | ML Subsystem | Runs offline dataset validation, feature isolation, preprocessing, model training, cross-validation, and evaluation (`ml/training/`). |
| **scikit-learn** | ML Pipelines | Provides `StandardScaler`, `DecisionTreeClassifier`, `KNeighborsClassifier`, `LogisticRegression`, `StratifiedKFold`, and evaluation metrics. |
| **pandas & numpy** | Data Processing | Handles dataset array manipulation, summary statistics, missing-value validation, and quantile threshold calculations. |
| **matplotlib** | Plot Rendering | Generates and exports 3x3 confusion matrix PNG plots to `ml/evaluation/confusion_matrices/`. |
| **joblib** | Model Persistence | Serializes trained scikit-learn models and scaling pipelines to binary files (`ml/models/*.joblib`). |
| **Git / GitHub** | Version Control | Revision tracking, feature branching, and remote source code hosting. |
| **GitHub Pages** | Static Deployment | Hosting platform serving the static web client (`index.html`) directly without requiring a backend server. |

---

## 5. Overall System Architecture

The application is structured into four main operational blocks:

```text
                               ┌─────────────────────────────────────────┐
                               │                USER                     │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │   index.html    │
                                           └────────┬────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │     app.js      │
                                           └────────┬────────┘
                                                    │
         ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
         ▼                                          ▼                                          ▼
   ┌───────────┐                              ┌───────────┐                              ┌───────────┐
   │ GAME CORE │                              │ AI MODULE │                              │ ML MODULE │
   └─────┬─────┘                              └─────┬─────┘                              └─────┬─────┘
         │                                          │                                          │
         ├─ GameState (`game_state.js`)             ├─ Solvers (BFS, DFS, Best, A*)            ├─ Feature Extractor
         ├─ Canvas Renderer (`renderer.js`)          ├─ Visualizer (`visualizer.js`)            ├─ Dataset Generator
         ├─ Input Handler (`input_handler.js`)      └─ Comparator (`comparator.js`)            ├─ Python ML Pipeline
         └─ Generator (`maze_generator.js`)                                                    └─ Model Binaries (.joblib)
```

### Component Breakdown:
1. **Frontend View Router (`app.js`)**: Coordinates view transitions between Landing (`#landing-shell`), Difficulty Selection (`#difficulty-shell`), and Gameplay (`#game-shell`).
2. **Procedural Generator (`maze_generator.js`)**: Executes Recursive Backtracking and dead-end braiding to construct maze matrices.
3. **State Machine (`game_state.js`)**: Holds grid matrix, player position, move counts, elapsed timer, and `selectedDifficulty`.
4. **HTML5 Renderer (`renderer.js`)**: Draws walls, open paths, Start `'S'`, Goal `'G'`, player avatar, and translucent AI exploration trails on the canvas.
5. **AI Solvers (`ai/`)**: Solves maze matrices synchronously using state-space graph algorithms and outputs standardized `SearchResult` objects.
6. **ML Pipeline (`ml/`)**: Extracts 5 spatial features, builds synthetic datasets, trains Python models, and exports evaluation reports.

---

## 6. Project Structure

```text
MazeQuest/
├── index.html                           # App HTML shell & modal markups
├── README.md                            # Primary documentation
├── ai/                                  # AI Search Engine Subsystem
│   ├── astar/                           # A* Search algorithm & tests
│   ├── best_first/                      # Greedy Best-First algorithm & tests
│   ├── bfs/                             # Breadth-First Search algorithm & tests
│   ├── common/                          # PriorityQueue & SearchResult schema
│   ├── comparison/                      # Synchronous 4-algorithm comparator
│   ├── dfs/                             # Depth-First Search algorithm & tests
│   └── visualization/                   # Asynchronous visualizer controller
├── data/                                # Authoritative Datasets
│   └── ml/                              # dataset.csv & dataset.json (2,000 mazes)
├── documentation/                       # Technical & Viva Documentation (13 markdown files)
├── frontend/                            # Web Application Frontend
│   ├── css/main.css                     # Glassmorphism styling & themes
│   └── js/                              # app.js, main.js, config.js, engine/
├── maze/                                # Procedural Maze Generation Engine
│   ├── maze_generator.js                # Recursive Backtracking & dead-end braiding
│   └── feature_extractor.js             # Topological feature extractor wrapper
└── ml/                                  # Machine Learning Subsystem
    ├── dataset/                         # JS dataset generator & validator
    ├── evaluation/                      # results.json & confusion_matrices/
    ├── features/                        # mazeFeatureExtractor.js & test suite
    ├── models/                          # Serialized .joblib trained pipelines
    └── training/                        # Python ML preprocessing, CV, & fitting scripts
```

---

# PART A — GAME SYSTEM

## 7. Application Entry Point

The application starts when `index.html` is loaded in a web browser:
1. `index.html` parses document structure and loads `frontend/css/main.css`.
2. The browser executes `<script type="module" src="./frontend/js/main.js">`.
3. `main.js` imports `App` from `./app.js` and invokes `app.init()` upon DOM readiness (`DOMContentLoaded`).
4. `app.init()` binds DOM elements, generates an initial default maze via `MazeGenerator.generateForDifficulty('MEDIUM')`, instantiates `GameState`, `CanvasRenderer`, `InputHandler`, `AIVisualizer`, and displays `#landing-shell`.

---

## 8. Game State

`GameState` (`frontend/js/engine/game_state.js`) is the single source of truth for runtime gameplay data:
- `currentLevel` (integer): Tracks active session level (starts at 1).
- `selectedDifficulty` (string): Stores chosen challenge mode (`"EASY" | "MEDIUM" | "HARD"`).
- `mazeGrid` (2D Array): The active numerical grid matrix representation.
- `height` & `width` (integers): Grid row and column dimensions.
- `startPos` & `goalPos` (Objects `{r, c}`): Coordinates of Start and Goal markers.
- `playerPos` (Object `{r, c}`): Current player avatar coordinates.
- `movesCount` (integer): Total valid movement steps taken in current level.
- `elapsedSeconds` (integer): Timer count updated via `setInterval`.
- `gameStatus` (string): `'IDLE' | 'PLAYING' | 'SOLVED'`.

---

## 9. Maze Representation

Mazes are represented as 2D numerical arrays (matrices):
- `0`: Walkable open path cell.
- `1`: Wall cell.
- `'S'`: Start cell marker (always at `(1, 1)`).
- `'G'`: Goal cell marker (always at `(height-2, width-2)`).

### Coordinate System:
Coordinates are indexed as `(r, c)` where `r` is row index (0 to height-1) and `c` is column index (0 to width-1). Odd dimensions ($15\times15, 21\times21, 25\times25$) are enforced to maintain an alternating lattice of cells and wall borders.

---

## 10. Procedural Maze Generation

MazeQuest implements **Recursive Backtracking** combined with **Controlled Dead-End Braiding** in `MazeGenerator` (`maze/maze_generator.js`).

### Generation Steps:
1. **Grid Initialization**: Fill grid of size $H \times W$ entirely with walls (`1`).
2. **Backtracking Loop**: Mark Start `(1, 1)` as path (`0`), push to stack. While stack is non-empty:
   - Identify unvisited neighbor cells 2 units away in cardinal directions.
   - If neighbors exist, pick one pseudo-randomly using Mulberry32 PRNG `random()`, carve the wall between current cell and neighbor, mark neighbor as path (`0`), and push neighbor to stack.
   - If no unvisited neighbors exist, pop from stack (backtrack).
3. **Connectivity Guarantee**: Recursive Backtracking constructs a spanning tree over the grid graph, guaranteeing 100% path connectivity between Start and Goal.
4. **Dead-End Braiding**: To eliminate single-corridor predictability, `applyDeadEndBraiding()` identifies dead ends (path cells with 1 open neighbor) and carves interior walls separating them from adjacent paths for a fraction defined by `braidRatio`.
5. **Marker Assignment**: Re-assign `'S'` at `(1, 1)` and `'G'` at `(height-2, width-2)`.

---

## 11. Difficulty System

### Modes & Parameters:
- **EASY**: $15 \times 15$ grid, `braidRatio = 0.10` (10% loops), Green visual theme (`#10b981`), 😊 emoji.
- **MEDIUM**: $21 \times 21$ grid, `braidRatio = 0.25` (25% loops), Amber visual theme (`#f59e0b`), 🤔 emoji.
- **HARD**: $25 \times 25$ grid, `braidRatio = 0.40` (40% loops), Red visual theme (`#ef4444`), 😤 emoji.

### User Selection vs Level Progression:
- The user drags slider `#difficulty-slider` (values `0, 1, 2`). CSS custom properties update visual previews with 250ms smooth transitions.
- `selectedDifficulty` is stored in `GameState` and persists across level advancement (`Hard — Level 1 -> Hard — Level 2 -> Hard — Level 3`).
- Level progression increments `currentLevel` while generating fresh mazes under the **same** selected difficulty.

### CRITICAL DISTINCTION:
- **USER-SELECTED DIFFICULTY**: A procedural **gameplay generation parameter** controlling grid dimensions and braiding ratio before maze generation.
- **ML-PREDICTED DIFFICULTY**: An **independent machine learning inference evaluation** of spatial features $X$ extracted from a generated maze.

---

## 12. Gameplay

1. **Input Handling**: `InputHandler` listens for `keydown` events (`WASD` / `Arrow Keys`), converting them to directional deltas $(\Delta r, \Delta c)$.
2. **Collision & Movement**: `GameState.movePlayer(dr, dc)` verifies target cell `(r+dr, c+dc)` is inside boundaries and not a wall (`1`). If valid, `playerPos` updates, `movesCount` increments, and `renderer.render()` redraws the screen.
3. **Goal Detection & Victory**: When `playerPos` equals `goalPos`, `gameStatus` changes to `'SOLVED'`, session timer stops, input disables, and `#victory-overlay` displays final moves and time statistics.

---

# PART B — ARTIFICIAL INTELLIGENCE

## 13. AI Problem Formulation

MazeQuest formulates maze solving as a formal **State-Space Search Problem**:
- **State $s \in S$**: Current grid coordinate $(r, c)$ where $\text{grid}[r][c] \neq 1$.
- **Initial State $s_0$**: $(1, 1)$.
- **Goal State $g$**: $(height - 2, width - 2)$.
- **Actions $A(s)$**: Cardinal transitions $\{\text{North: } (-1,0), \text{South: } (+1,0), \text{West: } (0,-1), \text{East: } (0,+1)\}$.
- **Transition Model $T(s, a)$**: Returns neighbor state $s'$ if $\text{grid}[s'] \neq 1$.
- **Path Cost $c(s, a, s')$**: Uniform cost of $1.0$ per step.

---

## 14. BFS (Breadth-First Search)

- **Concept**: Uninformed search expanding nodes level-by-level using a FIFO queue.
- **Algorithm**: Enqueue $s_0$. While queue non-empty, dequeue node $u$. If $u = g$, reconstruct path. Otherwise, mark $u$ visited, expand valid unvisited neighbors, and enqueue them.
- **Optimality**: Guarantees the optimal (shortest) path length in unweighted grid graphs.
- **Complexities**: Time $O(V + E)$, Space $O(V)$.
- **Role in MazeQuest**: Serves as the ground-truth baseline for shortest path length and node expansion complexity.

---

## 15. DFS (Depth-First Search)

- **Concept**: Uninformed search exploring deeply along each branch using a LIFO stack before backtracking.
- **Algorithm**: Push $s_0$ to stack. While stack non-empty, pop node $u$. If $u = g$, reconstruct path. Otherwise, mark $u$ visited, push unvisited neighbors.
- **Optimality**: Non-optimal; path length depends on neighbor exploration order.
- **Complexities**: Time $O(V + E)$, Space $O(V)$ in finite grid graphs.
- **Role in MazeQuest**: Demonstrates deep branch traversal and illustrates non-optimal path creation compared to BFS.

---

## 16. Greedy Best-First Search

- **Concept**: Informed search evaluating nodes using a heuristic function $f(n) = h(n)$.
- **Heuristic (Manhattan Distance)**:
  $$h(n) = |r_n - r_g| + |c_n - c_g|$$
  where $(r_n, c_n)$ is current cell and $(r_g, c_g)$ is Goal.
- **Optimality**: Non-optimal; can be misled by wall barriers into taking circuitous paths.
- **Role in MazeQuest**: Demonstrates aggressive goal-directed expansion with fast execution.

---

## 17. A* Search

- **Concept**: Informed search combining path cost $g(n)$ and heuristic distance $h(n)$.
- **Evaluation Function**:
  $$f(n) = g(n) + h(n)$$
  where $g(n)$ is exact path cost from $s_0$ to $n$, and $h(n)$ is Manhattan distance to Goal.
- **Data Structures**: Min-heap priority queue ordered by $f(n)$, `gScore` map, and `cameFrom` map.
- **Optimality**: Manhattan heuristic is admissible ($h(n) \le h^*(n)$) and consistent on 4-connected grid graphs, guaranteeing optimal path lengths ($100\%$ match with BFS path length).

---

## 18. Common AI Solver Interface

All four solvers return a standardized `SearchResult` object (`ai/common/search_result.js`):

```javascript
{
  algorithm: "A*",
  success: true,
  path: [{r:1, c:1}, {r:1, c:2}, ...],
  visitedNodes: [{r:1, c:1}, {r:1, c:2}, ...],
  nodesExplored: 42,
  pathLength: 28,
  executionTimeMs: 0.35
}
```

### Purpose of Common Interface:
1. Decouples solver algorithm logic from rendering UI.
2. Allows `AIVisualizer` to playback any algorithm seamlessly.
3. Enables `AIComparator` to benchmark all solvers synchronously on identical inputs.

---

## 19. AI Visualization

- **Execution Separation**: Solvers run synchronously in $<1\text{ms}$ to record pure search execution time. `AIVisualizer` then animates the resulting `visitedNodes` array asynchronously using `setTimeout` loops.
- **Overlay Layers**:
  - Explored nodes: Translucent cyan fill (`rgba(6, 182, 212, 0.3)`).
  - Final path: Glowing emerald green line (`#10b981`).
- **Safety Guards**: `aiVisualizer.cancel()` clears pending timeouts if the player resets, resizes, or moves manually.

---

## 20. AI Algorithm Comparison

`AIComparator` (`ai/comparison/comparator.js`) executes BFS, DFS, Best-First, and A* synchronously on the active maze:
- **Validation Suite**: Verifies path continuity, non-wall steps, endpoint alignment, and asserts $L_{\text{A*}} = L_{\text{BFS}}$.
- **Empirical Display**: Renders a factual comparison table and dual proportional CSS bar charts for **Nodes Explored** and **Execution Time** without subjective winner claims.

---

# PART C — MACHINE LEARNING

## 21. ML Problem Definition

The Machine Learning subsystem is formulated as a **supervised multiclass classification problem**:
- **Target $y$**: $y \in \{0, 1, 2\}$ representing Easy (0), Medium (1), and Hard (2).
- **Definition of Target**: $y$ represents **algorithmic search difficulty** ($CI_{\text{search}}$), derived from BFS search space expansion and path detour factor, rather than human player cognitive load.

---

## 22. ML Input Features

Five spatial topological features ($X$) are extracted from the grid matrix in $O(N)$ time (`ml/features/mazeFeatureExtractor.js`):

1. `wall_density`: Ratio of wall cells to total grid cells ($\frac{N_{\text{walls}}}{N_{\text{total}}}$).
2. `dead_end_ratio`: Ratio of dead-end path cells to total open cells ($\frac{N_{\text{dead\_ends}}}{N_{\text{open}}}$).
3. `branching_ratio`: Ratio of junction path cells ($\ge 3$ open neighbors) to total open cells ($\frac{N_{\text{junctions}}}{N_{\text{open}}}$).
4. `straight_corridor_ratio`: Ratio of straight corridor path cells to total open cells ($\frac{N_{\text{straight}}}{N_{\text{open}}}$).
5. `turn_corridor_ratio`: Ratio of L-turn corridor path cells to total open cells ($\frac{N_{\text{turns}}}{N_{\text{open}}}$).

---

## 23. Target-Generation Metrics

Six search benchmark metrics ($M_{\text{target}}$) are calculated during target generation to derive ground-truth labels $y$:
1. `shortestPathLength`: Length of optimal path returned by BFS ($L_{\text{opt}}$).
2. `manhattanDistance`: Manhattan distance from Start to Goal ($D_{\text{man}}$).
3. `pathDetourFactor`: Ratio of optimal path length to Manhattan distance ($\frac{L_{\text{opt}}}{D_{\text{man}}}$).
4. `bfsNodesExplored`: Total nodes visited during BFS search ($E_{\text{bfs}}$).
5. `searchExpansionRatio`: Ratio of BFS nodes explored to total open cells ($\frac{E_{\text{bfs}}}{N_{\text{open}}}$).
6. `complexityIndexSearch`: Composite search complexity score ($CI_{\text{search}}$).

**CRITICAL RULE**: Target-generation metrics are strictly isolated from ML input feature vector $X$ to prevent target leakage.

---

## 24. Target / Difficulty Labeling

### Formulas:
$$\text{pathDetourFactor} = \frac{\text{shortestPathLength}}{\text{manhattanDistance}}$$
$$\text{searchExpansionRatio} = \frac{\text{bfsNodesExplored}}{\text{openCellCount}}$$
$$CI_{\text{search}} = 0.50 \times \text{pathDetourFactor} + 0.50 \times \text{searchExpansionRatio}$$

### Train-Only Quantile Thresholding:
Percentile cuts were computed **exclusively on the 1,600 Training records**:
- $P_{33.3}^{\text{train}} = 1.2311$
- $P_{66.7}^{\text{train}} = 1.7412$

### Target Assignment:
$$y = \begin{cases} 0 \text{ (Easy)} & \text{if } CI_{\text{search}} \le 1.2311 \\ 1 \text{ (Medium)} & \text{if } 1.2311 < CI_{\text{search}} \le 1.7412 \\ 2 \text{ (Hard)} & \text{if } CI_{\text{search}} > 1.7412 \end{cases}$$

---

## 25. Dataset Generation

Synthesized $N = 2,000$ mazes using `ml/dataset/datasetGenerator.js`:
- $800$ mazes at $15 \times 15$
- $800$ mazes at $21 \times 21$
- $400$ mazes at $25 \times 25$

Exported to `data/ml/dataset.csv` and `data/ml/dataset.json` containing 24 schema fields (seed, dimensions, 5 features $X$, 6 benchmark metrics $M_{\text{target}}$, train_mask, and target $y$).

---

## 26. Feature Engineering

Feature extraction converts a raw 2D grid matrix into feature vector $X$:
1. Scan interior cells $(r, c)$ where $\text{grid}[r][c] \neq 1$.
2. Count open neighbors in cardinal directions.
3. Classify path cells: 1 neighbor = dead-end; 2 collinear neighbors = straight corridor; 2 orthogonal neighbors = L-turn; $\ge 3$ neighbors = junction.
4. Normalize counts by total open cell count ($N_{\text{open}}$).

Target leakage is prevented by ensuring vector $X$ contains zero search metrics.

---

## 27. Data Splitting and Cross-Validation

- **Train/Test Split**: 80% Training ($1,600$ records) and 20% Test ($400$ records).
- **Cross-Validation**: 5-Fold Stratified Cross-Validation (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`) on the training split.
- Test set remained strictly untouched during model selection and hyperparameter tuning.

---

## 28. Decision Tree

- **Configuration**: `DecisionTreeClassifier(max_depth=5, min_samples_split=5, random_state=42)`.
- **Feature Importance**: Evaluated via Gini impurity reduction.
- **Results**: Mean CV Accuracy = 38.75%, Test Accuracy = 36.50%.

---

## 29. KNN (K-Nearest Neighbors)

- **Pipeline**: `StandardScaler` $\to$ `KNeighborsClassifier(weights='distance')`.
- **Hyperparameter Tuning**: Investigated $K \in \{3, 5, 7, 9\}$ on CV folds; selected $K=7$.
- **Results**: Mean CV Accuracy = 40.50%, Test Accuracy = 36.75%.

---

## 30. Logistic Regression

- **Pipeline**: `StandardScaler` $\to$ `LogisticRegression(C=1.0, solver='lbfgs', max_iter=1000)`.
- **Methodology**: Multinomial logit fitting log-odds ratios per class.
- **Results**: Mean CV Accuracy = 44.44%, Test Accuracy = 45.00%.

---

## 31. Evaluation Metrics

- **Accuracy**: Ratio of correct predictions to total samples ($\frac{TP+TN}{Total}$).
- **Precision**: Macro-averaged ratio $\frac{TP}{TP+FP}$.
- **Recall**: Macro-averaged ratio $\frac{TP}{TP+FN}$.
- **F1-Score**: Harmonic mean of precision and recall ($\frac{2 \cdot P \cdot R}{P + R}$).
- **Confusion Matrix**: $3 \times 3$ matrix mapping actual classes (rows) versus predicted classes (columns).

---

## 32. Cross-Validation Results

| Model Classifier | Fold 1 | Fold 2 | Fold 3 | Fold 4 | Fold 5 | Mean CV Acc | Std Dev |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 44.69% | 38.13% | 47.81% | 43.44% | 48.13% | **44.44%** | $\pm 3.63\%$ |
| **K-Nearest Neighbors ($K=7$)** | 36.56% | 38.44% | 40.31% | 40.94% | 46.25% | **40.50%** | $\pm 3.26\%$ |
| **Decision Tree** | 40.00% | 35.31% | 36.56% | 41.25% | 40.63% | **38.75%** | $\pm 2.36\%$ |

---

## 33. Test Results

| Model Classifier | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Weighted F1 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **45.00%** | **0.4393** | **0.4450** | **0.4268** | **0.4304** |
| **K-Nearest Neighbors ($K=7$)** | **36.75%** | **0.3691** | **0.3679** | **0.3674** | **0.3677** |
| **Decision Tree** | **36.50%** | **0.3611** | **0.3656** | **0.3596** | **0.3594** |

---

## 34. Confusion Matrices

### 1. Logistic Regression Confusion Matrix (Test Set, N=400):
$$\begin{pmatrix} 57 & 27 & 53 \\ 38 & 28 & 61 \\ 17 & 24 & 95 \end{pmatrix}$$
- **Interpretation**: Correctly classified 57 Easy, 28 Medium, and 95 Hard mazes. Showed strong recall on Hard mazes (69.8%).

### 2. K-Nearest Neighbors ($K=7$) Confusion Matrix:
$$\begin{pmatrix} 52 & 45 & 40 \\ 42 & 49 & 36 \\ 37 & 53 & 46 \end{pmatrix}$$
- **Interpretation**: Balanced predictions across classes but showed class overlap between adjacent Medium and Hard instances.

### 3. Decision Tree Confusion Matrix:
$$\begin{pmatrix} 62 & 41 & 34 \\ 45 & 51 & 31 \\ 51 & 52 & 33 \end{pmatrix}$$
- **Interpretation**: Highest recall on Easy mazes (45.3%), but struggled to separate Hard mazes due to rigid axis-aligned decision boundaries.

---

## 35. Feature Importance and Coefficients

### Decision Tree Feature Importance:
- `straight_corridor_ratio`: $31.73\%$
- `turn_corridor_ratio`: $26.38\%$
- `dead_end_ratio`: $20.26\%$
- `branching_ratio`: $13.34\%$
- `wall_density`: $8.29\%$

### Logistic Regression Log-Odds Coefficients (Hard Class):
- `dead_end_ratio`: $-0.5892$ (Negative correlation with Hard difficulty)
- `wall_density`: $-0.3392$
- `straight_corridor_ratio`: $-0.3114$
- `turn_corridor_ratio`: $-0.3073$
- `branching_ratio`: $+0.1774$ (Positive correlation with Hard difficulty)

*Note: KNN is a non-parametric instance-based model and does not calculate static feature importance weights.*

---

## 36. Error Analysis

- **Total Test Errors**: Decision Tree made 254 errors (63.5% error rate); Logistic Regression made 220 errors (55.0% error rate).
- **Primary Error Source**: Class overlap between Medium and Hard mazes. Mazes with dense branching often had short detour factors, causing $CI_{\text{search}}$ to place them near threshold boundaries ($P_{33.3} = 1.2311, P_{66.7} = 1.7412$).

---

# PART D — ML INTEGRATION

## 37. ML Inference

Inference executes in client JavaScript during runtime:
```text
Generated Maze Grid
  ↓
Extract 5 Spatial Features X (`ml/features/mazeFeatureExtractor.js`)
  ↓
Inference Engine (Evaluates trained model weights in <1 ms)
  ↓
Display Predicted Difficulty Badge on HUD
```

**Allowed Features**: `wall_density`, `dead_end_ratio`, `branching_ratio`, `straight_corridor_ratio`, `turn_corridor_ratio`. Search benchmark metrics ($M_{\text{target}}$) are strictly prohibited during inference.

---

## 38. Training vs Inference

| Stage | Path / Location | Purpose | Environment |
| :--- | :--- | :--- | :--- |
| **Dataset Generation** | `ml/dataset/datasetGenerator.js` | Synthesize 2,000 mazes & label targets | Node.js |
| **Model Training** | `ml/training/train_models.py` | 5-Fold CV & fitting | Python CLI |
| **Model Evaluation** | `ml/training/evaluate_models.py` | Test set evaluation & confusion matrices | Python CLI |
| **Model Artifacts** | `ml/models/*.joblib` | Serialized model storage | Disk Binaries |
| **Browser Inference** | `frontend/js/app.js` | Real-time difficulty prediction | Web Browser |

---

## 39. User Difficulty vs ML Prediction

```text
USER SELECTS DIFFICULTY (EASY / MEDIUM / HARD)
  ↓
Controls Maze Generator Parameters (Grid Size & Braid Ratio)
  ↓
GENERATED MAZE GRID
  ↓
Extract Spatial Features X
  ↓
ML MODEL PREDICTS DIFFICULTY INDEPENDENTLY
```

The user-selected difficulty is a **generation parameter**, whereas the ML prediction is an **independent model evaluation** of spatial features $X$.

---

# PART E — COMPLETE WORKFLOW

## 40. End-to-End Runtime Workflow

1. User opens `http://localhost:8000` $\to$ `index.html` loads.
2. User clicks **Start Game** $\to$ `#landing-shell` hides, `#difficulty-shell` shows.
3. User moves slider to HARD $\to$ theme updates to Red, 😤 emoji displays.
4. User clicks **Play Game** $\to$ `MazeGenerator.generateForDifficulty('HARD')` creates $25\times25$ maze with 40% dead-end braiding.
5. `#game-shell` renders canvas, HUD tracks timer & moves.
6. Player moves avatar via WASD / Arrow keys to Goal `'G'`.
7. User runs AI Solvers or Compare modal to view search benchmarks.

---

## 41. End-to-End AI Workflow

```text
Maze Grid Matrix
  ↓
Solver Execution (`BFSSolver.solve()`)
  ↓
SearchResult Schema (`visitedNodes`, `path`, `nodesExplored`, `executionTimeMs`)
  ↓
AIVisualizer (Asynchronous translucent cyan exploration & emerald path animation)
  ↓
AIComparator (Synchronous 4-solver comparison table & bar charts)
```

---

## 42. End-to-End ML Workflow

```text
Maze Generation → Spatial Feature Extraction (X) → Benchmark Metrics (M)
  ↓
Train-Only Quantile Cuts (P33.3=1.2311, P66.7=1.7412) → Target Labels (y)
  ↓
80/20 Train/Test Split → 5-Fold Stratified CV → Model Fitting (LogReg, DT, KNN)
  ↓
Test Set Evaluation → Confusion Matrix PNGs → Serialized .joblib Artifacts
  ↓
Inference Integration → Real-time HUD Difficulty Prediction
```

---

## 43. GitHub and Deployment

- **Version Control**: Project repository organized in clean modular directories.
- **Static Hosting**: 100% deployable on GitHub Pages or Netlify by serving static `index.html` without backend server setup.

---

# PART F — RESULTS AND CONCLUSIONS

## 44. Final AI Results

- **BFS & A***: 100% path length equality across all test mazes. A* explores significantly fewer nodes when heuristic guidance points toward Goal.
- **DFS**: Explores deep branches, yielding non-optimal paths with high step count variance.
- **Greedy Best-First**: Fast execution speed, but path length is non-optimal when obstacles block direct lines of sight.

---

## 45. Final ML Results

- **Logistic Regression**: Achieved highest test accuracy (45.00%) and macro F1 (0.4268).
- **KNN ($K=7$)**: Achieved 36.75% test accuracy.
- **Decision Tree**: Achieved 36.50% test accuracy.
- **Spatial Overlap**: Natural overlap between Medium and Hard mazes reflects continuous topological variations across fixed grid dimensions.

---

## 46. Limitations

1. **Synthetic Dataset**: Models trained on procedurally generated grid mazes; generalization to hand-drawn mazes is unproven.
2. **Search-Based Target**: Labels reflect BFS search space expansion ($CI_{\text{search}}$) rather than human cognitive difficulty.
3. **Fixed Dimensions**: Dataset limited to $15\times15, 21\times21, 25\times25$ square lattices.

---

## 47. Future Scope

1. **Phase 8D JS ML Inference**: Transpile decision rules for client-side evaluation.
2. **Adaptive Difficulty**: Dynamically select grid size and braid ratio based on player completion time.
3. **Human Telemetry**: Collect player move logs to correlate algorithmic difficulty with human cognitive difficulty.

---

## 48. Final Project Mental Model

```text
                                MAZEQUEST
                                    │
  ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
  ▼                   ▼                           ▼                   ▼
GAME ENGINE      MAZE GENERATOR                AI MODULE           ML MODULE
(Canvas, Input,  (Recursive Backtracking,      (BFS, DFS,          (Features X, Dataset,
 State, UX)      Mulberry32 PRNG, Braiding)    Best-First, A*)     CV, Models, Eval)
```

- **GAME ENGINE**: Drives HTML5 canvas graphics, WASD input, and level state.
- **MAZE GENERATOR**: Constructs valid 2D grid mazes with dead-end braiding.
- **AI MODULE**: Solves mazes using 4 graph search algorithms, animates exploration, and benchmarks performance.
- **ML MODULE**: Extracts spatial features $X$, trains classification models in Python, and evaluates search complexity.
