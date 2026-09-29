# MazeQuest — ML Feature Extraction & Dataset Generation Documentation (Phase 8B)

## 1. Executive Summary

Phase 8B implements spatial feature extraction, search-benchmark metric calculations, deterministic dataset generation, and target difficulty quantile thresholding for **MazeQuest**.

The pipeline generates $N = 2,000$ synthetic mazes, extracts 5 spatial input features ($X$), extracts 6 target-generation benchmark metrics ($M_{target}$), performs an 80%/20% Train/Test split, computes quantile cut thresholds **exclusively on the Training split** ($P_{33.3}^{train}, P_{66.7}^{train}$), and labels both train and test records into ternary algorithmic/search difficulty classes ($y \in \{0, 1, 2\}$: Easy, Medium, Hard).

---

## 2. Feature Extraction Architecture

```text
Generated Maze (Grid, Start, Goal)
           │
           ├──► Spatial Feature Extractor ──► ML Input Feature Vector X (wallDensity, deadEndRatio, branchingRatio, straightRatio, turnRatio)
           │
           └──► Search Benchmark Metric Calculator (BFS Solver) ──► Target-Generation Metrics M_target ──► Algorithmic Complexity Index CI_search
                                                                                                                   │
                                                                                                                   ▼
                                                                                                80%/20% Train/Test Split
                                                                                                                   │
                                                                                                                   ▼
                                                                                        Train-Only Quantile Cut (P33.3, P66.7)
                                                                                                                   │
                                                                                                                   ▼
                                                                                                    Target Difficulty y ∈ {0, 1, 2}
```

---

## 3. Input / Output of `MazeFeatureExtractor`

### Input Signature
```javascript
MazeFeatureExtractor.extract(grid, startPos, goalPos)
```
- `grid`: 2D array matrix ($R \times C$) where `0` or `'S'` or `'G'` are traversable cells, and `1` represents wall cells.
- `startPos`: `{ r: number, c: number }`
- `goalPos`: `{ r: number, c: number }`

### Output Object Structure
```json
{
  "featuresX": {
    "height": 15,
    "width": 15,
    "totalCells": 225,
    "openCellCount": 97,
    "wallCount": 128,
    "wallDensity": 0.5689,
    "deadEndCount": 5,
    "deadEndRatio": 0.0515,
    "branchingPointCount": 4,
    "branchingPointRatio": 0.0412,
    "straightCorridorCount": 65,
    "straightCorridorRatio": 0.6701,
    "turnCorridorCount": 23,
    "turnCorridorRatio": 0.2371
  },
  "benchmarkM": {
    "shortestPathLength": 42,
    "manhattanDistance": 24,
    "pathDetourFactor": 1.75,
    "searchExpansionRatio": 0.8041,
    "bfsNodesExplored": 78,
    "complexityIndexSearch": 1.2771
  }
}
```

---

## 4. Dataset Field Schema (Exactly 24 Fields)

The dataset preserves strict field separation into five categories across 24 total fields per record:

### 4.1 Metadata (8 Fields)
- `maze_id`: Unique record identifier (`MAZE_00001`)
- `seed`: Deterministic PRNG seed offset
- `height`: Grid row dimension (15, 21, 25)
- `width`: Grid column dimension (15, 21, 25)
- `total_cells`: Total cell count ($R \times C$)
- `open_cell_count`: Total traversable path cells
- `wall_count`: Total obstacle wall cells
- `split`: Train/Test split assignment (`train` or `test`)

### 4.2 Raw Topological Counts (4 Fields)
- `dead_end_count`: Unnormalized count of dead-end cells
- `branching_point_count`: Unnormalized count of branching decision junctions
- `straight_corridor_count`: Unnormalized count of collinear corridor cells
- `turn_corridor_count`: Unnormalized count of 90-degree turn cells

### 4.3 ML Input Features X (5 Fields)
- `wall_density`: Normalized wall density ($\text{wallCount} / \text{totalCells}$)
- `dead_end_ratio`: Normalized dead-end ratio ($\text{deadEndCount} / \text{openCellCount}$)
- `branching_ratio`: Normalized branching ratio ($\text{branchingCount} / \text{openCellCount}$)
- `straight_corridor_ratio`: Normalized straight corridor ratio ($\text{straightCount} / \text{openCellCount}$)
- `turn_corridor_ratio`: Normalized turn corridor ratio ($\text{turnCount} / \text{openCellCount}$)

### 4.4 Target-Generation Metrics (6 Fields)
- `shortest_path_length`: BFS optimal shortest path step count
- `manhattan_dist`: Start-to-Goal L1 distance ($|r_1 - r_2| + |c_1 - c_2|$)
- `path_detour_factor`: Ratio of BFS path length to Manhattan distance ($\ge 1.0$)
- `bfs_nodes_explored`: Total node expansion count during BFS search
- `search_expansion_ratio`: Fraction of open cells explored ($\text{bfsNodesExplored} / \text{openCellCount}$)
- `complexity_index_search`: $CI_{search} = 0.50 \cdot F_{detour} + 0.50 \cdot R_{expansion}$

