/**
 * MazeQuest — Reusable Maze Feature & Benchmark Extractor
 * ML Module — Phase 8B Implementation
 * 
 * Enforces strict conceptual separation between:
 * 1. Spatial Model Input Features (X): Pure spatial & topological grid properties.
 * 2. Search Benchmark Metrics (M_target): Used ONLY for ground-truth difficulty (y) target label calculation.
 */

import { BFSSolver } from '../../ai/bfs/bfs.js';

export class MazeFeatureExtractor {
  /**
   * Extracts spatial features (X) and search benchmark metrics (M_target) from a 2D maze grid.
   * 
   * @param {Array<Array<number|string>>} mazeGrid - 2D matrix
   * @param {{r: number, c: number}} startPos - Start coordinates
   * @param {{r: number, c: number}} goalPos - Goal coordinates
   * @returns {{ featuresX: Object, benchmarkM: Object }} Extracted spatial features and benchmark metrics
   */
  static extract(mazeGrid, startPos, goalPos) {
    if (!mazeGrid || mazeGrid.length === 0) {
      return null;
    }

    const height = mazeGrid.length;
    const width = mazeGrid[0].length;
    const totalCells = height * width;

    let wallCount = 0;
    let openCellCount = 0;
    let deadEndCount = 0;
    let branchingPointCount = 0;
    let straightCorridorCount = 0;
    let turnCorridorCount = 0;

    // 1. Grid Scan for Cell Types & Spatial Topology
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const val = mazeGrid[r][c];

        if (val === 1) {
          wallCount++;
        } else {
          openCellCount++;

          const neighbors = this.getTraversableNeighborDirections(r, c, mazeGrid, height, width);
          const nNeighbors = neighbors.length;

          const isStartOrGoal = (r === startPos.r && c === startPos.c) || (r === goalPos.r && c === goalPos.c);

          // Dead End: Exactly 1 open neighbor (excluding Start & Goal to avoid endpoint spawn skew)
          if (!isStartOrGoal && nNeighbors === 1) {
            deadEndCount++;
          }
          // Branching Point: 3 or 4 open neighbors
          else if (nNeighbors >= 3) {
            branchingPointCount++;
          }
          // Corridor: Exactly 2 open neighbors
          else if (nNeighbors === 2) {
            const [n1, n2] = neighbors;
            // Straight corridor: opposite directions (North-South or East-West)
            if ((n1.r === -n2.r && n1.c === 0) || (n1.c === -n2.c && n1.r === 0)) {
              straightCorridorCount++;
            } else {
              // Turn corridor: orthogonal directions (e.g. North-East)
              turnCorridorCount++;
            }
          }
        }
      }
    }

    const wallDensity = Number((wallCount / totalCells).toFixed(4));
    const deadEndRatio = Number((deadEndCount / Math.max(1, openCellCount)).toFixed(4));
    const branchingPointRatio = Number((branchingPointCount / Math.max(1, openCellCount)).toFixed(4));
    const straightCorridorRatio = Number((straightCorridorCount / Math.max(1, openCellCount)).toFixed(4));
    const turnCorridorRatio = Number((turnCorridorCount / Math.max(1, openCellCount)).toFixed(4));

    // 2. Search Complexity Metrics (Target Benchmark M_target — EXCLUDED from ML Model Input Vector X)
    const bfsResult = BFSSolver.solve(mazeGrid, startPos, goalPos);

    const shortestPathLength = bfsResult.success ? bfsResult.pathLength : 0;
    const manhattanDistance = Math.abs(startPos.r - goalPos.r) + Math.abs(startPos.c - goalPos.c);
    const pathDetourFactor = manhattanDistance > 0 ? Number((shortestPathLength / manhattanDistance).toFixed(4)) : 1.0;
    const searchExpansionRatio = Number((bfsResult.nodesExplored / Math.max(1, openCellCount)).toFixed(4));
    const complexityIndexSearch = Number((0.50 * pathDetourFactor + 0.50 * searchExpansionRatio).toFixed(4));

    return {
      // Spatial Model Input Features (X)
      featuresX: {
        height,
        width,
        totalCells,
        openCellCount,
        wallCount,
        wallDensity,
        deadEndCount,
        deadEndRatio,
        branchingPointCount,
        branchingPointRatio,
        straightCorridorCount,
        straightCorridorRatio,
        turnCorridorCount,
        turnCorridorRatio
      },

      // Search Benchmark Metrics (Used ONLY for Target Label y Construction)
      benchmarkM: {
        shortestPathLength,
        manhattanDistance,
        pathDetourFactor,
        searchExpansionRatio,
        bfsNodesExplored: bfsResult.nodesExplored,
        complexityIndexSearch
      }
    };
  }

  /**
   * Returns relative directions of open cardinal neighbors (Up, Down, Left, Right).
   */
  static getTraversableNeighborDirections(r, c, mazeGrid, height, width) {
    const directions = [
      { r: -1, c: 0 }, // North
      { r: 1, c: 0 },  // South
      { r: 0, c: -1 }, // West
      { r: 0, c: 1 }   // East
    ];

    const openNeighbors = [];

    for (const dir of directions) {
      const nr = r + dir.r;
      const nc = c + dir.c;

      if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
        if (mazeGrid[nr][nc] !== 1) {
          openNeighbors.push(dir);
        }
      }
    }

    return openNeighbors;
  }
}
