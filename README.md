# MAZEQUEST

> **Find the path. Outsmart the maze.**

MazeQuest is an interactive web-based maze adventure game that combines **Artificial Intelligence search algorithms** with a **Machine Learning difficulty-prediction pipeline**.

The project demonstrates how a maze can be represented as a state-space problem, solved using multiple search strategies, visualized interactively, and analyzed using machine learning.

## Live Demo

**[Play MazeQuest](https://craftingcircuits.github.io/MAZEQUEST/)**

## Project Highlights

* Interactive maze gameplay with keyboard controls
* Procedurally generated mazes
* Three selectable difficulty modes: Easy, Medium, Hard
* Four AI search algorithms:

  * Breadth-First Search (BFS)
  * Depth-First Search (DFS)
  * Greedy Best-First Search
  * A* Search
* Step-by-step AI search visualization
* Factual comparison of all four search algorithms
* Machine Learning-based maze difficulty prediction
* Decision Tree, KNN, and Logistic Regression models
* Automated tests for major AI and ML components
* Responsive web interface
* Static deployment using GitHub Pages

---

## Main Features

### Interactive Maze Gameplay

The player navigates a procedurally generated maze using keyboard controls.

The game tracks:

* Current level
* Player position
* Number of moves
* Timer
* Start and goal positions
* Selected difficulty

The player can progress through multiple levels while keeping the selected difficulty mode active.

### Procedural Maze Generation

Maze generation uses a **Recursive Backtracking** approach with seeded randomization.

The generator also supports controlled dead-end braiding to introduce additional routes and distractor paths, making the maze less visually obvious and more suitable for AI search experiments.

The maze generator is separated from the rendering and gameplay systems so that the maze data remains the source of truth.

### Difficulty System

MazeQuest provides three selectable difficulty modes:

| Difficulty | Grid Size | Braid Ratio | Purpose                                               |
| ---------- | --------: | ----------: | ----------------------------------------------------- |
| Easy       |   15 × 15 |         10% | Smaller maze with fewer distractor routes             |
| Medium     |   21 × 21 |         25% | Moderate maze complexity                              |
| Hard       |   25 × 25 |         40% | Larger maze with more branching and distractor routes |

Difficulty is selected before gameplay and remains active while progressing through levels.

The selected difficulty controls maze-generation conditions. It is separate from the Machine Learning model's predicted difficulty.

---

# Artificial Intelligence

MazeQuest treats the maze as a **state-space search problem**.

Each traversable maze cell represents a state, and movement between neighboring cells represents an action.

The project implements four search algorithms.

### Breadth-First Search — BFS

BFS explores the maze level by level using a queue.

For an unweighted maze, BFS guarantees a shortest path when a path exists.

### Depth-First Search — DFS

DFS explores one branch deeply before backtracking.

It can find a valid path but does not guarantee a shortest path.

### Greedy Best-First Search

Greedy Best-First Search selects states using a heuristic:

`f(n) = h(n)`

MazeQuest uses Manhattan distance as the heuristic:

`h(n) = |row - goalRow| + |column - goalColumn|`

The algorithm prioritizes states that appear closer to the goal but does not guarantee a shortest path.

### A* Search

A* combines the cost already travelled with the heuristic estimate:

`f(n) = g(n) + h(n)`

where:

* `g(n)` = cost from the start state to the current state
* `h(n)` = estimated cost from the current state to the goal

With the Manhattan-distance heuristic used for the maze, A* can find an optimal shortest path in the unweighted grid setting used by MazeQuest.

---

## AI Visualization

The AI search system separates:

**Search computation → Search result → Visualization**

The solvers perform the search independently of the user interface.

The visualization layer then displays:

* Nodes explored
* Search progression
* Final path
* Path length
* Execution time
* Algorithm used

The interface provides adjustable visualization speeds:

* Slow
* Normal
* Fast

Search execution time is measured separately from the visualization animation.

---

## AI Algorithm Comparison

MazeQuest can execute all four algorithms on the same maze and present their results together.

The comparison includes factual measurements such as:

* Success/failure
* Path length
* Nodes explored
* Execution time
* Path validity

The comparison system does not assign subjective rankings to the algorithms. It allows their measured behavior to be observed under the same maze conditions.

---

# Machine Learning

MazeQuest also contains a supervised Machine Learning pipeline for predicting maze difficulty.

## ML Problem

The ML task is formulated as a **three-class classification problem**:

| Class | Difficulty |
| ----: | ---------- |
|     0 | Easy       |
|     1 | Medium     |
|     2 | Hard       |

The model uses five spatial/topological maze features:

* `wall_density`
* `dead_end_ratio`
* `branching_ratio`
* `straight_corridor_ratio`
* `turn_corridor_ratio`

Target-generation metrics are kept separate from the model input features to avoid direct target leakage.

## Dataset

The project generated a synthetic dataset containing:

**2,000 mazes**

with multiple maze dimensions and reproducible seeded generation.

The dataset contains:

* Maze metadata
* Topological counts
* Five ML input features
* Search-based target-generation metrics
* Difficulty labels

The dataset was split into:

* **1,600 training records**
* **400 test records**

Training-derived thresholds were used for difficulty labeling without using the test set to determine those thresholds.

---

## ML Models

Three classification algorithms were evaluated:

### Decision Tree

A tree-based classifier that learns feature-based decision boundaries.

### K-Nearest Neighbors

A distance-based classifier.

K was investigated using cross-validation, with the selected configuration using:

`K = 7`

### Logistic Regression

A linear classification model using standardized input features.

For KNN and Logistic Regression, preprocessing is implemented using scikit-learn pipelines.

---

## Model Evaluation

The models were evaluated using:

* Accuracy
* Precision
* Recall
* F1-score
* Macro F1
* Weighted F1
* Confusion matrices
* Stratified 5-fold cross-validation

The finalized test results were:

| Model               | Test Accuracy | Weighted F1 | Macro F1 |
| ------------------- | ------------: | ----------: | -------: |
| Decision Tree       |        36.50% |      0.3594 |   0.3596 |
| KNN (K=7)           |        36.75% |      0.3677 |   0.3674 |
| Logistic Regression |        45.00% |      0.4304 |   0.4268 |

These results are reported as experimental measurements from the generated dataset and are not intended to represent human-perceived maze difficulty.

---

# ML Integration

The trained ML models are integrated into the MazeQuest architecture for inference.

The inference pipeline uses only the five spatial features:

```text
Generated Maze
      ↓
Feature Extraction
      ↓
5 Spatial Features
      ↓
ML Model
      ↓
Predicted Difficulty
```

The following search-derived metrics are **not used as inference inputs**:

* Shortest path length
* Manhattan distance
* Path detour factor
* BFS nodes explored
* Search expansion ratio
* Complexity index

This keeps the inference feature set separated from the metrics used during target generation.

---

# Technology Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* ES6 Modules
* HTML5 Canvas

### Artificial Intelligence

* BFS
* DFS
* Greedy Best-First Search
* A* Search
* Manhattan-distance heuristic
* Priority queue / min-heap
* Search visualization

### Machine Learning

* Python
* NumPy
* Pandas
* Scikit-learn
* Matplotlib
* Joblib

### Development & Deployment

* Git
* GitHub
* GitHub Pages

---

# Public Project Structure

The public repository contains the application source code and project files required to run and understand MazeQuest.

```text
MazeQuest/
│
├── index.html
├── README.md
│
├── data/
│   └── ml/
│       ├── dataset.csv
│       └── dataset.json
│
├── ml/
│   ├── README.md
│   ├── features/
│   ├── dataset/
│   ├── training/
│   ├── evaluation/
│   └── models/
│
├── frontend/
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── config.js
│       ├── app.js
│       ├── main.js
│       └── engine/
│           ├── game_state.js
│           ├── renderer.js
│           └── input_handler.js
│
├── maze/
│   ├── maze_generator.js
│   ├── feature_extractor.js
│   └── EXPLANATION.md
│
├── ai/
│   ├── common/
│   ├── visualization/
│   ├── comparison/
│   ├── bfs/
│   ├── dfs/
│   ├── best_first/
│   └── astar/
│
└── documentation/
    ├── SYSTEM_ARCHITECTURE.md
    ├── DIFFICULTY_SYSTEM.md
    ├── LEVEL_SYSTEM.md
    └── CHANGELOG.md
```

The detailed academic reports, viva preparation, extensive AI/ML reference material, workflow map, and Antigravity development history are maintained separately from the public project repository.

---

# How to Run Locally

MazeQuest is a client-side web application and should be served through a local HTTP server.

### Using Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Using VS Code

The project can also be launched using the VS Code Live Server extension.

---

# Running the ML Pipeline

The ML training pipeline can be executed using Python from the project root.

```bash
python -m ml.training.pipeline_runner
```

ML pipeline tests can be run using:

```bash
python -m unittest ml/training/test_ml_pipeline.py
```

---

# Project Purpose

MazeQuest was developed as an academic project to demonstrate the practical integration of:

**Game Development + Artificial Intelligence + Machine Learning**

The project connects theoretical concepts with an interactive application:

```text
Maze Representation
       ↓
State-Space Search
       ↓
AI Algorithms
       ↓
Visualization & Comparison
       ↓
Maze Feature Extraction
       ↓
Dataset Generation
       ↓
Machine Learning
       ↓
Difficulty Prediction
       ↓
Interactive Application
```

---

# Future Scope

Possible future improvements include:

* More advanced adaptive difficulty
* Additional maze-generation algorithms
* Additional AI search strategies
* Larger and more diverse ML datasets
* Player-performance-based difficulty adaptation
* Additional maze topologies
* Improved model generalization with richer training data
* More advanced browser-side ML inference

---

## Author

**Niyati Panchal**

Electronics & Communication Engineering
Lalbhai Dalpatbhai College of Engineering (LDCE)

---

## License

This project is developed for academic and educational purposes.
