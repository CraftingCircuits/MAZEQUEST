# MAZEQUEST — VIVA PREPARATION NOTES

This document accumulates key conceptual questions, architectural justifications, and algorithmic explanations to help prepare for viva examinations.

---

## 1. Project Architecture & Web Stack

### Q: Why did you choose Vanilla JavaScript ES Modules instead of React or Vue?
**Answer**:
1. **Transparency & Viva Clarity**: Vanilla ES Modules show exact control over DOM manipulation, event handling, data structures, and state without framework abstractions obscuring the core logic.
2. **Zero Overhead & Deployment Simplicity**: The project runs natively in any browser with zero bundler or build steps, making static deployment on GitHub Pages / Netlify straightforward.
3. **Performance**: Direct manipulation of the HTML5 Canvas API allows 60 FPS rendering without virtual DOM diffing overhead.

---

## 2. Separation of AI and ML

### Q: What is the fundamental difference between the AI and ML components in MazeQuest?
**Answer**:
- **AI (Search Algorithms)**: Answers **"How to solve this specific maze?"** It operates deterministically using state-space search (BFS, DFS, Best-First, A*) to find a path from Start to Goal.
- **ML (Difficulty Prediction)**: Answers **"How complex is this maze structurally?"** It uses statistical classification models (Decision Tree, KNN, Logistic Regression) trained on topological features (dead-ends, wall density, path length) to predict difficulty before a player solves it.

---

## 3. AI Search Visualization & Decoupling (Phase 7A)

### Q: Why should visualization be separated from the search algorithm?
**Answer**:
Separation of Concerns: Solvers are pure functions that execute synchronously in $< 1\text{ms}$ on data arrays. Keeping visualization decoupled ensures:
1. Pure, uncorrupted execution-time benchmarking (`performance.now()`).
2. Reusability of solvers for offline dataset generation without browser rendering overhead.
3. Asynchronous visual playback without blocking the browser thread.

### Q: What are `visitedNodes` / `searchOrder`?
**Answer**:
`visitedNodes` is an array of coordinate tuples `[{r,c}, ...]` recording the exact chronological sequence in which cells were expanded by the search algorithm. The visualization engine reads this array to animate exploration step-by-step.

### Q: Why don't we rerun the search algorithm during animation?
**Answer**:
The solver executes once synchronously to produce the `SearchResult` object (`visitedNodes` & `path`). Re-running the solver during animation would distort execution time measurements and create unnecessary CPU overhead.

### Q: Why should animation time NOT be included in execution time?
**Answer**:
Execution time measures **algorithmic complexity and search speed** (`0.284 ms`), which depends solely on graph size and search strategy. Animation delay is artificial human-facing UI feedback (e.g. 25ms per frame) and is completely irrelevant to algorithm performance.

### Q: What is the visual distinction between explored cells and the final path?
**Answer**:
- **Explored Cells**: Rendered as a translucent indigo/cyan fill representing nodes evaluated during the search.
- **Final Path**: Rendered as a vibrant emerald green trail representing the exact optimal/valid solution path from Start to Goal.

### Q: How does the visualization handle an unsolvable maze?
**Answer**:
If `searchResult.success === false`, the visualizer completes the exploration loop (showing searched nodes), omits the final path animation, and sets the HUD status banner to `Found: No`.

### Q: Why is cancellation required for asynchronous animation?
**Answer**:
If a player resets the maze, generates a new maze, or moves manually while an animation loop is active, old `setTimeout` callbacks would otherwise continue executing and draw stale nodes on the new maze. `aiVisualizer.cancel()` clears pending timeouts and resets overlay sets.

### Q: Does visualization change the actual maze data structure or affect path length?
**Answer**:
**No**. Visualization is purely a temporary rendering overlay layer. It reads coordinates from `SearchResult` and passes them to `CanvasRenderer` without modifying the underlying `mazeGrid` matrix or altering algorithm path calculations.

