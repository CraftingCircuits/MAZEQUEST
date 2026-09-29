/**
 * MazeQuest — AI Search Algorithm Comparator
 * Phase 7C Implementation
 * 
 * Runs all four AI search algorithms (BFS, DFS, Best-First, A*) independently
 * on the exact same maze grid instance to collect empirical metrics, validate path continuity,
 * and verify optimality consistency without mutating game state.
 */

import { BFSSolver } from '../bfs/bfs.js';
import { DFSSolver } from '../dfs/dfs.js';
import { BestFirstSolver } from '../best_first/best_first.js';
import { AStarSolver } from '../astar/astar.js';

export class AIComparator {
  /**
   * Solves the given maze grid using all four AI search solvers on the EXACT SAME maze.
   * Pure computational execution — zero DOM manipulation or state mutation.
   * 
   * @param {Array<Array<number|string>>} mazeGrid - 2D matrix representation
   * @param {{r: number, c: number}} startPos - Start coordinates
   * @param {{r: number, c: number}} goalPos - Goal coordinates
   * @returns {Object} Comparison dataset containing SearchResults, path validation, and optimality checks
   */
  static compareAll(mazeGrid, startPos, goalPos) {
    if (!mazeGrid || mazeGrid.length === 0) {
      return { results: [], validation: { checks: [], isAStarBfsEqual: false, astarBfsMessage: 'Invalid maze grid' } };
    }

    // 1. Run all 4 solvers independently on identical maze inputs
    const bfs = BFSSolver.solve(mazeGrid, startPos, goalPos);
    const dfs = DFSSolver.solve(mazeGrid, startPos, goalPos);
    const bestFirst = BestFirstSolver.solve(mazeGrid, startPos, goalPos);
    const astar = AStarSolver.solve(mazeGrid, startPos, goalPos);

    const results = [bfs, dfs, bestFirst, astar];

    // 2. Perform path validation and A* vs BFS optimality check
    const validation = this.validateResults(results, mazeGrid, startPos, goalPos);

    return {
      results,
      validation,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates solution paths for coordinate bounds, continuous neighbor steps,
   * non-wall cell traversal, and verifies A* vs BFS path length equality.
   * 
   * @param {Array<SearchResult>} results 
   * @param {Array<Array<number|string>>} mazeGrid 
   * @param {{r: number, c: number}} startPos 
   * @param {{r: number, c: number}} goalPos 
   * @returns {Object} Validation results and message
   */
  static validateResults(results, mazeGrid, startPos, goalPos) {
    const checks = [];
    let isAStarBfsEqual = true;
    let astarBfsMessage = '';

    const bfsResult = results.find(r => r.algorithm === 'BFS');
    const astarResult = results.find(r => r.algorithm === 'A*');

    // Optimal Shortest-Path Equality Check for unweighted 4-direction grid
    if (bfsResult && astarResult) {
      if (bfsResult.success && astarResult.success) {
        if (bfsResult.pathLength === astarResult.pathLength) {
          astarBfsMessage = `Optimal Path Length Check: BFS (${bfsResult.pathLength}) === A* (${astarResult.pathLength}) [Passed]`;
        } else {
          isAStarBfsEqual = false;
          astarBfsMessage = `Path Length Mismatch Warning: BFS (${bfsResult.pathLength}) vs A* (${astarResult.pathLength})`;
        }
      } else if (!bfsResult.success && !astarResult.success) {
        astarBfsMessage = 'Unsolvable Maze Consistency Check: Both BFS and A* correctly reported no solution [Passed]';
      }
    }

    for (const result of results) {
      if (!result.success) {
        checks.push({ algorithm: result.algorithm, valid: true, note: 'Valid: No solution exists in search space' });
        continue;
      }

      const path = result.path;
      if (!path || path.length === 0) {
        checks.push({ algorithm: result.algorithm, valid: false, note: 'Error: Empty path array marked as successful' });
        continue;
      }

      // 1. Start and Goal Coordinate Check
      const startMatch = path[0].r === startPos.r && path[0].c === startPos.c;
      const goalMatch = path[path.length - 1].r === goalPos.r && path[path.length - 1].c === goalPos.c;

      if (!startMatch || !goalMatch) {
        checks.push({ algorithm: result.algorithm, valid: false, note: 'Error: Path start or goal endpoint mismatch' });
        continue;
      }

      // 2. Neighbor Continuity and Wall Collision Check
      let validPath = true;
      let failureReason = '';

      for (let i = 0; i < path.length; i++) {
        const cell = path[i];

        // Wall check (1 represents wall)
        if (mazeGrid[cell.r][cell.c] === 1) {
          validPath = false;
          failureReason = `Wall collision at (${cell.r}, ${cell.c})`;
          break;
        }

        if (i > 0) {
          const prev = path[i - 1];
          const dist = Math.abs(cell.r - prev.r) + Math.abs(cell.c - prev.c);
          if (dist !== 1) {
            validPath = false;
            failureReason = `Non-adjacent step jump between (${prev.r}, ${prev.c}) and (${cell.r}, ${cell.c})`;
            break;
          }
        }
      }

      checks.push({
        algorithm: result.algorithm,
        valid: validPath,
        note: validPath ? 'Valid: Continuous orthogonal path without wall crossing' : `Error: ${failureReason}`
      });
    }

    return {
      checks,
      isAStarBfsEqual,
      astarBfsMessage
    };
  }
}
