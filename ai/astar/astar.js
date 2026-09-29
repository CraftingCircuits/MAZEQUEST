/**
 * MazeQuest — A* Search Solver
 * Algorithm: A* Search (Optimal Heuristic Graph Search)
 * Evaluation Function: f(n) = g(n) + h(n)
 * Phase 6D Implementation
 */

import { SearchResult } from '../common/search_result.js';
import { PriorityQueue } from '../common/priority_queue.js';
import { BestFirstSolver } from '../best_first/best_first.js';

export class AStarSolver {
  /**
   * Solves a maze grid using A* Search (f(n) = g(n) + h(n)).
   * Pure algorithm execution — zero DOM/UI coupling.
   * 
   * @param {Array<Array<number|string>>} mazeGrid - 2D matrix representation
   * @param {{r: number, c: number}} startPos - Start coordinates
   * @param {{r: number, c: number}} goalPos - Goal coordinates
   * @returns {SearchResult} Standardized search output
   */
  static solve(mazeGrid, startPos, goalPos) {
    const startTime = performance.now();

    if (!mazeGrid || mazeGrid.length === 0) {
      return new SearchResult({ algorithm: 'A*', success: false });
    }

    const height = mazeGrid.length;
    const width = mazeGrid[0].length;

    // Edge Case: Start equals Goal
    if (startPos.r === goalPos.r && startPos.c === goalPos.c) {
      const endTime = performance.now();
      return new SearchResult({
        algorithm: 'A*',
        success: true,
        path: [{ r: startPos.r, c: startPos.c }],
        visitedNodes: [{ r: startPos.r, c: startPos.c }],
        nodesExplored: 1,
        executionTimeMs: endTime - startTime
      });
    }

    // 1. Data Structures
    const pq = new PriorityQueue(); // Min Priority Queue prioritized by f(n)
    
    // gScore[r][c] stores the lowest known cost from Start to cell (r, c)
    const gScore = Array.from({ length: height }, () => Array(width).fill(Infinity));
    
    // Closed set to track fully expanded nodes and reject stale queue entries
    const closed = Array.from({ length: height }, () => Array(width).fill(false));
    
    const parentMap = new Map();
    const visitedNodes = [];
    let nodesExplored = 0;

    // Initialize Start node: g(start) = 0, f(start) = 0 + h(start)
    gScore[startPos.r][startPos.c] = 0;
    const initialH = BestFirstSolver.calculateHeuristic(startPos, goalPos);
    pq.push({ r: startPos.r, c: startPos.c }, 0 + initialH);

    let goalNode = null;

    // 2. A* Search Traversal Loop
    while (!pq.isEmpty()) {
      const current = pq.pop(); // Dequeue node with SMALLEST f(n)

      // Stale Entry Guard: Skip node if it has already been expanded via a cheaper route
      if (closed[current.r][current.c]) {
        continue;
      }

      // Mark Node as Closed/Expanded
      closed[current.r][current.c] = true;
      nodesExplored += 1;
      visitedNodes.push(current);

      // Goal Check
      if (current.r === goalPos.r && current.c === goalPos.c) {
        goalNode = current;
        break; // Optimal path found!
      }

      // Explore Valid Neighbors (Up, Down, Left, Right)
      const neighbors = this.getValidNeighbors(current, mazeGrid, height, width);

      for (const neighbor of neighbors) {
        // Skip if neighbor is already closed
        if (closed[neighbor.r][neighbor.c]) {
          continue;
        }

        // Each movement step has unit cost = 1
        const tentativeG = gScore[current.r][current.c] + 1;

        // Better-Path Update Check
        if (tentativeG < gScore[neighbor.r][neighbor.c]) {
          // Update best known gScore and parent pointer
          gScore[neighbor.r][neighbor.c] = tentativeG;
          parentMap.set(`${neighbor.r},${neighbor.c}`, current);

          // Calculate f(n) = g(n) + h(n)
          const hScore = BestFirstSolver.calculateHeuristic(neighbor, goalPos);
          const fScore = tentativeG + hScore;

          pq.push(neighbor, fScore);
        }
      }
    }

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    // 3. Goal Reached -> Reconstruct Path
    if (goalNode) {
      const path = this.reconstructPath(goalNode, parentMap, startPos);
      return new SearchResult({
        algorithm: 'A*',
        success: true,
        path,
        visitedNodes,
        nodesExplored,
        executionTimeMs
      });
    }

    // Goal Unreachable
    return new SearchResult({
      algorithm: 'A*',
      success: false,
      path: [],
      visitedNodes,
      nodesExplored,
      executionTimeMs
    });
  }

  /**
   * Returns valid cardinal neighbor coordinates (Up, Down, Left, Right) within bounds and non-walls.
   */
  static getValidNeighbors(current, mazeGrid, height, width) {
    const neighbors = [];
    const directions = [
      { r: -1, c: 0 }, // Up
      { r: 1, c: 0 },  // Down
      { r: 0, c: -1 }, // Left
      { r: 0, c: 1 }   // Right
    ];

    for (const dir of directions) {
      const nr = current.r + dir.r;
      const nc = current.c + dir.c;

      // 1. Grid Boundary Check
      if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
        // 2. Wall Check (1 represents Wall)
        if (mazeGrid[nr][nc] !== 1) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }

    return neighbors;
  }

  /**
   * Reconstructs path sequence from Goal to Start using parentMap, then reverses it.
   */
  static reconstructPath(goalNode, parentMap, startPos) {
    const path = [];
    let curr = goalNode;

    while (curr) {
      path.push({ r: curr.r, c: curr.c });
      if (curr.r === startPos.r && curr.c === startPos.c) {
        break;
      }
      curr = parentMap.get(`${curr.r},${curr.c}`);
    }

    path.reverse();
    return path;
  }
}