---

## 4. Four-Algorithm Visualization Viva Q&A (Phase 7B)

### Q: Why can the same visualizer be used for all four algorithms?
**Answer**:
Because all four algorithms (**BFS**, **DFS**, **Greedy Best-First**, **A***) output the standardized `SearchResult` schema (`visitedNodes` and `path`). The visualizer is agnostic to search strategies and simply renders coordinate arrays on the canvas step-by-step.

### Q: What common information must every solver return?
**Answer**:
Every solver returns a `SearchResult` containing: `algorithm` name, `success` boolean, `path` coordinate array, `visitedNodes` expansion sequence array, `nodesExplored` integer count, and `executionTimeMs` pure search runtime.

### Q: Why should all algorithms operate on the same maze for comparison?
**Answer**:
Operating on the exact same maze topology, start position, and goal position ensures controlled empirical benchmarking of nodes explored, path length, and execution time without confounding topological variables.

### Q: Why should the visualizer not know the internal algorithm logic?
**Answer**:
To maintain strict Separation of Concerns. The visualizer is solely a UI playback controller. Keeping it decoupled allows developers to add or tune search algorithms without modifying visualization or canvas code.

### Q: What is the difference between a solver and a visualization layer?
**Answer**:
- **Solver**: A pure, synchronous mathematical function executing state transitions and pathfinding in $<1\text{ms}$.
- **Visualization Layer**: An asynchronous UI component animating search expansion and path trails over time using `setTimeout` frame loops.

### Q: Why should visualization not modify maze topology?
**Answer**:
Visualization is a non-destructive analytical overlay. Modifying walls or player state during visualization would corrupt the game state, break collision detection, and invalidate subsequent solver runs.

### Q: Why is animation time excluded from algorithm execution time?
**Answer**:
Animation time includes artificial human-facing frame delays (e.g. 25ms per step). Execution time measures raw computational complexity via `performance.now()` in the solver search loop.

### Q: Why can DFS produce a different path from BFS?
**Answer**:
BFS uses a FIFO queue to explore nodes level-by-level, guaranteeing the shortest path in unweighted graphs. DFS uses a LIFO stack to dive down single branches, returning the first path reached at the goal, which is often longer and non-optimal.

### Q: Why can Greedy Best-First Search produce a non-shortest path?
**Answer**:
Greedy Best-First expands nodes purely by lowest heuristic distance $h(n)$ to the goal, ignoring path cost already accumulated $g(n)$. It can be lured down dead ends or sub-optimal detours.

### Q: Why should A* match BFS path length in the current unit-cost maze model?
**Answer**:
In unit-cost graphs where step cost $g=1$ and Manhattan distance heuristic $h(n)$ is admissible ($h(n) \le h^*(n)$) and consistent, A* is mathematically proven to find an optimal shortest path, matching BFS path length while exploring fewer nodes.

---

## 5. Four-Algorithm Comparison Viva Q&A (Phase 7C)

### Q: Why must all algorithms run on the same maze for comparison?
**Answer**:
To enforce controlled experimental conditions. Comparing search metrics (nodes explored, path length, execution time) across different mazes would introduce confounding topological variables like dead-end count or branching factor.

### Q: What metrics are being compared in Phase 7C?
**Answer**:
1. **Path Found**: Boolean solution existence.
2. **Path Length**: Number of solution steps ($path.length - 1$).
3. **Nodes Explored**: Count of dequeued/popped state nodes.
4. **Execution Time**: Pure CPU search runtime in milliseconds (`performance.now()`).

### Q: Why is path length important?
**Answer**:
Path length measures **solution quality**. In unweighted maze graphs, shortest path length represents the theoretical minimum number of steps required to reach the goal.

### Q: What does nodes explored represent?
**Answer**:
Nodes explored measures **search space expansion activity**. It reflects how efficiently an algorithm prunes unnecessary paths or focuses exploration toward the goal.