### 4.5 Target y (1 Field)
- `difficulty`: Discrete algorithmic/search difficulty tier ($0$ = Easy, $1$ = Medium, $2$ = Hard)

---

## 5. Investigation of `wallDensity` Variation

Statistical analysis of the 2,000 generated dataset records shows that `wall_density` exhibits **exactly 3 unique values**:
- **`0.5689`**: All 800 mazes of size $15 \times 15$ ($128 \text{ walls} / 225 \text{ cells}$)
- **`0.5488`**: All 800 mazes of size $21 \times 21$ ($242 \text{ walls} / 441 \text{ cells}$)
- **`0.5408`**: All 400 mazes of size $25 \times 25$ ($338 \text{ walls} / 625 \text{ cells}$)

### Mathematical Root Cause
In standard grid-based Recursive Backtracking on odd dimensions ($R \times C$), the spanning tree theorem guarantees that the exact number of carved passage cells depends **strictly on grid dimensions**:
$$\text{openCellCount} = 2 \left( \frac{R+1}{2} \times \frac{C+1}{2} \right) - 1$$
Because open cell count and wall count are mathematically invariant for a given dimension $(R, C)$ under recursive backtracking, `wall_density` has **zero within-size variation** and acts as a smooth non-linear proxy encoding maze grid scale across different dimensions.

---

## 6. Training-Only Quantile Thresholding & Difficulty Labeling

To eliminate target leakage between training and testing splits:
1. The $N = 2,000$ dataset is split into **80% Training ($1,600$)** and **20% Testing ($400$)** using a deterministic Fisher-Yates shuffle (seed = 42).
2. Quantile thresholds $P_{33.3}^{train}$ and $P_{66.7}^{train}$ are calculated **exclusively from the 1,600 Training records**:
   - $P_{33.3}^{train} = 1.2311$
   - $P_{66.7}^{train} = 1.7412$
3. These fixed thresholds are applied to label **BOTH** Training and Testing records:
   $$y = \begin{cases} 0 \quad (\text{Easy}) & \text{if } CI_{search} \le P_{33.3}^{train} \\ 1 \quad (\text{Medium}) & \text{if } P_{33.3}^{train} < CI_{search} \le P_{66.7}^{train} \\ 2 \quad (\text{Hard}) & \text{if } CI_{search} > P_{66.7}^{train} \end{cases}$$

---

## 7. Dataset Validation & Summary Statistics

### Summary Statistics ($N = 2,000$)

| Feature | Min | Max | Mean | Median | Std | Unique Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `wall_density` | 0.5408 | 0.5689 | 0.5552 | 0.5488 | 0.0115 | 3 |
| `dead_end_ratio` | 0.0206 | 0.1031 | 0.0538 | 0.0523 | 0.0108 | 35 |
| `branching_ratio` | 0.0103 | 0.1031 | 0.0487 | 0.0503 | 0.0106 | 34 |
| `straight_corridor_ratio` | 0.5670 | 0.7835 | 0.6585 | 0.6583 | 0.0275 | 78 |
| `turn_corridor_ratio` | 0.1340 | 0.3196 | 0.2301 | 0.2312 | 0.0272 | 79 |
| `path_detour_factor` | 1.0000 | 5.1818 | 2.4059 | 2.3333 | 0.8225 | 85 |
| `search_expansion_ratio` | 0.1707 | 1.0000 | 0.6399 | 0.6181 | 0.2152 | 236 |
| `complexity_index_search` | 0.5854 | 3.0700 | 1.5229 | 1.4597 | 0.5036 | 967 |

### Class Distribution
- **Total ($2,000$)**: Easy (0): 673 (33.65%), Medium (1): 658 (32.90%), Hard (2): 669 (33.45%)
- **Train ($1,600$)**: Easy (0): 536 (33.50%), Medium (1): 531 (33.19%), Hard (2): 533 (33.31%)
- **Test ($400$)**: Easy (0): 137 (34.25%), Medium (1): 127 (31.75%), Hard (2): 136 (34.00%)

---

## 8. Reproducibility

1. **Mulberry32 PRNG**: `MazeGenerator` uses a 32-bit Mulberry32 PRNG initialized with deterministic seeds (`seedOffset = 10000`).
2. **Fisher-Yates Shuffle**: Dataset splitting uses seed = 42 for 100% reproducible train/test assignment.
3. **Execution Script**:
   ```bash
   node ml/dataset/runDatasetPipeline.js
   ```

---

## 9. Computational Complexity

- **Spatial Feature Extraction**: $O(R \times C) = O(N)$ scan per maze grid.
- **BFS Benchmark Calculation**: $O(V + E)$ where $V = \text{openCellCount}$ and $E \le 4V$.
- **Total Pipeline Complexity**: $O(K \cdot N)$ for $K = 2,000$ mazes. Executed in 0.21 seconds.
