# MazeQuest — Difficulty System & Topology-Aware Generation Architecture

**Phase 8 UX & Maze Generation Improvement**

---

## 1. Executive Summary & Rationale

Prior to this phase, MazeQuest allowed players to jump directly into Level 1 with a default 15×15 grid generated using standard Recursive Backtracking (DFS). While this algorithm guarantees 100% connectivity, it produces a **"perfect maze"** (a spanning tree on the grid graph) containing zero loops and exactly one unique simple path between any two reachable cells. 

This created a major gameplay flaw: mazes often looked "almost solved" at first glance because the player could visually trace the single path from Start to Goal without encountering alternate branches or distractor loops.

To address this, we introduced:
1. **Explicit Pre-Gameplay Difficulty Selection**: A dedicated screen (`HOME -> DIFFICULTY SELECTION -> GAMEPLAY`) featuring a 3-stepped difficulty slider (EASY, MEDIUM, HARD).
2. **Topology-Aware Maze Generation**: Controlled dead-end wall removal (**braid ratio**) to introduce loops, alternate routes, junctions, and misleading distractors.
3. **Persistent Difficulty State**: The user-selected difficulty remains active across level progression (`Level 1 -> Level 2 -> Level 3`).

---

## 2. Difficulty States & Visual Design Tokens

The system defines exactly **three stepped difficulty levels**, aligned with the ML target classification schema (Class 0 = Easy, Class 1 = Medium, Class 2 = Hard):

| Difficulty State | Grid Size | Braid Ratio | Visual Theme Color | Emoji Indicator | Tagline Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EASY** (0) | 15 × 15 | 10% (0.10) | Emerald Green (`#10b981`) | 😊 | Relaxed maze size with open paths and light distractor routes. |
| **MEDIUM** (1) | 21 × 21 | 25% (0.25) | Amber Orange (`#f59e0b`) | 🤔 | Balanced maze size with moderate branching and misleading turns. |
| **HARD** (2) | 25 × 25 | 40% (0.40) | Crimson Red (`#ef4444`) | 😤 | Dense maze size with high branching and complex distractor loops. |

---

## 3. UI Implementation & Dynamic Theme Engine

### Stepped Slider & Micro-Animations
The difficulty selection screen (`#difficulty-shell`) features:
- **Header**: Top bar with a Back button (`#btn-back-home`), title `"CHOOSE YOUR DIFFICULTY"`, and concise instructions.
- **Center Preview Card**: Displays a dynamic circular emoji badge with a subtle pulse micro-animation (`pulse-emoji`), title, description, and grid size indicator.
- **Stepped Slider**: Horizontal range input (min=0, max=2, step=1). Dragging the thumb or clicking step labels triggers smooth **200–300 ms CSS transitions** (`transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease`).
- **Action Controls**: A prominent Play button (`#btn-play-game`) that inherits the active difficulty theme gradient, and a circular help button (`#btn-difficulty-help`).

---

## 4. State Architecture & Level Progression

### GameState Integration
- The active difficulty is stored in `GameState.selectedDifficulty` (`"EASY" | "MEDIUM" | "HARD"`).
- When starting a game, `GameState` receives the generated maze object and updates `selectedDifficulty`.

### Progression Contract (`Difficulty` vs `Level`)
- **Difficulty**: Chosen before gameplay starts and remains fixed throughout the game session.
- **Level**: Represents linear progression within the chosen difficulty (`Hard — Level 1 -> Hard — Level 2 -> Hard — Level 3`).
- Advancing levels (`advanceToNextLevel()`) generates a fresh procedural maze using `MazeGenerator.generateForDifficulty(this.gameState.selectedDifficulty)` while preserving `currentLevel` increments.
- Returning to the difficulty selection screen via the HUD `'Change Mode'` button (`#btn-change-difficulty`) or Victory modal (`#btn-victory-change-diff`) allows resetting or picking a new difficulty.

---

## 5. Topology Enhancement: Controlled Dead-End Braiding

### The Braid Algorithm
To break the single-corridor visual flaw of perfect mazes, `MazeGenerator` applies **controlled dead-end braiding**:

1. **Initial Spanning Tree**: Generate a connected lattice using Recursive Backtracking (DFS).
2. **Dead-End Identification**: Scan the interior grid for path cells (`0`) having exactly 1 open neighbor (excluding Start `'S'` and Goal `'G'`).
3. **Candidate Wall Evaluation**: For each dead-end, identify interior wall neighbors (`1`) that separate the dead-end from another open path cell 2 units away.
4. **Deterministic Braiding**: Using Mulberry32 PRNG `random()`, shuffle candidate dead-ends and carve walls for a fraction specified by `braidRatio`:
   $$\text{Count} = \lfloor N_{\text{dead\_ends}} \times \text{braidRatio} \rfloor$$
5. **Marker Assignment**: Re-assign Start `'S'` at `(1, 1)` and Goal `'G'` at `(height-2, width-2)`.

### Guarantee of Maze Validity
Because wall carving only connects existing valid paths in an already connected graph:
- **Graph Connectivity**: 100% preserved (adding edges to a connected graph never disconnects it).
- **Traversability**: Start and Goal remain fully traversable and connected.
- **Collision Safety**: Outer boundaries (walls) remain strictly intact.
- **Deterministic**: Supplying the same random seed produces 100% reproducible mazes.
- **AI Regression Compatibility**: BFS, DFS, Greedy Best-First, and A* solvers continue to solve the maze without modification.

---

## 6. Distinction: User-Selected Difficulty vs ML-Predicted Difficulty

It is critical to maintain the conceptual boundary between gameplay difficulty generation and machine learning inference:

$$\text{User Selected Difficulty} \xrightarrow{\text{Controls Parameters}} \text{Maze Generator} \xrightarrow{\text{Produces}} \text{Maze Grid}$$

$$\text{Maze Grid} \xrightarrow{\text{Extracts}} 5 \text{ Spatial Features} \xrightarrow{\text{ML Model}} \text{Predicted Difficulty Class}$$

- **User Selected Difficulty**: A procedural **gameplay generation parameter** controlling grid dimensions and braid ratio.
- **ML Predicted Difficulty**: In Phase 8D, the ML classifier will **independently evaluate** the 5 spatial features (`wall_density`, `dead_end_ratio`, `branching_ratio`, `straight_corridor_ratio`, `turn_corridor_ratio`) to predict difficulty without hardcoding or reading `selectedDifficulty`.

---

## 7. Verification & Regression Testing

| Test Domain | Method | Result |
| :--- | :--- | :--- |
| **Home Cleanup** | DOM inspection | Removed academic badge; branding intact. |
| **Difficulty UI** | Browser Subagent | Smooth 200–300ms transitions across Easy, Medium, and Hard. |
| **State Persistence** | App session test | `selectedDifficulty` persists across level completion. |
| **Maze Topology** | Feature Extractor | Verified braid ratio reduces dead-ends and increases branching. |
| **AI Solvers** | 4-Algorithm Benchmark | 100% success rate for BFS, DFS, Best-First, and A*. |
| **BFS vs A* Path Match** | Empirical comparison | 100% path length equality confirmed. |