### Q: Why can execution time vary between runs?
**Answer**:
Execution time measures observed browser JavaScript runtime, which fluctuates due to CPU frequency scaling, garbage collection pauses, microtask scheduling, and browser event loop activity.

### Q: Why should animation time be excluded from solver comparison?
**Answer**:
Animation delays (e.g. 25ms per step) are artificially introduced for human observation. Including them would measure UI delay rather than algorithmic efficiency.

### Q: Why should A* and BFS have equal path lengths in this maze model?
**Answer**:
Because movement has unit cost ($g=1$) and the Manhattan distance heuristic $h(n)$ is admissible and consistent. Both algorithms are mathematically proven to find optimal shortest paths.

### Q: Why can DFS return a longer path?
**Answer**:
DFS uses a LIFO stack to explore deeply down single paths without level-order guarantees. It terminates upon reaching the goal via whichever path it hits first, which is frequently sub-optimal.

### Q: Why can Greedy Best-First Search return a non-shortest path?
**Answer**:
Greedy Best-First selects nodes purely by minimum heuristic estimate $h(n)$, ignoring path cost already spent $g(n)$. It can be tricked by dead ends into taking sub-optimal detours.

### Q: Why should we avoid declaring one algorithm universally "best"?
**Answer**:
Different algorithms optimize different trade-offs. Greedy Best-First may explore fewer nodes than BFS on open mazes but return longer paths; BFS guarantees optimal paths but expands more nodes; A* balances optimal paths with reduced expansion. Performance depends heavily on maze topology.

### Q: What happens when the maze is unsolvable?
**Answer**:
All solvers run to exhaustion without throwing errors, return `success: false`, display `Path Found: No` and `Path Length: —`, and record actual nodes explored and execution duration.

### Q: Why is the comparison layer separate from the solver layer?
**Answer**:
To maintain modularity and single responsibility. Solvers execute pure pathfinding; `AIComparator` aggregates results and validates path integrity; the UI renders comparison tables and charts without modifying solver logic.

---

## 6. ML Problem Definition & Feature Design Viva Q&A (Phase 8A Corrected)

### Q: What is target leakage?
**Answer**:
Target leakage occurs when the target variable $y$ is constructed using features that are also supplied in the input feature vector $X$. This creates a circular dependency where the classifier simply reconstructs the linear labeling formula rather than learning genuine predictive relationships.

### Q: Why was the original composite CI approach problematic?
**Answer**:
Because $CI$ was calculated using `normalizedPathLength`, `deadEndRatio`, and `astarNodesExplored`, and those exact same features were fed into model input vector $X$. The Decision Tree merely memorized threshold splits on features present in $X$, resulting in circular target leakage.

### Q: How are the final difficulty labels generated in the corrected design?
**Answer**:
Ground-truth target labels ($y \in \{0, 1, 2\}$) are derived from Search Benchmark Metrics ($M_{target} = [\text{pathDetourFactor}, \text{searchExpansionRatio}]$) calculated via solver execution. Percentile quantiles ($P_{33.3}^{train}, P_{66.7}^{train}$) are computed **exclusively on the Training Split** to assign `0`=Easy, `1`=Medium, `2`=Hard.

### Q: Why can't we simply calculate difficulty from the same features given to the classifier?
**Answer**:
Because if $y = g(X)$, the ML classifier is not predicting difficulty from spatial patterns — it is merely performing algebraic curve-fitting of a known function $g$. By strictly isolating spatial grid inputs $X$ (`wallDensity`, `deadEndRatio`, `branchingRatio`, `straightCorridorRatio`, `turnCorridorRatio`) from search output benchmark metrics $M_{target}$, the model must learn how local wall geometry predicts global search space difficulty.

### Q: How are train and test data kept independent to avoid threshold leakage?
**Answer**:
Percentile quantile thresholds ($P_{33.3}^{train}, P_{66.7}^{train}$) are calculated **ONLY on the 80% Training set**. These fixed numerical cut points are then applied to assign difficulty labels to the 20% Test set. The Test set distribution is never used to calculate quantiles, preventing dataset-level threshold leakage.

