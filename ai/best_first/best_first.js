/**
 * MazeQuest — Greedy Best-First Search Solver
 * Algorithm: Greedy Best-First Search (Heuristic Search using Manhattan Distance)
 * Evaluation Function: f(n) = h(n)
 * Phase 6C Implementation
 */

import { SearchResult } from '../common/search_result.js';
import { PriorityQueue } from '../common/priority_queue.js';

export class BestFirstSolver {
  /**
   * Calculates the Manhattan Distance heuristic from cell (r, c) to goalPos.
   * h(n) = |r - goalR| + |c - goalC|
   * 
   * @param {{r: number, c: number}} cell 
   * @param {{r: number, c: number}} goalPos 
   * @returns {number} Estimated Manhattan distance
   */
  static calculateHeuristic(cell, goalPos) {
    return Math.abs(cell.r - goalPos.r) + Math.abs(cell.c - goalPos.c);
  }

  /**
   * Solves a maze grid using Greedy Best-First Search (f(n) = h(n)).
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
      return new SearchResult({ algorithm: 'Best-First', success: false });
    }

    const height = mazeGrid.length;
    const width = mazeGrid[0].length;

    // Edge Case: Start equals Goal
    if (startPos.r === goalPos.r && startPos.c === goalPos.c) {
      const endTime = performance.now();
      return new SearchResult({
        algorithm: 'Best-First',
        success: true,
        path: [{ r: startPos.r, c: startPos.c }],
        visitedNodes: [{ r: startPos.r, c: startPos.c }],
        nodesExplored: 1,
        executionTimeMs: endTime - startTime
      });
    }

    // 1. Data Structures
    const pq = new PriorityQueue(); // Min Priority Queue based on h(n)
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    const parentMap = new Map();
    const visitedNodes = [];
    let nodesExplored = 0;

    // Push Start Cell onto Priority Queue with h(start) score
    const initialH = this.calculateHeuristic(startPos, goalPos);
    pq.push({ r: startPos.r, c: startPos.c }, initialH);
    visited[startPos.r][startPos.c] = true;

    let goalNode = null;

    // 2. Best-First Search Traversal Loop
    while (!pq.isEmpty()) {
      const current = pq.pop(); // Dequeue node with SMALLEST h(n)
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

        const hScore = this.calculateHeuristic(neighbor, goalPos);
        pq.push(neighbor, hScore);
      }
    }

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    // 3. Goal Reached -> Reconstruct Path
    if (goalNode) {
      const path = this.reconstructPath(goalNode, parentMap, startPos);
      return new SearchResult({
        algorithm: 'Best-First',
        success: true,
        path,
        visitedNodes,
        nodesExplored,
        executionTimeMs
      });
    }

    // Goal Unreachable
    return new SearchResult({
      algorithm: 'Best-First',
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
