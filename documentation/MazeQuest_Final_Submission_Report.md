# MAZEQUEST

## AI-Driven Maze Game with Search Algorithms and Machine Learning-Based Difficulty Classification

---

## 1. Abstract

**MazeQuest** is an academic web-based software application that integrates interactive game design, state-space Artificial Intelligence (AI) search algorithms, and offline Machine Learning (ML) difficulty classification. The system provides a procedurally generated maze environment where players navigate from Start to Goal across 3 stepped difficulty levels (Easy, Medium, Hard). To break the single-corridor visual predictability of standard perfect mazes, the procedural generator combines Recursive Backtracking with controlled dead-end wall removal (**braiding**). The application incorporates four deterministic state-space search algorithms—Breadth-First Search (BFS), Depth-First Search (DFS), Greedy Best-First Search, and A* Search—supported by an asynchronous step-by-step search visualization engine and a synchronous 4-algorithm benchmark comparator. Furthermore, a supervised Machine Learning subsystem was developed using a synthetic dataset of 2,000 procedurally generated mazes. Five spatial topological features ($X$) were extracted to predict an algorithmic difficulty label ($y \in \{0, 1, 2\}$) derived from BFS search space expansion and path detour factors ($CI_{\text{search}}$). Decision Tree, K-Nearest Neighbors ($K=7$), and Logistic Regression classifiers were trained using 5-Fold Stratified Cross-Validation and evaluated on an untouched test set. The project demonstrates a feature-complete, zero-dependency web application accompanied by an offline ML training and evaluation pipeline.

---

## 2. Introduction

State-space search algorithms and machine learning classification are foundational concepts in computer science and artificial intelligence education. However, theoretical explanations of graph traversal (such as BFS level-order exploration versus A* heuristic guidance) are often abstract when presented solely through pseudocode or static diagrams. 

MazeQuest addresses this gap by creating an interactive, visual maze environment where graph algorithms run directly on the playable game grid. Players can explore mazes manually or execute AI solvers to observe step-by-step node expansions and path trails in real time. Beyond search visualization, MazeQuest explores the structural characteristics that make a maze computationally difficult. By extracting spatial topological properties—such as wall density, dead-end ratio, branching ratio, straight corridor ratio, and turn corridor ratio—the application bridges classical state-space AI search with statistical machine learning classification.

---

## 3. Problem Statement

Standard procedural maze games suffer from two main limitations:
1. **Visual Predictability**: Standard maze-generation algorithms (such as unbraided Recursive Backtracking) produce "perfect mazes" containing zero loops and exactly one path between any two points. Players can often visually trace the solution from Start to Goal without active spatial exploration.
2. **Lack of Objective Difficulty Calibration**: Game difficulty is frequently assigned arbitrarily based on grid dimensions alone, ignoring structural metrics like corridor turns, dead ends, and search space expansion.

MazeQuest addresses these challenges by implementing controlled dead-end braiding to introduce distractor loops, formulating an objective algorithmic difficulty index ($CI_{\text{search}}$) based on search expansion and path detour factors, and evaluating machine learning models to classify maze difficulty directly from spatial features.

---

## 4. Objectives

The primary objectives of the MazeQuest project are:
1. **Playable Game Engine**: Build a responsive web-based maze adventure game featuring keyboard movement, wall collision, timer tracking, level progression, and 3-stepped difficulty selection.
2. **Procedural Generation with Topology Control**: Implement Recursive Backtracking maze generation combined with controlled dead-end braiding to create non-obvious paths and alternate distractor routes.
3. **State-Space AI Search Engine**: Implement four deterministic graph search algorithms (BFS, DFS, Greedy Best-First, A*) operating on a standardized `SearchResult` interface.
4. **Interactive Visualization & Benchmark Suite**: Develop an asynchronous visualizer for step-by-step node exploration and a synchronous 4-algorithm comparator rendering factual performance charts.
5. **Leak-Free ML Subsystem**: Generate a synthetic dataset of 2,000 mazes, engineer 5 spatial topological features, establish train-only percentile cuts for difficulty labeling, and train/evaluate Decision Tree, KNN, and Logistic Regression models using 5-Fold Stratified Cross-Validation.