### Q: Does balanced data mean real-world maze difficulty is naturally balanced?
**Answer**:
**No**. It is an **intentionally balanced synthetic dataset policy** (~33.3% per class) enforced via training set percentiles. Real-world mazes may have skewed difficulty distributions; balancing the synthetic dataset enforces equal prior class probabilities $P(y=c) = \frac{1}{3}$, preventing majority-class model bias.

### Q: What is the ML problem in MazeQuest?
**Answer**:
Predicting the structural difficulty tier ($y \in \{\text{Easy}, \text{Medium}, \text{Hard}\}$) of a procedurally generated maze using a vector of pure spatial grid features $X \in \mathbb{R}^k$.

### Q: Is this classification or regression?
**Answer**:
It is a **Supervised Multiclass Classification** problem because the target variable consists of three discrete ordinal classes (`Easy`, `Medium`, `Hard`).

### Q: What are the input features in vector X?
**Answer**:
Pure spatial matrix properties computed without solver execution: `wallDensity`, `deadEndRatio`, `branchingPointRatio`, `straightCorridorRatio`, and `turnCorridorRatio`.

### Q: How is a dead end defined?
**Answer**:
A traversable path cell (`0`) that has **exactly 1 traversable cardinal neighbor**. Start (`'S'`) and Goal (`'G'`) are excluded to avoid endpoint skew.

### Q: How is a branching point defined?
**Answer**:
A traversable path cell (`0`, `'S'`, `'G'`) that has **3 or 4 traversable cardinal neighbors**, creating navigation decision junctions.

### Q: Why normalize features by open cell count?
**Answer**:
Normalizing raw counts by `openCellCount` or `totalCells` makes spatial features scale-invariant across variable grid dimensions (e.g. $15\times15$ vs $25\times25$).

### Q: Why use Python/scikit-learn for training instead of training directly in JavaScript?
**Answer**:
Python (`scikit-learn`, `pandas`) provides mature data science tooling for 5-Fold Stratified Cross-Validation, feature importance extraction, and confusion matrices. Trained decision tree rules are exported to `model_rules.json`, allowing fast, lightweight in-browser JavaScript inference without backend server dependencies.

---

## 7. ML Feature Extraction & Dataset Generation Viva Q&A (Phase 8B)

### Q1: What is feature extraction?
**Answer**:
Feature extraction is the process of transforming raw grid matrix data into numerical representations ($X$) that capture structural properties of the maze without running pathfinding algorithms.

### Q2: Why is wall density useful?
**Answer**:
`wallDensity` ($\text{wallCount} / \text{totalCells}$) measures structural tightness. Higher wall density restricts available movement corridors and alters maze open-space geometry.

### Q3: How is a dead end detected?
**Answer**:
A cell is a dead end if it is traversable, is neither Start nor Goal, and has **exactly ONE** traversable cardinal neighbor (North, South, East, West).

### Q4: What is a branching point?
**Answer**:
A cell is a branching point if it is traversable and has **3 or 4** traversable cardinal neighbors, creating navigation decision choices for the player or search solver.

### Q5: How do you detect a straight corridor?
**Answer**:
A cell is a straight corridor if it is traversable, has **exactly 2** traversable cardinal neighbors, and those 2 neighbors are collinear/opposite (North+South OR East+West).

### Q6: How do you detect a turn corridor?
**Answer**:
A cell is a turn corridor if it is traversable, has **exactly 2** traversable cardinal neighbors, and those 2 neighbors are orthogonal/90-degree adjacent (e.g. North+East).

### Q7: Why are ratios used instead of raw counts?
**Answer**:
Ratios (e.g. `deadEndCount / openCellCount`) normalize features across different grid dimensions ($15\times15, 21\times21, 25\times25$), making spatial features scale-invariant.

