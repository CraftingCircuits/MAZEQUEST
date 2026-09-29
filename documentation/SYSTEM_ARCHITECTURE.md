# MAZEQUEST — SYSTEM ARCHITECTURE DOCUMENTATION

This document defines the authoritative architecture, data flows, module boundaries, and implementation strategy for **MazeQuest**.

---

## 1. High-Level Architecture Diagram

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
         ├─ Player Controls (Keyboard/WASD)         ├─ Grid State (S, G, #, .)                 ├─ Maze Generator
         ├─ State & Level Manager                   ├─ Search Algorithms                       ├─ Feature Extractor
         ├─ Movement & Collision Logic              │  (BFS, DFS, Best-First, A*)              │  (dead ends, density, etc.)
         └─ HTML5 Canvas Renderer                   ├─ Visualizer & Step Animation             ├─ Dataset & Model Training
                                                    ├─ Benchmark Stats (Nodes, Time)           │  (Decision Tree, KNN, LogReg)
                                                    └─ AI Comparator & Validation Suite        └─ Difficulty Predictor Engine
```

---

## 2. Module Responsibilities

1. **Frontend / Game Core**: 
   - UX Flow: `HOME -> DIFFICULTY SELECTION -> GAMEPLAY`.
   - Handles DOM events, difficulty selection slider & visual theme transitions, keyboard controls, game state loop (`selectedDifficulty` state persistence across levels), and Canvas drawing.
2. **Maze System**: 
   - Implements **Recursive Backtracking** combined with **Controlled Dead-End Braiding** (`MazeGenerator.generateForDifficulty(difficulty)`).
   - Supports 3 difficulty modes: EASY (15x15, 10% braid), MEDIUM (21x21, 25% braid), HARD (25x25, 40% braid).
   - Introduces distractor loops and alternate routes while preserving 100% graph connectivity and validity.
3. **AI Search Module**: 
   - Exposes a unified `SearchAlgorithm.solve(mazeGrid, startPos, goalPos)` interface returning a standardized `SearchResult` object.
   - `AIVisualizer`: Handles asynchronous exploration and path trail overlay animations.
   - `AIComparator`: Executes all four solvers synchronously on identical maze inputs, runs automated path validation (endpoint alignment, non-wall steps, A* vs BFS path length equality), and renders factual comparison tables and proportional bar charts.
4. **ML Module**:
   - **Feature Extraction & Dataset Generation (`ml/`)**: Generates 2,000 synthetic mazes, extracts 5 spatial topological features ($X$), extracts 6 target-generation search benchmark metrics ($M_{target}$), isolates search metrics from input feature vector $X$, performs 80%/20% Train/Test split, computes $P_{33.3}^{train}$ and $P_{66.7}^{train}$ percentile cuts exclusively on Training data, and exports `data/ml/dataset.csv` and `data/ml/dataset.json`.
   - **ML Model Training & Evaluation (`ml/training/`)**: Trains Decision Tree ($97.25\%$), KNN ($96.50\%$), and Logistic Regression ($98.75\%$) classifiers on dataset $X \to y$.
   - **In-Browser ML Separation**: User-selected difficulty is a gameplay generation parameter; ML inference in Phase 8D will independently predict difficulty from spatial features $X$.

---

## 3. Data Flow & Interfaces

### 3.1 2D Grid Matrix Representation
- `0`: Walkable path cell
- `1`: Wall cell
- `'S'`: Start cell `(0,0)`
- `'G'`: Goal cell `(height-1, width-1)`

### 3.2 AI Search Interface (`SearchResult`)
```javascript
{
  algorithm: "ASTAR",
  success: true,
  path: [{r:0, c:0}, {r:0, c:1}, ...],
  visitedNodes: [{r:0, c:0}, ...],
  pathLength: 24,
  nodesExplored: 52,
  executionTimeMs: 1.42
}
```

### 3.3 AI Comparator Data Flow
```text
Current Maze (Grid, Start, Goal)
           │
  Four Independent Solvers (BFS, DFS, Best-First, A*)
           │
  Four SearchResults & Path Validation Checks
           │
  Factual Comparison Table & Proportional Bar Charts
```

### 3.4 ML Spatial Feature Vector & Benchmark Target Pipeline
- **Input Feature Vector $X$**: `[wallDensity, deadEndRatio, branchingPointRatio, straightCorridorRatio, turnCorridorRatio]`
- **Target Benchmark Metrics $M_{target}$**: `[shortestPathLength, manhattanDistance, pathDetourFactor, bfsNodesExplored, searchExpansionRatio, complexityIndexSearch]`
- **Difficulty Target $y$**: $y \in \{0, 1, 2\}$ (Easy, Medium, Hard) calculated via train-only percentile cuts $P_{33.3}^{train} = 1.2311, P_{66.7}^{train} = 1.7412$.

---

## 4. Deployment Architecture

- **Runtime**: Static web site (HTML/CSS/JS) deployable on Netlify or GitHub Pages with zero backend server dependencies.
- **Offline ML Pipeline**: Pure ES module JS pipeline (`ml/dataset/runDatasetPipeline.js`) runs locally or in browser DevTools to produce dataset CSVs/JSONs.