---

## 5. Scope

The finalized MazeQuest implementation encompasses:
- **Frontend Web Client**: Single-page application shell (`index.html`) using Vanilla CSS glassmorphism styling and HTML5 Canvas rendering.
- **Difficulty & Progression Architecture**: Pre-gameplay difficulty slider (EASY $15\times15$, MEDIUM $21\times21$, HARD $25\times25$) with 250ms smooth visual theme transitions and persistent session difficulty across level progression.
- **AI Search & Comparison Module**: 4 search algorithms, priority queue data structures, step-by-step visualizer with cancellation safety, and empirical comparison modal.
- **Offline ML Subsystem**: Node.js dataset generator/validator, 2,000 synthetic maze records (`dataset.csv` and `dataset.json`), Python training pipeline (`scikit-learn`), 5-Fold Stratified CV, test evaluation, confusion matrix PNG generation, and serialized `.joblib` model artifacts.

---

## 6. Technologies Used

| Technology | Purpose in MazeQuest |
| :--- | :--- |
| **HTML5** | Application structure, DOM container elements, canvas element, HUD bar, and modal markups (`index.html`). |
| **CSS3** | Custom properties (CSS variables), glassmorphism design system, theme state transitions, and responsive layout math (`frontend/css/main.css`). |
| **JavaScript (ES6+)** | Client-side game engine, state management, procedural generator, HTML5 Canvas renderer, AI solvers, visualizer, and comparator. |
| **Node.js** | Command-line runtime for dataset generation, validation pipelines, and ES module unit testing. |
| **Python 3.13** | Offline machine learning subsystem, dataset preprocessing, model training, cross-validation, and test set evaluation (`ml/training/`). |
| **scikit-learn** | Machine learning pipelines, `StandardScaler`, `DecisionTreeClassifier`, `KNeighborsClassifier`, `LogisticRegression`, and `StratifiedKFold`. |
| **pandas / numpy** | Data manipulation, matrix operations, summary statistics, and quantile cut calculations. |
| **matplotlib** | Generation and export of 3x3 confusion matrix PNG plots (`ml/evaluation/confusion_matrices/`). |
| **joblib** | Serialization and persistence of trained ML models and scaling pipelines (`ml/models/*.joblib`). |
| **Git / GitHub** | Source code version control, revision history, and repository host. |
| **GitHub Pages** | Static web application hosting target for client-side web deployment. |

---

## 7. System Architecture

MazeQuest is architected around a clear separation of concerns between Frontend Game Core, Procedural Maze Engine, AI Search Module, and ML Subsystem:

```text
                               ┌─────────────────────────────────────────┐
                               │                MAZEQUEST                │
                               └────────────────────┬────────────────────┘
                                                    │
         ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
         ▼                                          ▼                                          ▼
   ┌───────────┐                              ┌───────────┐                              ┌───────────┐
   │ GAME CORE │                              │ AI MODULE │                              │ ML MODULE │
   └─────┬─────┘                              └─────┬─────┘                              └─────┬─────┘
         │                                          │                                          │
         ├─ View Router (`app.js`)                  ├─ Search Solvers (BFS, DFS, Best, A*)     ├─ Spatial Feature Extractor
         ├─ State Machine (`game_state.js`)         ├─ SearchResult Schema & PriorityQueue     ├─ Dataset Generator (2,000 mazes)
         ├─ Input Handler (WASD/Arrows)             ├─ Visualizer (`visualizer.js`)            ├─ Python CV & Fitting Pipeline
         └─ HTML5 Canvas Renderer                   └─ Comparator (`comparator.js`)            └─ Serialized Models (.joblib)
```