### Q8: Why is BFS used for shortest path?
**Answer**:
BFS explores nodes level-by-level in FIFO order, guaranteeing the exact minimum shortest path length $L_{bfs}$ in unweighted 4-direction grids.

### Q9: What is Manhattan distance?
**Answer**:
The L1 norm distance between Start $(r_1, c_1)$ and Goal $(r_2, c_2)$: $D = |r_1 - r_2| + |c_1 - c_2|$. It represents the absolute minimum steps required without walls.

### Q10: Why is shortest path >= Manhattan distance?
**Answer**:
In 4-directional grid movement, Manhattan distance is the straight-line grid distance without obstacles. Obstacles/walls force path detours, making shortest path length $\ge$ Manhattan distance.

### Q11: What is path detour factor?
**Answer**:
The ratio $F_{detour} = L_{bfs} / D_{manhattan}$. It measures how much walls force the optimal path to deviate from the direct Manhattan distance line.

### Q12: What is search expansion ratio?
**Answer**:
The ratio $R_{expansion} = N_{bfs} / \text{openCellCount}$. It measures what fraction of total walkable space BFS had to explore before discovering the goal.

### Q13: Why are search metrics excluded from X?
**Answer**:
To prevent target leakage. Search metrics ($M_{target}$) are used solely to calculate ground-truth target difficulty $y$. If search metrics were in $X$, the classifier would trivially memorize search output rather than learning spatial prediction.

### Q14: How are difficulty labels generated?
**Answer**:
Using $CI_{search} = 0.50 \cdot F_{detour} + 0.50 \cdot R_{expansion}$. Quantile cut points ($P_{33.3}^{train}, P_{66.7}^{train}$) are computed on Training data to split mazes into Easy ($0$), Medium ($1$), and Hard ($2$).

### Q15: Why are percentile thresholds calculated using training data only?
**Answer**:
To prevent threshold data leakage between training and testing sets. If test data were used to compute percentiles, information about test set distribution would leak into the training process.

### Q16: Why is reproducibility important?
**Answer**:
Reproducibility ensures that dataset synthesis produces the exact same records, features, and split assignments across executions, allowing verification and reliable experiment replication.

### Q17: How do you validate generated mazes?
**Answer**:
By testing grid matrix dimensions, verifying Start/Goal bounds and non-wall placement, ensuring BFS path existence, and checking numeric range bounds (no `NaN`, `null`, or `Infinity`).

### Q18: What happens if the generator produces an invalid maze?
**Answer**:
The invalid maze is rejected, the failure reason is recorded, and the generation loop retries with the next seed until $N = 2,000$ valid mazes are created.

### Q19: Why are we not training the ML model in Phase 8B?
**Answer**:
Phase 8B strictly focuses on data engineering, feature extraction, target derivation, and statistical validation. ML model training, cross-validation, and evaluation are reserved for Phase 8C.

### Q20: What will Phase 8C do?
**Answer**:
Phase 8C will train Decision Tree, KNN, and Logistic Regression models on `dataset.csv`, evaluate performance via 5-Fold Stratified Cross-Validation, analyze feature importances, and export decision rules (`model_rules.json`) for in-browser difficulty prediction.

---

## 8. ML Model Training & Evaluation Viva Q&A (Phase 8C)

### Q1: What type of ML problem is MazeQuest solving?
**Answer**:
Supervised Multiclass Classification. The model maps a 5D spatial feature vector $X$ to one of three discrete difficulty classes: `0` (Easy), `1` (Medium), or `2` (Hard).

### Q2: What are the input features in vector X?
**Answer**:
The 5 pure spatial topological ratios: `wall_density`, `dead_end_ratio`, `branching_ratio`, `straight_corridor_ratio`, and `turn_corridor_ratio`.

