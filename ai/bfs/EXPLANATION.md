# BREADTH-FIRST SEARCH (BFS) SOLVER EXPLANATION

This document explains the theory, data structures, parent mapping, shortest path guarantee, and worked example for the **BFS Maze Solver** in **MazeQuest**.

---

## 1. BFS Algorithm Theory

**Breadth-First Search (BFS)** is an unweighted graph search algorithm that explores a state-space **level by level** (in order of increasing distance from the Start node).

```text
Start (Distance 0)
  │
  ├─► All cells 1 step away (Distance 1)
  │     │
  │     └─► All cells 2 steps away (Distance 2)
  │           │
  │           └─► All cells 3 steps away (Distance 3) ──► Goal Found!
```

### Core Data Structures
1. **FIFO Queue (`queue`)**: Manages nodes waiting to be expanded (First-In, First-Out order ensures level-by-level exploration).
2. **Visited Set (`visited[r][c]`)**: 2D boolean array tracking expanded cells to prevent infinite loops and redundant exploration.
3. **Parent Map (`parentMap`)**: Key-value map storing `parentMap.set(neighbor, current)` to reconstruct the final path from Goal to Start.

---

## 2. Worked Example on a $4 \times 4$ Grid Maze

Consider the following $4 \times 4$ grid:

```text
S . # .
. . # .
# . . .
. . . G
```

### Matrix Representation
```text
Grid (4 x 4):
Row 0: ['S',  0,  1,  0]
Row 1: [  0,  0,  1,  0]
Row 2: [  1,  0,  0,  0]
Row 3: [  0,  0,  0, 'G']
```
* Start $S = (0, 0)$, Goal $G = (3, 3)$, Wall = $1$, Path = $0$.

### Step-by-Step BFS Execution Trace

| Step | Queue Contents | Dequeued Node | Visited Action / Enqueued Neighbors | Parent Map Added |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `[(0,0)]` | - | Start at `(0,0)`. Mark `visited[0][0]=true`. | - |
| **1** | `[]` | `(0,0)` | Check neighbors: `(1,0)` [Path], `(0,1)` [Path]. `(0,-1)` & `(-1,0)` out of bounds. Enqueue `(1,0)` and `(0,1)`. | `(1,0) -> (0,0)`, `(0,1) -> (0,0)` |
| **2** | `[(0,1)]` | `(1,0)` | Check neighbors: `(2,0)` [Wall-skip], `(1,1)` [Path]. Enqueue `(1,1)`. | `(1,1) -> (1,0)` |
| **3** | `[(1,1)]` | `(0,1)` | Check neighbors: `(0,2)` [Wall-skip], `(1,1)` [Already visited-skip]. | - |
| **4** | `[]` | `(1,1)` | Check neighbors: `(2,1)` [Path]. Enqueue `(2,1)`. | `(2,1) -> (1,1)` |
| **5** | `[]` | `(2,1)` | Check neighbors: `(3,1)` [Path], `(2,2)` [Path]. Enqueue `(3,1)` & `(2,2)`. | `(3,1) -> (2,1)`, `(2,2) -> (2,1)` |
| **6** | `[(2,2)]` | `(3,1)` | Check neighbors: `(3,0)` [Path], `(3,2)` [Path]. Enqueue `(3,0)` & `(3,2)`. | `(3,0) -> (3,1)`, `(3,2) -> (3,1)` |
| **7** | `[(3,0), (3,2)]` | `(2,2)` | Check neighbors: `(2,3)` [Path]. Enqueue `(2,3)`. | `(2,3) -> (2,2)` |
| **8** | `[(3,2), (2,3)]` | `(3,0)` | No new unvisited path neighbors. | - |
| **9** | `[(2,3)]` | `(3,2)` | Check neighbors: `(3,3)` [Goal!]. Enqueue `(3,3)`. | `(3,3) -> (3,2)` |
| **10**| `[(3,3)]` | `(3,3)` | **Goal Reached!** Terminate search loop. | - |

---

## 3. Path Reconstruction via Parent Map

Starting from Goal `(3,3)` and looking up `parentMap`:

```text
Goal (3,3)
   └──► parentMap.get(3,3) = (3,2)
          └──► parentMap.get(3,2) = (3,1)
                 └──► parentMap.get(3,1) = (2,1)
                        └──► parentMap.get(2,1) = (1,1)
                               └──► parentMap.get(1,1) = (1,0)
                                      └──► parentMap.get(1,0) = (0,0) [Start]
```

Reconstructed Array (Goal $\rightarrow$ Start):
`[(3,3), (3,2), (3,1), (2,1), (1,1), (1,0), (0,0)]`

Reversed Final Path (Start $\rightarrow$ Goal):
`[(0,0), (1,0), (1,1), (2,1), (3,1), (3,2), (3,3)]`
* Total Path Length = **6 steps**.

---

## 4. Shortest Path Property Proof

Why is BFS guaranteed to find the shortest path in MazeQuest?
1. **Equal Edge Costs**: Every valid grid step has cost $c=1$.
2. **Monotonic Expansion**: A FIFO queue processes nodes strictly in non-decreasing order of distance from Start.
3. **Optimality**: When Goal node $G$ is dequeued for the first time, its path distance $d(G)$ must be the minimum possible number of moves from $S$.

---

## 5. Complexity Analysis

* **Time Complexity**: $\mathcal{O}(V + E) = \mathcal{O}(N)$ where $N = \text{Height} \times \text{Width}$. In a grid graph, each node has at most 4 edges ($E \le 4V$). Every cell is enqueued and dequeued at most once.
* **Space Complexity**: $\mathcal{O}(V) = \mathcal{O}(N)$ for storing the queue, 2D visited array, and parent map.