### Runtime Subsystem Communication:
1. **User Interaction**: Selecting a difficulty (EASY, MEDIUM, HARD) triggers `MazeGenerator.generateForDifficulty()`.
2. **Procedural Generation**: `MazeGenerator` builds the 2D grid matrix and applies dead-end braiding.
3. **Game Engine**: `GameState` tracks player position, move counts, and elapsed time, while `CanvasRenderer` draws the grid on an HTML5 canvas at 60 FPS.
4. **AI Module**: Solvers receive the grid matrix and return standard `SearchResult` objects consumed by `AIVisualizer` for step-by-step rendering or `AIComparator` for comparative table/chart rendering.
5. **ML Module**: The spatial feature extractor isolates 5 topological features ($X$) from the grid matrix for model training and future in-browser difficulty prediction.

---

## 8. Maze Generation

### Procedural Algorithm & Grid Representation
MazeQuest represents mazes as 2D numerical matrices:
- `0`: Walkable path cell
- `1`: Wall cell
- `'S'`: Start cell at `(1, 1)`
- `'G'`: Goal cell at `(height - 2, width - 2)`

Maze generation uses **Recursive Backtracking** (DFS-based spanning tree search on grid lattices). The algorithm maintains a stack of visited cells, carving passages through walls to unvisited neighbors 2 units away until all reachable cells are visited.

### Connectivity & Solvability Guarantee
Because Recursive Backtracking generates a spanning tree over the grid graph, it mathematically guarantees 100% path connectivity between Start `'S'` and Goal `'G'`. There are no isolated passages or unreachable regions.

### Controlled Dead-End Braiding
To prevent mazes from having a single obvious corridor, `MazeGenerator` implements **controlled dead-end braiding** (`applyDeadEndBraiding`):
1. Identifies dead-end path cells (path cells with exactly 1 open cardinal neighbor).
2. Evaluates candidate interior walls separating dead ends from adjacent path passages 2 units away.
3. Carves walls for a percentage defined by `braidRatio` using Mulberry32 PRNG `random()`:
   $$\text{Count} = \lfloor N_{\text{dead\_ends}} \times \text{braidRatio} \rfloor$$

| Difficulty Mode | Grid Dimensions | Braid Ratio | Topological Effect |
| :--- | :--- | :--- | :--- |
| **EASY** | $15 \times 15$ | 10% (0.10) | Gentle loops; open navigation. |
| **MEDIUM** | $21 \times 21$ | 25% (0.25) | Moderate branching; distractor turns. |
| **HARD** | $25 \times 25$ | 40% (0.40) | Dense branching; complex distractor loops. |

Carving interior walls between existing paths in a connected graph adds edges, creating loops and junctions without disconnecting any part of the maze or breaking wall collision boundaries.

---

## 9. Game and Difficulty System

### Player Controls & HUD
Players control an avatar using **WASD** or **Arrow Keys**. The HUD bar displays real-time statistics:
- **MODE**: Active difficulty badge (EASY in green, MEDIUM in amber, HARD in red).
- **LEVEL**: Current session level count.
- **MOVES**: Total valid directional steps taken.
- **TIME**: Formatted elapsed session timer (`MM:SS`).

### Difficulty Selector & Theme Engine
The pre-gameplay difficulty selection screen (`#difficulty-shell`) features a 3-stepped horizontal range slider (`0` = EASY, `1` = MEDIUM, `2` = HARD). Sliding or clicking step labels updates CSS custom properties (`.theme-easy`, `.theme-medium`, `.theme-hard`) with **250ms smooth transitions**, dynamically updating the preview card emoji (😊, 🤔, 😤), description, and button accent colors.

### Level Progression Contract
- **Selected Difficulty**: Chosen before starting a session and remains persistent throughout gameplay.
- **Level Progression**: Represents linear advancement within that selected difficulty (`Hard — Level 1 -> Hard — Level 2 -> Hard — Level 3`).
- Advancing to the next level generates a fresh procedural maze using `MazeGenerator.generateForDifficulty(selectedDifficulty)` while preserving the selected mode.