### Q3: What is the target variable?
**Answer**:
`difficulty` ($y \in \{0, 1, 2\}$), derived from the search complexity index $CI_{search} = 0.50 \cdot F_{detour} + 0.50 \cdot R_{expansion}$ via training-only quantile cut thresholds ($P_{33.3}^{train}=1.2311, P_{66.7}^{train}=1.7412$).

### Q4: Why is this multiclass classification?
**Answer**:
Because the target variable contains 3 mutually exclusive categorical outcome classes (`Easy`, `Medium`, `Hard`) rather than a continuous numerical value (regression) or binary split (2 classes).

### Q5: Why are search metrics excluded from X?
**Answer**:
To prevent target leakage. Search metrics ($M_{target}$) were used to calculate the ground-truth label $y$. Including them in $X$ would allow the model to trivially memorize solver outputs rather than learning spatial prediction.

### Q6: What is train/test splitting?
**Answer**:
Partitioning dataset records into a Training set ($1,600$ records, 80%) for fitting models/tuning hyperparameters, and a Testing set ($400$ records, 20%) kept strictly untouched to evaluate out-of-sample generalization performance.

### Q7: Why should the test set remain untouched?
**Answer**:
If hyperparameter choices, feature selection, or thresholds are adjusted based on test set performance, the test set becomes contaminated ("data leakage"), resulting in overly optimistic, invalid evaluation metrics.

### Q8: Why is feature scaling needed for KNN?
**Answer**:
KNN calculates Euclidean distance $\sqrt{\sum (x_i - y_i)^2}$ in feature space. Features with larger numerical ranges would dominate distance calculations. Standardizing features to mean = 0, std = 1 gives equal weight to all 5 features.

### Q9: Why does Decision Tree not require scaling?
**Answer**:
Decision Trees make axis-aligned split decisions based on feature inequalities ($x_i \le t$). Order-preserving monotonic transformations or feature scale changes do not alter split ordering.

### Q10: Why is Logistic Regression scaled here?
**Answer**:
Standardizing numerical features ensures fast, stable gradient descent convergence and allows direct comparison of model coefficient magnitudes.

### Q11: What is K in KNN?
**Answer**:
$K$ represents the number of nearest training samples evaluated in feature space to determine a test sample's predicted class via majority vote.

### Q12: How did you choose K?
**Answer**:
By evaluating $K \in [3, 5, 7, 9]$ using 5-Fold Stratified Cross-Validation on the Training set only. $K=7$ yielded the highest mean CV accuracy ($0.4050$) and was selected.

### Q13: What is cross-validation?
**Answer**:
A resampling technique where the Training set is partitioned into $K$ equal folds. The model is trained on $K-1$ folds and validated on the remaining fold, repeating $K$ times to estimate generalization stability.

### Q14: Why use StratifiedKFold?
**Answer**:
Stratified K-Fold ensures that every fold maintains the exact class proportion (~33.3% per class) as the full dataset, preventing class imbalance bias across validation folds.

### Q15: What is accuracy?
**Answer**:
The proportion of total correct predictions: $\text{Accuracy} = \frac{\text{Correct Predictions}}{\text{Total Predictions}}$.

### Q16: What is precision?
**Answer**:
The fraction of positive predictions that are truly correct: $\text{Precision} = \frac{TP}{TP + FP}$. It measures prediction exactness.

### Q17: What is recall?
**Answer**:
The fraction of actual positive instances correctly identified: $\text{Recall} = \frac{TP}{TP + FN}$. It measures coverage completeness.

### Q18: What is F1-score?
**Answer**:
The harmonic mean of precision and recall: $\text{F1} = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$, balancing precision and recall trade-offs.

### Q19: What is a confusion matrix?
**Answer**:
A $3 \times 3$ grid layout displaying actual versus predicted class counts, illustrating exact classification agreements and error patterns across all class pairs.

### Q20: What does a diagonal confusion-matrix value represent?
**Answer**:
Cells along the main diagonal $(i, i)$ represent correct predictions where predicted class matches actual class.

