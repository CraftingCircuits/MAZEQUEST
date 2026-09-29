# DEPTH-FIRST SEARCH (DFS) SOLVER EXPLANATION

This document explains the theory, data structures, parent mapping, non-optimal path property, and worked example for the **DFS Maze Solver** in **MazeQuest**.

---

## 1. DFS Algorithm Theory

**Depth-First Search (DFS)** is an unweighted graph search algorithm that explores a search space **as deeply as possible** along each branch before backtracking.

```text
Start
  │
  └──► Deep Branch 1 (Follows path until dead-end)
         │
         ├──► Dead End reached!
         │      │
         │      └──► Backtrack to decision node
         │
         └──► Deep Branch 2 ──► Goal Found!
```

### Core Data Structures
1. **LIFO Stack (`stack`)**: Manages nodes to be expanded (Last-In, First-Out order forces deep traversal down a single path branch).
2. **Visited Set (`visited[r][c]`)**: 2D boolean array tracking expanded cells to prevent infinite loops and cycles.
3. **Parent Map (`parentMap`)**: Key-value map storing `parentMap.set(neighbor, current)` to reconstruct the final path from Goal to Start.

---

## 2. Worked Example on a $4 \times 4$ Grid Maze

Consider the following $4 \times 4$ grid:

```text
S . # .
. . # .
. . . .
# . . G
```

### Matrix Representation
```text
Grid (4 x 4):
Row 0: ['S',  0,  1,  0]
Row 1: [  0,  0,  1,  0]
Row 2: [  0,  0,  0,  0]
Row 3: [  1,  0,  0, 'G']
```
* Start $S = (0, 0)$, Goal $G = (3, 3)$, Wall = $1$, Path = $0$.

### Step-by-Step DFS Execution Trace (LIFO Stack)

| Step | Stack Contents | Popped Node | Visited Action / Pushed Neighbors (Order: Up, Down, Left, Right) | Parent Map Added |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `[(0,0)]` | - | Start at `(0,0)`. Mark `visited[0][0]=true`. | - |
| **1** | `[]` | `(0,0)` | Check neighbors: `(1,0)` [Down], `(0,1)` [Right]. Push `(1,0)` then `(0,1)`. | `(1,0) -> (0,0)`, `(0,1) -> (0,0)` |
| **2** | `[(1,0)]` | `(0,1)` | Check neighbors: `(1,1)` [Down]. Push `(1,1)`. | `(1,1) -> (0,1)` |
| **3** | `[(1,0)]` | `(1,1)` | Check neighbors: `(2,1)` [Down]. Push `(2,1)`. | `(2,1) -> (1,1)` |
| **4** | `[(1,0)]` | `(2,1)` | Check neighbors: `(3,1)` [Down], `(2,0)` [Left], `(2,2)` [Right]. Push `(3,1)`, `(2,0)`, `(2,2)`. | `(3,1)->(2,1)`, `(2,0)->(2,1)`, `(2,2)->(2,1)` |
| **5** | `[(1,0), (3,1), (2,0)]` | `(2,2)` | Check neighbors: `(2,3)` [Right]. Push `(2,3)`. | `(2,3) -> (2,2)` |
| **6** | `[(1,0), (3,1), (2,0)]` | `(2,3)` | Check neighbors: `(3,3)` [Down/Goal!]. Push `(3,3)`. | `(3,3) -> (2,3)` |
| **7** | `[(1,0), (3,1), (2,0), (3,3)]` | `(3,3)` | **Goal Reached!** Terminate search loop. | - |

---

## 3. Path Reconstruction via Parent Map

Starting from Goal `(3,3)` and looking up `parentMap`:

```text
Goal (3,3)
   └──► parentMap.get(3,3) = (2,3)
          └──► parentMap.get(2,3) = (2,2)
                 └──► parentMap.get(2,2) = (2,1)
                        └──► parentMap.get(2,1) = (1,1)
                               └──► parentMap.get(1,1) = (0,1)
                                      └──► parentMap.get(0,1) = (0,0) [Start]
```

Reversed Final Path (Start $\rightarrow$ Goal):
`[(0,0), (0,1), (1,1), (2,1), (2,2), (2,3), (3,3)]`
* Total Path Length = **6 steps**.

---

## 4. Key Distinction: BFS vs. DFS

| Property | Breadth-First Search (BFS) | Depth-First Search (DFS) |
| :--- | :--- | :--- |
| **Data Structure** | FIFO Queue (`shift()` / `push()`) | LIFO Stack (`pop()` / `push()`) |
| **Search Traversal** | Level-by-level (radiates outward) | Deep branch dive (follows corridors to dead ends) |
| **Shortest Path Guarantee**| **Yes** (Guaranteed optimal in unweighted mazes) | **No** (Returns first valid path found) |
| **Memory Usage** | Higher (stores entire level frontier) | Lower (stores active branch depth) |

---

## 5. Complexity Analysis

* **Time Complexity**: $\mathcal{O}(V + E) = \mathcal{O}(N)$ where $N = \text{Height} \times \text{Width}$. In a grid graph ($E \le 4V$), every cell is pushed and popped at most once.
* **Space Complexity**: $\mathcal{O}(V) = \mathcal{O}(N)$ for storing the stack, 2D visited matrix, and parent map.
