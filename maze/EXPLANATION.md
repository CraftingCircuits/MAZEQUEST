# MAZE SYSTEM & PROCEDURAL GENERATOR EXPLANATION

This document explains the technical representation, movement engine, and procedural maze-generation algorithm used in **MazeQuest**.

---

## 1. 2D Grid Matrix Data Representation

The maze is represented as a **2D Array / Grid Matrix** of dimensions $H \times W$ (Height $\times$ Width).

### Cell Encoding Legend

```text
 1  -> Wall Cell (Impassable obstacle)
 0  -> Walkable Path Cell
'S' -> Start Cell (Player initial position, default (1, 1))
'G' -> Goal Cell (Target destination position, default (H-2, W-2))
```

---

## 2. Procedural Maze Generation Algorithm

MazeQuest uses **Recursive Backtracking (DFS-based Maze Generation)** to generate procedural mazes dynamically.

### CRITICAL DISTINCTION: Generation vs. Search

| Concept | Purpose | Mechanism |
| :--- | :--- | :--- |
| **DFS Maze Generation** | **Carves a new maze** from a grid of walls. | Picks unvisited cells 2 units away, carves intervening walls, and uses a stack to backtrack when hitting dead ends. |
| **DFS Search (Solving)** | **Finds a route** through an *existing* maze. | Explores walkable path cells deeply toward the goal using a search stack until goal is reached. |

---

## 3. Recursive Backtracking Step-by-Step

```text
1. Initialize H x W Grid with all Walls (1).
2. Set Start Cell at (1, 1) -> Mark as Path (0) -> Push to Stack.
3. WHILE Stack is not empty:
     a. Current Cell = Stack.top()
     b. Find unvisited neighbors 2 units away (N, S, E, W).
     c. IF unvisited neighbors exist:
          i.   Pick a RANDOM neighbor.
          ii.  Carve wall BETWEEN Current Cell and Chosen Neighbor.
          iii. Mark Chosen Neighbor as Path (0).
          iv.  Push Chosen Neighbor to Stack.
     d. ELSE:
          i. Pop Stack (Backtrack to previous decision point).
4. Assign Start ('S') at (1, 1) and Goal ('G') at (H-2, W-2).
```

---

## 4. Connectivity & Perfect Maze Guarantee

### Mathematical Guarantee of Solvability
Recursive Backtracking generates a **"Perfect Maze"** (a spanning tree of the grid graph):
* Every walkable path cell is connected to every other path cell.
* There are **zero isolated loops or inaccessible islands**.
* There is **exactly one unique simple path** between the Start cell `'S'` `(1,1)` and Goal cell `'G'` `(H-2, W-2)`.
* Therefore, **every generated maze is 100% guaranteed to be solvable**.

---

## 5. Complexity Analysis

* **Time Complexity**: $\mathcal{O}(V + E) = \mathcal{O}(N)$ where $N = H \times W$. Every cell is pushed and popped from the stack at most once.
* **Space Complexity**: $\mathcal{O}(N)$ for storing the recursion stack and grid matrix.

---

## 6. Movement & Wall Collision Architecture

```text
Keyboard Event (WASD / Arrow Keys)
               │
               ▼
Calculate Target Position:
   targetRow = playerRow + dr
   targetCol = playerCol + dc
               │
               ▼
   Valid Movement Checks:
   1. Is 0 <= targetRow < Height?
   2. Is 0 <= targetCol < Width?
   3. Is grid[targetRow][targetCol] != 1 (Not a Wall)?
               │
      ┌────────┴────────┐
      ▼                 ▼
   [VALID]           [INVALID]
      │                 │
  Update Position    Reject Move
  Increment Moves    (No state change)
  Check Goal
      │
      ▼
  Re-render Canvas
```
