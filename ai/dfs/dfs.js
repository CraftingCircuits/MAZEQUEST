/**
 * MazeQuest — Depth-First Search (DFS) Solver
 * Algorithm: Depth-First Search (State-Space Graph Traversal)
 * Phase 6B Implementation
 */

import { SearchResult } from '../common/search_result.js';

export class DFSSolver {
  /**
   * Solves a maze grid using Depth-First Search (DFS).
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
      return new SearchResult({ algorithm: 'DFS', success: false });
    }

    const height = mazeGrid.length;
    const width = mazeGrid[0].length;

    // Edge Case: Start equals Goal
    if (startPos.r === goalPos.r && startPos.c === goalPos.c) {
      const endTime = performance.now();
      return new SearchResult({
        algorithm: 'DFS',
        success: true,
        path: [{ r: startPos.r, c: startPos.c }],
        visitedNodes: [{ r: startPos.r, c: startPos.c }],
        nodesExplored: 1,
        executionTimeMs: endTime - startTime
      });
    }

    // 1. Data Structures
    const stack = []; // LIFO Stack
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    const parentMap = new Map();
    const visitedNodes = [];
    let nodesExplored = 0;

    // Push Start Cell onto Stack and mark visited
    stack.push({ r: startPos.r, c: startPos.c });
    visited[startPos.r][startPos.c] = true;

    let goalNode = null;

    // 2. DFS Traversal Loop
    while (stack.length > 0) {
      const current = stack.pop(); // LIFO Stack Pop
      nodesExplored += 1;
      visitedNodes.push(current);

      // Goal Check
      if (current.r === goalPos.r && current.c === goalPos.c) {
        goalNode = current;
        break; // Goal reached!
      }

      // Explore Valid Neighbors (Up, Down, Left, Right)
      const neighbors = this.getValidNeighbors(current, mazeGrid, visited, height, width);

      for (const neighbor of neighbors) {
        visited[neighbor.r][neighbor.c] = true;
        parentMap.set(`${neighbor.r},${neighbor.c}`, current);
        stack.push(neighbor);
      }
    }

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    // 3. Goal Reached -> Reconstruct Path
    if (goalNode) {
      const path = this.reconstructPath(goalNode, parentMap, startPos);
      return new SearchResult({
        algorithm: 'DFS',
        success: true,
        path,
        visitedNodes,
        nodesExplored,
        executionTimeMs
      });
    }

    // Goal Unreachable
    return new SearchResult({
      algorithm: 'DFS',
      success: false,
      path: [],
      visitedNodes,
      nodesExplored,
      executionTimeMs
    });
  }

  /**
   * Returns valid cardinal neighbor coordinates (Up, Down, Left, Right).
   */
  static getValidNeighbors(current, mazeGrid, visited, height, width) {
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
          // 3. Visited Check
          if (!visited[nr][nc]) {
            neighbors.push({ r: nr, c: nc });
          }
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
