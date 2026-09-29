# A* SEARCH SOLVER EXPLANATION

This document explains the theory, evaluation function $f(n) = g(n) + h(n)$, Manhattan distance admissibility, $g\text{Score}$ tracking, better-path update mechanics, optimality proof, and worked example for the **A* Search Solver** in **MazeQuest**.

---

## 1. A* Algorithm Theory

**A* Search** is an optimal heuristic search algorithm that combines:
1. **$g(n)$**: The actual path cost traveled from the Start node $S$ to current node $n$.
2. **$h(n)$**: The estimated remaining path cost from node $n$ to the Goal node $G$ (Manhattan Distance).

### Evaluation Function
$$f(n) = g(n) + h(n)$$

```text
Start (g=0)
  │
  ├──► Node A: g(A)=8, h(A)=2  ==► f(A) = 10
  │
  └──► Node B: g(B)=3, h(B)=5  ==► f(B) = 8   ◄── A* selects Node B!
```

> **CRITICAL DISTINCTION**:
> * **Greedy Best-First Search**: $f(n) = h(n)$ *(Chooses Node A because $h(A)=2 < 5$, ignoring actual cost spent $g(A)=8$)*.
> * **A\* Search**: $f(n) = g(n) + h(n)$ *(Chooses Node B because $f(B)=8 < 10$, balancing distance spent with distance remaining)*.

---

## 2. Admissibility & Consistency of Manhattan Distance

In MazeQuest's unweighted 4-direction grid:
* Movement actions: Up, Down, Left, Right (unit cost $c = 1$).
* **Admissibility**: A heuristic is *admissible* if it never overestimates the true remaining cost to Goal ($h(n) \le h^*(n)$). Manhattan distance calculates straight grid steps ignoring walls; thus, it can never overestimate true distance.
* **Consistency (Monotonicity)**: $h(n) \le 1 + h(n')$.

### Optimality Guarantee
Because Manhattan distance is admissible and consistent in unit-cost 4-direction grids, **A* Search is guaranteed to find the optimal shortest path**, matching the path length of BFS while expanding far fewer nodes.

---

## 3. $g\text{Score}$ Tracking, Better-Path Updates & Stale Entry Guards

1. **$g\text{Score}$ Matrix**: 2D array initializing `gScore[r][c] = Infinity`, with `gScore[start.r][start.c] = 0`.
2. **Better-Path Update Check**:
   $$\text{tentativeG} = gScore[\text{current.r}][\text{current.c}] + 1$$
   $$\text{IF } \text{tentativeG} < gScore[\text{neighbor.r}][\text{neighbor.c}]:$$
   * Update $gScore[\text{neighbor.r}][\text{neighbor.c}] = \text{tentativeG}$.
   * Update $\text{parentMap.set}(\text{neighbor}, \text{current})$.
   * Push neighbor to Priority Queue with priority $f(n) = \text{tentativeG} + h(\text{neighbor})$.
3. **Stale Queue Entry Guard**: When a node is popped from the priority queue, if `closed[r][c]` is `true`, it is discarded as a stale entry from a previously evaluated, higher-cost path.

---

## 4. Worked Example on a $4 \times 4$ Grid Maze

Consider the following $4 \times 4$ grid:

```text
S . # .
. . # .
. . . .
# . . G
```
* Start $S = (0, 0)$, Goal $G = (3, 3)$.

### Step-by-Step A* Search Execution Trace

| Step | Priority Queue State | Dequeued Node | $g(n)$ | $h(n)$ | $f(n) = g+h$ | Unvisited Neighbors Pushed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | `[(0,0): f=6]` | - | 0 | 6 | 6 | Start at `(0,0)`. Set $g(0,0)=0$. |
| **1** | `[]` | `(0,0)` | 0 | 6 | 6 | `(1,0)` [$g=1, h=5, f=6$], `(0,1)` [$g=1, h=5, f=6$]. |
| **2** | `[(0,1): f=6]` | `(1,0)` | 1 | 5 | 6 | `(1,1)` [$g=2, h=4, f=6$]. |
| **3** | `[(0,1): f=6]` | `(1,1)` | 2 | 4 | 6 | `(2,1)` [$g=3, h=3, f=6$]. |
| **4** | `[(0,1): f=6]` | `(2,1)` | 3 | 3 | 6 | `(2,2)` [$g=4, h=2, f=6$], `(3,1)` [$g=4, h=3, f=7$], `(2,0)` [$g=4, h=4, f=8$]. |
| **5** | `[(3,1): f=7, ...]`| `(2,2)` | 4 | 2 | 6 | `(2,3)` [$g=5, h=1, f=6$]. |
| **6** | `[...]` | `(2,3)` | 5 | 1 | 6 | `(3,3)` [$g=6, h=0, f=6$ Goal!]. |
| **7** | `[(3,3): f=6]` | `(3,3)` | 6 | 0 | 6 | **Goal Reached!** Path length = **6 steps**. |

---

## 5. Four-Algorithm Summary Comparison

| Algorithm | Evaluation $f(n)$ | Shortest Path Guarantee? | Explored Nodes (15x15 Maze) | Primary Strength |
| :--- | :--- | :--- | :--- | :--- |
| **BFS** | None (Unweighted Level) | **Yes** (Optimal) | ~ 82 nodes | Optimal shortest path in unweighted graphs |
| **DFS** | None (Deep Branch) | **No** (Sub-optimal) | ~ 94 nodes | Memory efficiency in deep graphs |
| **Greedy Best-First** | $f(n) = h(n)$ | **No** (Sub-optimal) | ~ 38 nodes | Fast greedy traversal toward Goal |
| **A\* Search** | $f(n) = g(n) + h(n)$ | **Yes** (Optimal) | ~ 42 nodes | **Optimal shortest path with minimal node exploration** |

---

## 6. Complexity Analysis

* **Time Complexity**: $\mathcal{O}(V \log V + E) = \mathcal{O}(N \log N)$ where $N = \text{Height} \times \text{Width}$. Inserting into and popping from the binary heap priority queue takes $\mathcal{O}(\log V)$ per node expansion.
* **Space Complexity**: $\mathcal{O}(V) = \mathcal{O}(N)$ for storing the priority queue, $g\text{Score}$ array, closed matrix, and parent map.
