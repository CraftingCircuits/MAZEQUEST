# GREEDY BEST-FIRST SEARCH SOLVER EXPLANATION

This document explains the theory, evaluation function, Manhattan distance heuristic, min-priority queue mechanics, non-optimal path property, and worked example for the **Greedy Best-First Search Solver** in **MazeQuest**.

---

## 1. Heuristic Search Theory

### What is a Heuristic Function?
A **Heuristic Function** $h(n)$ is an estimate of the remaining path cost from a given state/cell $n = (r, c)$ to the Goal state $g = (g_r, g_c)$. It acts as a guide to steer search exploration toward the goal.

### Evaluation Function
Greedy Best-First Search expands nodes based purely on their estimated proximity to the goal:
$$f(n) = h(n)$$

> **CRITICAL DISTINCTION**:
> * **Greedy Best-First Search**: $f(n) = h(n)$ *(Purely greedy evaluation based on estimated remaining cost)*.
> * **A\* Search (Phase 6D)**: $f(n) = g(n) + h(n)$ *(Combines actual cost $g(n)$ from Start with estimated cost $h(n)$ to Goal)*.

---

## 2. Why Manhattan Distance?

In MazeQuest, movement is restricted to 4 cardinal directions (Up, Down, Left, Right — no diagonal movement).

### Manhattan Distance Formula
$$h(n) = |r_n - g_r| + |c_n - g_c|$$

### Properties
1. **Geometric Match**: Perfectly counts the minimum number of horizontal and vertical steps required to reach the goal if there were no obstacles.
2. **Obstacle Ignorance**: The heuristic is unaware of walls, so it represents an optimistic estimate, not guaranteed actual path length.

### Numerical Example
Suppose candidate cell $n = (2, 3)$ and Goal $g = (5, 7)$:
$$h(n) = |2 - 5| + |3 - 7| = 3 + 4 = 7 \text{ steps}$$

---

## 3. Min-Priority Queue Mechanics & Deterministic Tie-Breaking

1. **Min-Heap Priority Queue (`PriorityQueue`)**: Stores candidate nodes prioritized by lowest $h(n)$ value.
2. **Deterministic Tie-Breaking**: When two candidate cells have equal heuristic values $h(n_1) = h(n_2)$, the priority queue breaks ties using **insertion order (FIFO)**, guaranteeing 100% reproducible test runs.

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

### Heuristic Values $h(n) = |r - 3| + |c - 3|$ for All Path Cells
* $(0,0) \rightarrow |0-3| + |0-3| = 6$
* $(0,1) \rightarrow |0-3| + |1-3| = 5$
* $(1,0) \rightarrow |1-3| + |0-3| = 5$
* $(1,1) \rightarrow |1-3| + |1-3| = 4$
* $(2,0) \rightarrow |2-3| + |0-3| = 4$
* $(2,1) \rightarrow |2-3| + |1-3| = 3$
* $(2,2) \rightarrow |2-3| + |2-3| = 2$
* $(2,3) \rightarrow |2-3| + |3-3| = 1$
* $(3,3) \rightarrow |3-3| + |3-3| = 0$ [Goal!]

### Step-by-Step Best-First Search Execution Trace

| Step | Priority Queue State | Dequeued Node | Heuristic $h(n)$ | Unvisited Neighbors Pushed (with $h(n)$) |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `[(0,0): h=6]` | - | - | Start at `(0,0)`. |
| **1** | `[]` | `(0,0)` | 6 | `(1,0)` [$h=5$], `(0,1)` [$h=5$]. |
| **2** | `[(0,1): h=5]` | `(1,0)` | 5 | `(1,1)` [$h=4$]. |
| **3** | `[(0,1): h=5]` | `(1,1)` | 4 | `(2,1)` [$h=3$]. |
| **4** | `[(0,1): h=5]` | `(2,1)` | 3 | `(2,2)` [$h=2$], `(3,1)` [$h=3$], `(2,0)` [$h=4$]. |
| **5** | `[(3,1): h=3, (2,0): h=4, (0,1): h=5]` | `(2,2)` | 2 | `(2,3)` [$h=1$]. |
| **6** | `[(3,1): h=3, (2,0): h=4, (0,1): h=5]` | `(2,3)` | 1 | `(3,3)` [$h=0$ Goal!]. |
| **7** | `[...]` | `(3,3)` | 0 | **Goal Reached!** Terminate search. |

---

## 5. Non-Optimal Path Property Proof

Why does Greedy Best-First Search **not** guarantee the shortest path?
* Greedy Best-First Search considers only $h(n)$ (distance to Goal) and ignores $g(n)$ (cost spent from Start).
* If a path heading directly toward the Goal encounters a wall detour, Best-First may follow an expensive detour simply because the cells appear physically closer to Goal.

---

## 6. Complexity Analysis

* **Time Complexity**: $\mathcal{O}(V \log V + E) = \mathcal{O}(N \log N)$ where $N = \text{Height} \times \text{Width}$. Inserting into and popping from the binary heap priority queue takes $\mathcal{O}(\log V)$ per operation.
* **Space Complexity**: $\mathcal{O}(V) = \mathcal{O}(N)$ for storing the priority queue, 2D visited array, and parent map.