---

## 10. AI Search System

MazeQuest formulates maze solving as a formal **State-Space Search Problem**:
- **State Space $S$**: Set of grid coordinates $(r, c)$ where $\text{grid}[r][c] \neq 1$.
- **Initial State $s_0$**: Start coordinate $(1, 1)$.
- **Goal State $g$**: Goal coordinate $(height - 2, width - 2)$.
- **Action Space $A(s)$**: Cardinal movements $\{\text{North}, \text{South}, \text{East}, \text{West}\}$ into non-wall cells.
- **Path Cost $c(s, a, s')$**: Uniform step cost of $1$ per movement.

Every solver exposes a standardized interface `solve(grid, start, goal)` returning a uniform `SearchResult` schema containing `algorithm`, `success`, `path`, `visitedNodes`, `nodesExplored`, `pathLength`, and `executionTimeMs`.

### 10.1 Breadth-First Search (BFS)
- **Core Principle**: Uninformed search using a FIFO queue to expand nodes level-by-level in order of distance from Start.
- **Optimality**: Guarantees the shortest path length in unweighted grid graphs.
- **Role in MazeQuest**: Serves as the ground-truth benchmark for path length optimality and search space expansion.

### 10.2 Depth-First Search (DFS)
- **Core Principle**: Uninformed search using a LIFO stack to explore deeply along single branches before backtracking.
- **Optimality**: Non-optimal; path length depends on exploration order.
- **Role in MazeQuest**: Demonstrates deep branch traversal and highlights path length non-optimality compared to BFS.

### 10.3 Greedy Best-First Search
- **Core Principle**: Informed heuristic search expanding nodes with the lowest heuristic value $f(n) = h(n)$.
- **Formula**: Uses Manhattan Distance heuristic:
  $$h(n) = |r_n - r_g| + |c_n - c_g|$$
- **Role in MazeQuest**: Demonstrates aggressive goal-directed search; fast execution but non-optimal paths when obstacles intervene.

### 10.4 A* Search
- **Core Principle**: Informed search combining path cost from Start $g(n)$ and estimated distance to Goal $h(n)$.
- **Formula**:
  $$f(n) = g(n) + h(n)$$
  $$h(n) = |r_n - r_g| + |c_n - c_g|$$
- **Optimality**: Manhattan heuristic is admissible ($h(n) \le h^*(n)$) and consistent on orthogonal grids, guaranteeing optimal path lengths ($100\%$ match with BFS path length).
- **Role in MazeQuest**: Demonstrates optimal heuristic search with reduced node expansion compared to uninformed BFS.

---

## 11. AI Visualization and Comparison

### Asynchronous Search Visualizer (`AIVisualizer.js`)
- **Explored Nodes**: Rendered as a translucent cyan overlay animating node expansion in chronological order (`visitedNodes`).
- **Final Path**: Highlighted as an emerald green trail tracing the final path array (`path`).
- **Controls & Safety**: Offers speed presets (Slow=80ms, Normal=35ms, Fast=10ms) and enforces `cancel()` guards to clear pending frame timeouts if the user resets or moves manually.

### Synchronous 4-Algorithm Comparator (`AIComparator.js`)
- Executes BFS, DFS, Greedy Best-First, and A* synchronously on the exact same maze instance.
- **Automated Validation Suite**: Verifies endpoint alignment, non-wall steps, orthogonal adjacent steps, and asserts $L_{\text{A*}} = L_{\text{BFS}}$.
- **Empirical Display**: Renders a glassmorphism comparison table and proportional CSS bar charts for **Nodes Explored** and **Execution Time** without subjective ranking or winner labels.

---

## 12. Machine Learning System

The Machine Learning subsystem formulates maze difficulty classification as a **supervised multiclass classification problem**:
- **Target $y$**: $y \in \{0, 1, 2\}$ representing Easy (0), Medium (1), and Hard (2).
- **Definition of Difficulty**: The target represents **algorithmic search difficulty** ($CI_{\text{search}}$), derived from BFS search space expansion and path detour factor, rather than human player cognitive load.

---

## 13. Dataset and Features

### Synthetic Dataset Generation
A synthetic dataset of $N = 2,000$ mazes was generated using `ml/dataset/datasetGenerator.js`:
- $800$ mazes at $15 \times 15$ grid dimension
- $800$ mazes at $21 \times 21$ grid dimension
- $400$ mazes at $25 \times 25$ grid dimension

### Train/Test Split
The dataset was split into **80% Training (1,600 records)** and **20% Testing (400 records)**.

### Five Spatial Input Features ($X$)

| Feature Name | Mathematical Definition / Ratio | Range |
| :--- | :--- | :--- |
| `wall_density` | $\frac{N_{\text{walls}}}{N_{\text{total\_cells}}}$ | $[0.0, 1.0]$ |
| `dead_end_ratio` | $\frac{N_{\text{dead\_ends}}}{N_{\text{open\_cells}}}$ | $[0.0, 1.0]$ |
| `branching_ratio` | $\frac{N_{\text{junctions}}}{N_{\text{open\_cells}}}$ (cells with $\ge 3$ open neighbors) | $[0.0, 1.0]$ |
| `straight_corridor_ratio` | $\frac{N_{\text{straight\_passages}}}{N_{\text{open\_cells}}}$ | $[0.0, 1.0]$ |
| `turn_corridor_ratio` | $\frac{N_{\text{turn\_passages}}}{N_{\text{open\_cells}}}$ | $[0.0, 1.0]$ |

---

## 14. Difficulty Labeling

To eliminate target leakage, target-generation metrics ($M_{\text{target}}$) were isolated from input features $X$.

### Target Metrics:
1. **Path Detour Factor**:
   $$\text{pathDetourFactor} = \frac{\text{shortestPathLength}}{\text{manhattanDistance}}$$
2. **Search Expansion Ratio**:
   $$\text{searchExpansionRatio} = \frac{\text{bfsNodesExplored}}{\text{openCellCount}}$$

### Search Complexity Index ($CI_{\text{search}}$):
$$CI_{\text{search}} = 0.50 \times \text{pathDetourFactor} + 0.50 \times \text{searchExpansionRatio}$$

### Train-Only Quantile Thresholding:
Percentile cuts were calculated **exclusively on the 1,600 Training records** to prevent preprocessing leakage:
- $P_{33.3}^{\text{train}} = 1.2311$
- $P_{66.7}^{\text{train}} = 1.7412$

### Class Label Mapping:
$$y = \begin{cases} 0 \text{ (Easy)} & \text{if } CI_{\text{search}} \le 1.2311 \\ 1 \text{ (Medium)} & \text{if } 1.2311 < CI_{\text{search}} \le 1.7412 \\ 2 \text{ (Hard)} & \text{if } CI_{\text{search}} > 1.7412 \end{cases}$$

---

## 15. ML Models

Three classification models were implemented in Python (`ml/training/`):

1. **Decision Tree Classifier**:
   - Hyperparameters: `max_depth=5`, `min_samples_split=5`, `criterion='gini'`.
   - Scaler: Evaluated directly on unscaled features (tree models are scale-invariant).
2. **K-Nearest Neighbors (KNN)**:
   - Pipeline: `StandardScaler` $\to$ `KNeighborsClassifier`.
   - Hyperparameter Investigation: Evaluated $K \in \{3, 5, 7, 9\}$ on CV folds; $K=7$ with distance-weighted voting selected.
3. **Logistic Regression**:
   - Pipeline: `StandardScaler` $\to$ `LogisticRegression`.
   - Hyperparameters: $C=1.0$, `solver='lbfgs'`, multinomial loss.

### Validation Protocol:
Models were evaluated using **5-Fold Stratified Cross-Validation** on the 1,600 training records.

---

## 16. Model Evaluation

Models were evaluated on the 400 untouched test records using `scikit-learn` metrics:

### Cross-Validation & Test Set Metrics Summary

| Model Classifier | 5-Fold CV Mean Acc | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Weighted F1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **44.44%** ($\pm 3.63\%$) | **45.00%** | **0.4393** | **0.4450** | **0.4268** | **0.4304** |
| **K-Nearest Neighbors ($K=7$)** | **40.50%** ($\pm 3.26\%$) | **36.75%** | **0.3691** | **0.3679** | **0.3674** | **0.3677** |
| **Decision Tree** | **38.75%** ($\pm 2.36\%$) | **36.50%** | **0.3611** | **0.3656** | **0.3596** | **0.3594** |

### Confusion Matrix Counts (Test Set, N = 400)

#### 1. Logistic Regression Confusion Matrix:
$$\begin{pmatrix} 57 & 27 & 53 \\ 38 & 28 & 61 \\ 17 & 24 & 95 \end{pmatrix}$$
- Easy (0): $57$ correct
- Medium (1): $28$ correct
- Hard (2): $95$ correct

#### 2. K-Nearest Neighbors ($K=7$) Confusion Matrix:
$$\begin{pmatrix} 52 & 45 & 40 \\ 42 & 49 & 36 \\ 37 & 53 & 46 \end{pmatrix}$$

#### 3. Decision Tree Confusion Matrix:
$$\begin{pmatrix} 62 & 41 & 34 \\ 45 & 51 & 31 \\ 51 & 52 & 33 \end{pmatrix}$$

---

## 17. ML Integration

The runtime ML integration architecture follows a strict decoupled flow:

```text
Generated Gameplay Maze
  │
  ▼
Spatial Feature Extractor (`ml/features/mazeFeatureExtractor.js`)
  │ (Extracts 5 spatial features X in O(N) time)
  ▼
X = [wall_density, dead_end_ratio, branching_ratio, straight_corridor_ratio, turn_corridor_ratio]
  │
  ▼
Inference Engine (Phase 8D / Client Browser)
  │ (Evaluates trained decision rules in <1 ms)
  ▼
Predicted Difficulty Badge on HUD
```

### Distinction Between Inference & Target Generation:
- **Target Generation (Offline Training)**: Uses search benchmark outputs ($M_{\text{target}} \to CI_{\text{search}} \to y$).
- **Inference (Online Runtime)**: Uses **only** spatial features ($X \to \hat{y}$) without invoking BFS or calculating detour factors.

---

## 18. Results and Discussion

1. **AI Search Observations**: BFS and A* consistently find identical optimal path lengths on unweighted grid mazes. A* explores substantially fewer nodes than BFS when heuristic guidance points toward the Goal. DFS explores deeply down single branches, returning non-optimal paths with high variance.
2. **ML Observations & Class Overlap**: Machine learning evaluation revealed that spatial features $X$ exhibit natural overlap across adjacent difficulty classes. Because procedural mazes vary continuously in corridor geometry across fixed grid dimensions ($15\times15, 21\times21, 25\times25$), static spatial ratios alone provide moderate discriminative power without search metrics.
3. **Wall Density Behavior**: In standard Recursive Backtracking on odd dimensions, spanning tree cell counts are mathematically invariant for a given grid dimension. Consequently, `wall_density` takes discrete values ($0.4578, 0.4694, 0.4736$), causing tree models to split primarily on `dead_end_ratio` and corridor ratios.

---

## 19. Testing

The project underwent comprehensive testing across all modules:

- **Procedural Maze Validity**: Verified 100% path connectivity, valid Start `'S'` and Goal `'G'` markers, and outer wall boundary integrity across Easy, Medium, and Hard braided mazes.
- **Player Movement & Collision**: Verified WASD and Arrow key controls, wall collision enforcement, timer tracking, and level completion triggers.
- **AI Solver Automated Suite**: Executed unit tests (`bfs_test.js`, `dfs_test.js`, `best_first_test.js`, `astar_test.js`) asserting path continuity and optimality.
- **AI Comparator Test Suite**: Executed `comparator_test.js` validating multi-solver execution and asserting $L_{\text{A*}} = L_{\text{BFS}}$.
- **ML Feature & Dataset Test Suites**: Executed `mazeFeatureExtractor.test.js`, `datasetGenerator.test.js`, and `test_ml_pipeline.py` (6 Python unit tests passing).
- **Live Browser UX Testing**: Conducted interactive testing via Browser Subagent, verifying home page cleanup, 250ms difficulty slider transitions, canvas rendering, and modal dialogs.

---

## 20. GitHub and Deployment

### Repository Management
The project repository is structured with clean modular folders (`frontend/`, `maze/`, `ai/`, `ml/`, `data/`, `documentation/`). Version control history tracks clear phase-by-phase developments.

### Client-Side Static Deployment
MazeQuest is designed with **zero backend server dependencies**. The client application can be hosted directly on static platforms such as **GitHub Pages** or Netlify by serving `index.html`.

---

## 21. Limitations

1. **Synthetic Dataset**: Models are trained on procedurally generated mazes; generalization to hand-crafted or non-grid mazes remains unverified.
2. **Search-Based Difficulty Target**: Ground-truth labels reflect BFS algorithmic expansion ($CI_{\text{search}}$) rather than human player cognitive difficulty.
3. **Spatial Feature Overlap**: Spatial features $X$ exhibit continuous overlap across grid sizes, limiting single-feature decision boundaries.

---

## 22. Future Scope

1. **In-Browser JS ML Inference (Phase 8D)**: Transpile decision rules or export model weights for real-time HUD predictions in $<1\text{ms}$.
2. **Adaptive Difficulty Adjustment**: Dynamically adjust grid dimensions and braid ratios based on real-time player completion speeds and move efficiency.
3. **Human Gameplay Telemetry**: Collect human completion times and move counts to correlate algorithmic difficulty ($CI_{\text{search}}$) with human cognitive difficulty.
4. **Diverse Topologies**: Extend generation to non-square lattices, hexagonal grids, and user-drawn obstacle maps.

---

## 23. Conclusion

MazeQuest successfully demonstrates an end-to-end integration of interactive game development, state-space AI search algorithms, and machine learning classification. The application delivers a responsive browser experience with 3 stepped difficulty modes and controlled dead-end braiding. All four AI solvers execute reliably, backed by a visual exploration engine and empirical comparator. The offline ML pipeline established a leak-free methodology for dataset generation, feature extraction, train-only quantile thresholding, and model evaluation. The project fulfills all functional and academic objectives.

---

## 24. References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
2. Buck, J. (2015). *Maze Algorithms: A Visual Guide for Programmers*. Pragmatic Bookshelf.
3. Pedregosa, F., et al. (2011). Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research*, 12, 2825-2830.
4. MazeQuest Project Documentation:
   - [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
   - [`DIFFICULTY_SYSTEM.md`](DIFFICULTY_SYSTEM.md)
   - [`AI_SEARCH_ARCHITECTURE.md`](AI_SEARCH_ARCHITECTURE.md)
   - [`AI_VISUALIZATION.md`](AI_VISUALIZATION.md)
   - [`AI_COMPARISON.md`](AI_COMPARISON.md)
   - [`ML_PROBLEM_DEFINITION.md`](ML_PROBLEM_DEFINITION.md)
   - [`ML_FEATURE_EXTRACTION.md`](ML_FEATURE_EXTRACTION.md)
   - [`ML_MODEL_TRAINING.md`](ML_MODEL_TRAINING.md)
   - [`ML_INFERENCE_ARCHITECTURE.md`](ML_INFERENCE_ARCHITECTURE.md)
   - [`VIVA_NOTES.md`](VIVA_NOTES.md)
