/**
 * MazeQuest — AI Search Algorithm Comparator Test Suite
 * Phase 7C Implementation Verification
 */

import { AIComparator } from './comparator.js';
import { MazeGenerator } from '../../maze/maze_generator.js';

export class ComparatorTestSuite {
  static runAll() {
    console.log('====================================================');
    console.log('   MAZEQUEST — PHASE 7C COMPARATOR TEST SUITE       ');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    const assert = (condition, testName, details = '') => {
      if (condition) {
        console.log(`[PASS] ${testName} ${details ? '— ' + details : ''}`);
        passed++;
      } else {
        console.error(`[FAIL] ${testName} ${details ? '— ' + details : ''}`);
        failed++;
      }
    };

    // Test 1: Solvable Procedural Maze Comparison
    try {
      const maze = MazeGenerator.generate(15, 15);
      const comp = AIComparator.compareAll(maze.grid, maze.start, maze.goal);

      assert(comp.results.length === 4, 'Test 1.1: CompareAll returns results for all 4 algorithms');
      
      const algorithms = comp.results.map(r => r.algorithm);
      assert(
        algorithms.includes('BFS') && algorithms.includes('DFS') && algorithms.includes('Best-First') && algorithms.includes('A*'),
        'Test 1.2: Contains BFS, DFS, Best-First, and A*'
      );

      const allValid = comp.validation.checks.every(c => c.valid);
      assert(allValid, 'Test 1.3: All returned solution paths pass path validation');

      assert(comp.validation.isAStarBfsEqual, 'Test 1.4: A* and BFS match path length on solvable unweighted grid');
    } catch (e) {
      assert(false, 'Test 1: Solvable Maze Comparison Threw Exception', e.message);
    }

    // Test 2: Same Maze Repeatability (Deterministic Path Lengths & Nodes Explored)
    try {
      const maze = MazeGenerator.generate(15, 15);
      const run1 = AIComparator.compareAll(maze.grid, maze.start, maze.goal);
      const run2 = AIComparator.compareAll(maze.grid, maze.start, maze.goal);

      let deterministic = true;
      for (let i = 0; i < run1.results.length; i++) {
        const r1 = run1.results[i];
        const r2 = run2.results[i];
        if (r1.pathLength !== r2.pathLength || r1.nodesExplored !== r2.nodesExplored) {
          deterministic = false;
          break;
        }
      }
      assert(deterministic, 'Test 2: Sequential comparison runs on identical maze produce deterministic path lengths and node counts');
    } catch (e) {
      assert(false, 'Test 2: Repeatability Threw Exception', e.message);
    }

    // Test 3: Unsolvable Maze Comparison
    try {
      const grid = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ];
      const start = { r: 0, c: 0 };
      const goal = { r: 2, c: 2 };
      const comp = AIComparator.compareAll(grid, start, goal);

      const allFailed = comp.results.every(r => !r.success);
      assert(allFailed, 'Test 3: All 4 algorithms report failure on unsolvable maze');
    } catch (e) {
      assert(false, 'Test 3: Unsolvable Maze Threw Exception', e.message);
    }

    // Test 4: Start Equals Goal Edge Case
    try {
      const grid = [
        [0, 0],
        [0, 0]
      ];
      const start = { r: 0, c: 0 };
      const goal = { r: 0, c: 0 };
      const comp = AIComparator.compareAll(grid, start, goal);

      const allZeroLen = comp.results.every(r => r.success && r.pathLength === 0);
      assert(allZeroLen, 'Test 4: Start equals Goal produces pathLength === 0 across all solvers');
    } catch (e) {
      assert(false, 'Test 4: Start Equals Goal Threw Exception', e.message);
    }

    console.log(`\n----------------------------------------------------`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed.`);
    console.log('====================================================\n');
    return failed === 0;
  }
}
