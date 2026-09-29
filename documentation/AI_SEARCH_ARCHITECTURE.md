# AI SEARCH ARCHITECTURE DOCUMENTATION

This document defines the formal state-space problem formulation, common solver interface, data structures, and architectural principles for AI maze-solving algorithms in **MazeQuest**.

---

## 1. Formal State-Space Problem Formulation

In MazeQuest, maze solving is modeled as an **Unweighted Graph State-Space Search Problem**.

### 1.1 State Representation
A **State** represents a unique spatial location of the agent/searcher in the maze grid:
$$\text{State } s = (r, c)$$
where $0 \le r < \text{Height}$ and $0 \le c < \text{Width}$.

### 1.2 Initial State
The starting position of the maze:
$$s_0 = (s_r, s_c) \quad (\text{typically } (1, 1))$$

### 1.3 Goal State
The destination coordinates of the maze:
$$s_g = (g_r, g_c) \quad (\text{typically } (H-2, W-2))$$

### 1.4 Actions
The set of valid movement actions $\mathcal{A}(s)$ from state $s = (r, c)$:
$$\mathcal{A}(s) = \{ \text{Up } (-1, 0), \text{Down } (+1, 0), \text{Left } (0, -1), \text{Right } (0, +1) \}$$
An action $a \in \mathcal{A}(s)$ is **valid** if and only if:
1. $0 \le r + dr < \text{Height}$
2. $0 \le c + dc < \text{Width}$
3. $\text{mazeGrid}[r+dr][c+dc] \neq 1$ (Target cell is not a wall)

### 1.5 Transition Model
The transition function $T(s, a)$ returns the resulting successor state $s'$:
$$T((r, c), (dr, dc)) = (r + dr, c + dc)$$

---

## 2. Common AI Solver Architecture

```text
                               ┌───────────────────────────────────────────┐
                               │                MAZE DATA                  │
                               └─────────────────────┬─────────────────────┘
                                                     │
                                                     ▼
                               ┌───────────────────────────────────────────┐
                               │          COMMON SOLVER INTERFACE          │
                               │  SearchAlgorithm.solve(grid, S, G)        │
                               └─────────────────────┬─────────────────────┘
                                                     │
         ┌───────────────────┬───────────────────────┴───────────────────────┬───────────────────┐
         ▼                   ▼                                               ▼                   ▼
┌──────────────────┐┌──────────────────┐                           ┌──────────────────┐┌──────────────────┐
│  BFS MAZE SOLVER ││  DFS MAZE SOLVER │                           │ BEST-FIRST SOLVER││  A* SEARCH SOLVER│
│ (ai/bfs/bfs.js)  ││ (ai/dfs/dfs.js)  │                           │(best_first.js)   ││ (ai/astar/astar.js│
│- FIFO Queue      ││- LIFO Stack      │                           │- Min Priority Q  ││- Min Priority Q  │
│- Level-by-level  ││- Deep Branch     │                           │- f(n) = h(n)     ││- f(n) = g(n)+h(n)│
│- Shortest Path   ││- Valid Path      │                           │- Manhattan Dist  ││- Optimal Shortest│
└────────┬─────────┘└────────┬─────────┘                           └────────┬─────────┘└────────┬─────────┘
         │                   │                                              │                   │
         └───────────────────┴───────────────────────┬──────────────────────┴───────────────────┘
                                                     │
                                                     ▼
                               ┌───────────────────────────────────────────┐
                               │            SearchResult Object            │
                               │  { algorithm, success, path,              │
                               │    visitedNodes, nodesExplored,           │
                               │    pathLength, executionTimeMs }          │
                               └───────────────────────────────────────────┘
```

---

## 3. Four-Solver Comparison Matrix

| Algorithm | File Path | Frontier Structure | Evaluation Function | Path Guarantee | Primary Strength |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Breadth-First Search (BFS)** | `ai/bfs/bfs.js` | FIFO Queue | Unweighted Level | **Optimal Shortest Path** | Guarantees minimum steps in unweighted mazes |
| **Depth-First Search (DFS)** | `ai/dfs/dfs.js` | LIFO Stack | Deep Branch | Valid Path (Sub-optimal) | Low memory footprint in deep maze graphs |
| **Greedy Best-First Search** | `ai/best_first/best_first.js` | Min Priority Queue | $f(n) = h(n)$ | Valid Path (Sub-optimal) | Fast greedy search toward Goal |
| **A\* Search** | `ai/astar/astar.js` | Min Priority Queue | $f(n) = g(n) + h(n)$ | **Optimal Shortest Path** | **Optimal shortest path with minimal node exploration** |
