# AI ALGORITHM COMPARISON ARCHITECTURE DOCUMENTATION

This document defines the technical design, data flow, validation suite, and non-destructive benchmarking principles for the **Four-Algorithm AI Comparison System** (Phase 7C) in **MazeQuest**.

---

## 1. Purpose & Overview

The **AI Algorithm Comparison System** enables empirical benchmarking of state-space search strategies on an identical maze grid instance. Rather than ranking algorithms or declaring subjective "winners", the comparison engine executes all four core solvers (**BFS**, **DFS**, **Greedy Best-First**, **A***) synchronously, collects factual performance metrics, validates path continuity, and presents raw measured data in a clean comparison table and visual bar charts.

---

## 2. High-Level Data Flow Diagram

```text
               Current Maze (Preserved Grid Topology)
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼                        ▼
     BFS.solve()              DFS.solve()             BestFirst.solve()         AStar.solve()
         │                        │                        │                        │
         ▼                        ▼                        ▼                        ▼
   SearchResult             SearchResult             SearchResult             SearchResult
         │                        │                        │                        │
         └────────────────────────┴──────────┬─────────────┴────────────────────────┘
                                             │
                                             ▼
                             AIComparator.compareAll()
                                             │
                                 ┌───────────┴───────────┐
                                 ▼                       ▼
                        Path Validation Suite   A* vs BFS Equality Check
                                 │                       │
                                 └───────────┬───────────┘
                                             │
                                             ▼
                             Comparison Results Dataset
                                             │
                                 ┌───────────┴───────────┐
                                 ▼                       ▼
                          Comparison Table       Proportional Bar Charts
```

---

## 3. Same-Maze Guarantee & Input Integrity

To ensure empirical validity, all four search solvers receive **strictly identical input references**:
- **Grid Matrix**: `mazeGrid` (2D matrix of 0s for walkable paths and 1s for walls).
- **Start Coordinates**: `startPos` `{r, c}` (Player start cell).
- **Goal Coordinates**: `goalPos` `{r, c}` (Level destination cell).

### Non-Destructive Analysis Rules
Executing a comparison **never**:
1. Generates a new maze or alters wall structures.
2. Changes start or goal position.
3. Mutates player coordinates `(playerR, playerC)`.
4. Increments move counts or alters game level timer.
5. Advances or resets level progression.

---

## 4. Collected Empirical Metrics

Every solver returns a standardized `SearchResult` containing:

| Metric | Property | Description |
| :--- | :--- | :--- |
| **Algorithm Name** | `result.algorithm` | Identified search algorithm (`BFS`, `DFS`, `Best-First`, `A*`). |
| **Path Found** | `result.success` | Boolean status indicating whether a valid path from Start to Goal was discovered. |
| **Path Length** | `result.pathLength` | Total step count from Start to Goal (`path.length - 1`). Displayed as `—` if no solution exists. |
| **Nodes Explored** | `result.nodesExplored` | Total number of expanded state nodes popped from queue/stack during search. |
| **Execution Time** | `result.executionTimeMs` | Pure computational runtime measured via `performance.now()` in milliseconds (excluding UI delays). |

---

## 5. Automated Path Validation Suite

Before displaying comparison results, `AIComparator.validateResults()` executes structural integrity checks:

1. **Endpoint Alignment Check**: `path[0] === startPos` and `path[path.length - 1] === goalPos`.
2. **Orthogonal Neighbor Continuity**: Every consecutive step `path[i-1]` and `path[i]` must satisfy $|r_1 - r_2| + |c_1 - c_2| = 1$.
3. **Wall Collision Avoidance**: No coordinate in `path` may reside on a wall cell (`grid[r][c] === 1`).
4. **A* vs BFS Shortest-Path Check**: On unweighted 4-direction grids with admissible heuristics, A* and BFS must yield equal path lengths (`A*.pathLength === BFS.pathLength`). Discrepancies trigger a prominent validation warning notice in the UI.

---

## 6. Important Conceptual Distinctions

When interpreting comparison metrics:
- **Path Length**: Measures **solution quality** (shortest distance in unweighted graphs).
- **Nodes Explored**: Measures **search space activity** (algorithm pruning efficiency).
- **Execution Time**: Measures **observed CPU runtime** in milliseconds under current browser execution context.

> [!IMPORTANT]
> **No Universal Ranking**: None of these metrics individually or combined represent an overall "score" or universal ranking. A heuristic search like Greedy Best-First may explore fewer nodes than BFS but return a longer path; BFS guarantees shortest path length but expands more nodes; A* achieves optimal path length while expanding fewer nodes than unguided BFS.

---

## 7. Edge-Case Behavior

- **Unsolvable Mazes**: All solvers complete search exploration naturally, report `success: false`, display `Path Found: No`, `Path Length: —`, and record actual nodes explored and execution time.
- **Start Equals Goal**: All solvers complete in $<0.01\text{ms}$, returning `success: true`, `pathLength: 0`, and `nodesExplored: 1`.