### Q21: What is feature importance in Decision Tree?
**Answer**:
The total Gini impurity reduction brought by splits on a feature across the tree, normalized to sum to $1.0$.

### Q22: Why doesn't KNN have conventional feature importance?
**Answer**:
KNN is a non-parametric instance-based classifier. It stores raw training vectors and computes distance neighborhood votes rather than fitting parametric feature weights.

### Q23: What do Logistic Regression coefficients represent?
**Answer**:
The log-odds impact of a 1-unit increase in a standardized feature on the probability of a sample belonging to a specific target class.

### Q24: Why does wall_density have only three unique values?
**Answer**:
Because in standard Recursive Backtracking on odd dimensions, spanning tree cell counts are mathematically invariant for a fixed grid dimension ($15\times15, 21\times21, 25\times25$).

### Q25: What is target leakage?
**Answer**:
Occurs when features derived from or correlated with the target creation formula are included in $X$, causing artificial, inflated model performance.

### Q26: How did you prevent preprocessing leakage?
**Answer**:
By embedding `StandardScaler` inside `scikit-learn` `Pipeline` objects, ensuring scalers are fitted exclusively on training folds during CV and test prediction.

### Q27: Why are the labels called algorithmic/search difficulty?
**Answer**:
Because ground-truth labels are derived from BFS search space expansion and path detour factors ($CI_{search}$), which reflect solver graph complexity rather than human player cognitive load.

### Q28: Why are we using synthetic maze data?
**Answer**:
Procedural generation allows generating thousands of fully labeled mazes with deterministic seeds, controlled grid topologies, and guaranteed connectivity without manual annotation.

### Q29: What are limitations of the current ML dataset?
**Answer**:
Synthetically generated data, restricted to 3 discrete grid sizes ($15\times15, 21\times21, 25\times25$), and ground-truth labels based on BFS algorithmic complexity rather than human gameplay logs.

### Q30: What will happen in the next ML phase?
**Answer**:
Phase 8D will convert trained model parameters into lightweight in-browser JavaScript inference code for real-time difficulty display on the HUD.

---

## 10. Difficulty System & Topology Viva Q&A (Phase 8 UX)

### Q31: What is controlled dead-end braiding, and why was it introduced?
**Answer**:
Controlled dead-end braiding is the removal of a specified fraction (`braidRatio`) of interior walls separating dead-ends from adjacent path passages. Standard Recursive Backtracking generates a "perfect maze" with zero loops and a single obvious corridor. Braiding introduces alternate distractor routes, loops, and junctions, making mazes visually non-obvious and engaging for human players.

### Q32: Does dead-end braiding break maze connectivity or AI search algorithms?
**Answer**:
**No**. Carving interior walls between existing open path cells in an already connected spanning tree adds graph edges, which creates cycles/loops without breaking graph connectivity. Start and Goal remain 100% connected, outer wall boundaries remain intact, and all four AI solvers (BFS, DFS, Best-First, A*) solve the maze without modification.

### Q33: What is the fundamental difference between user-selected difficulty and ML-predicted difficulty?
**Answer**:
- **User-Selected Difficulty**: A procedural **gameplay generation parameter** controlling grid dimensions ($15\times15, 21\times21, 25\times25$) and braid ratio ($0.10, 0.25, 0.40$).
- **ML-Predicted Difficulty**: In Phase 8D, the trained ML classifier will **independently evaluate** the 5 extracted spatial features ($X$) of any generated maze to classify its difficulty without hardcoding or reading the user's selection.

### Q34: How does user-selected difficulty interact with level progression?
**Answer**:
The user-selected difficulty (`selectedDifficulty`) defines the challenge mode chosen before playing. `Level` represents linear progression within that mode (`Hard — Level 1 -> Hard — Level 2 -> Hard — Level 3`). Advancing levels generates fresh mazes under the SAME selected difficulty until the user explicitly returns to the difficulty selection screen.



