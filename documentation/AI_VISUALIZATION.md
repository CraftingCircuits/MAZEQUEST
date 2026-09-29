# AI SEARCH VISUALIZATION ARCHITECTURE DOCUMENTATION

This document defines the technical architecture, timing decoupling, animation lifecycle, overlay state rendering, and cancellation guards for the **Four-Algorithm AI Search Visualization Layer** (Phase 7B) in **MazeQuest**.

---

## 1. Architectural Principles

### 1.1 Complete Decoupling of Solver & Visualization
The four AI search solvers (**BFS**, **DFS**, **Greedy Best-First**, **A***) are **pure functions** that execute synchronously on grid matrix data. They contain **zero DOM manipulation** and **zero animation delays**.
* **Solver Execution**: Synchronous execution via `performance.now()` measuring pure search loop duration in milliseconds (e.g. 0.28 ms).
* **Visualization Layer**: Asynchronous consumer (`AIVisualizer`) that reads the standardized `SearchResult` object (`visitedNodes` array & `path` array) and animates steps on the Canvas.

---

## 2. Four-Algorithm Visualization Architecture

All four algorithms expose a uniform interface `solve(mazeGrid, startPos, goalPos)` and return a common `SearchResult` structure. A single, shared `AIVisualizer` instance processes results for all algorithms without needing internal knowledge of search heuristics or data structures.

### 2.1 High-Level Data Flow Diagram

```text
Current Maze (Preserved)
          │
          ▼
  Algorithm Selector (BFS / DFS / Best-First / A*)
          │
          ▼
   Selected Solver.solve(mazeGrid, start, goal)
          │
          ▼
   SearchResult (success, path, visitedNodes, nodesExplored, executionTimeMs)
          │
          ▼
  AIVisualizer (cancel previous -> display stats)
          │
          ▼
  Exploration Animation (step-by-step cyan overlay)
          │
          ▼
  Final Path Animation (emerald trail highlight)
          │
          ▼
  Canvas Renderer (HTML5 Canvas Overlay)
```

---

## 3. Key Architectural Components

### 3.1 Algorithm Selection & Invocation Flow
1. User selects algorithm via the UI dropdown control (`#select-algorithm`): `BFS`, `DFS`, `Best-First`, or `A*`.
2. User clicks **Run AI**.
3. `App.runAISolver()` triggers `aiVisualizer.cancel()`, halting any active animation loop.
4. The selected solver is invoked on the **current maze grid** (`this.gameState.mazeGrid`), starting cell (`startPos`), and target cell (`goalPos`).
5. Pure search results (`SearchResult`) are returned in $< 1\text{ms}$.
6. `AIVisualizer.visualize(searchResult)` immediately populates the statistics HUD and initiates asynchronous exploration and path animations.

### 3.2 Preservation of Current Maze & Game State
Running AI visualization **never**:
* Alters maze grid topology or wall structures.
* Re-generates or reshuffles the maze.
* Moves the player avatar or mutates player coordinates `(playerR, playerC)`.
* Changes level progression or resets level move/timer HUD values.

The visualization operates purely as a non-destructive analysis layer drawn over the existing maze canvas.

### 3.3 Statistics Display
The statistics HUD banner displays real-time, empirical data from the returned `SearchResult`:
* **Algorithm**: Name of selected search strategy (`BFS`, `DFS`, `Best-First`, `A*`).
* **Path Found**: `Yes` (Emerald) or `No` (Red).
* **Path Length**: Number of solution path steps (`path.length - 1`).
* **Nodes Explored**: Total count of dequeued/popped state nodes.
* **Execution Time**: Pure search duration in milliseconds (`executionTimeMs`, excluding animation delays).

### 3.4 Animation Lifecycle & Speed Control
* **Phase 1 — Exploration Loop**: Iterates through `searchResult.visitedNodes` sequentially, populating `exploredSet` and triggering `CanvasRenderer.render(gameState, vizState)` at speed delays:
  - `Slow`: 70ms per node
  - `Normal`: 25ms per node
  - `Fast`: 8ms per node
* **Phase 2 — Final Path Loop**: Sequentially animates `searchResult.path` nodes into `pathSet`, rendering vibrant emerald path highlights.

### 3.5 Cancellation & Memory Safety
To prevent stale visual elements when changing algorithms, restarting levels, or moving manually:
* `aiVisualizer.cancel()` clears active `setTimeout` handles.
* Resets `isAnimating = false`.
* Clears `exploredSet` and `pathSet`.
* If player moves via WASD/Arrow keys, `aiVisualizer.cancel()` immediately clears the overlay.

---

## 4. Pure Execution Time vs. Animation Duration

| Metric | Measured By | Included in Execution Time? | Purpose |
| :--- | :--- | :--- | :--- |
| **Solver Execution Time** | `performance.now()` in `solve()` | **YES** (e.g. `0.284 ms`) | Factual benchmark of search algorithm efficiency |
| **Animation Duration** | `setTimeout` loop in `AIVisualizer` | **NO** (Excluded) | Human-friendly visual demonstration of search progression |
