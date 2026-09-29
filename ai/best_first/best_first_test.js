/**
 * MazeQuest — Best-First Solver Test Suite & Verification Module
 * Phase 6C Automated Testing
 */

import { BestFirstSolver } from './best_first.js';
import { BFSSolver } from '../bfs/bfs.js';
import { DFSSolver } from '../dfs/dfs.js';
import { MazeGenerator } from '../../maze/maze_generator.js';

export function runBestFirstTests() {
  console.log('====================================================');
  console.log('🧪 MAZEQUEST AI — BEST-FIRST SOLVER SUITE RUNNER');
  console.log('====================================================');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  // --- Test 1: Simple Solvable 5x5 Maze ---
  console.log('\n📌 Test 1: Known 5x5 Maze');
  const simpleMaze = [
    [1, 1, 1, 1, 1],
    [1, 'S', 0, 0, 1],
    [1, 1, 1, 0, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res1 = BestFirstSolver.solve(simpleMaze, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res1.success === true, 'Best-First finds path in simple maze');
  assert(res1.path[0].r === 1 && res1.path[0].c === 1, 'Path starts at Start (1,1)');
  assert(res1.path[res1.path.length - 1].r === 3 && res1.path[res1.path.length - 1].c === 3, 'Path ends at Goal (3,3)');

  // --- Test 2: Heuristic Calculation Verification ---
  console.log('\n📌 Test 2: Independent Manhattan Distance Heuristic Calculation');
  const h1 = BestFirstSolver.calculateHeuristic({ r: 0, c: 0 }, { r: 3, c: 4 });
  assert(h1 === 7, `h((0,0) -> (3,4)) equals 7 (got ${h1})`);

  const h2 = BestFirstSolver.calculateHeuristic({ r: 2, c: 5 }, { r: 2, c: 5 });
  assert(h2 === 0, `h((2,5) -> (2,5)) equals 0 (got ${h2})`);

  // --- Test 3: Unsolvable / Blocked Maze ---
  console.log('\n📌 Test 3: Blocked / Unsolvable Maze');
  const blockedMaze = [
    [1, 1, 1, 1, 1],
    [1, 'S', 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res3 = BestFirstSolver.solve(blockedMaze, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res3.success === false, 'Best-First correctly returns success: false for blocked goal');
  assert(res3.path.length === 0, 'Best-First returns empty path array when unsolvable');

  // --- Test 4: Start Equals Goal ---
  console.log('\n📌 Test 4: Start Position Equals Goal Position');
  const sameMaze = [
    [1, 1, 1],
    [1, 'S', 1],
    [1, 1, 1]
  ];
  const res4 = BestFirstSolver.solve(sameMaze, { r: 1, c: 1 }, { r: 1, c: 1 });
  assert(res4.success === true, 'Best-First handles start == goal');
  assert(res4.pathLength === 0, 'Best-First path length is 0 when start == goal');

  // --- Test 5 & 6: Wall & Boundary Guards ---
  console.log('\n📌 Test 5 & 6: Boundary & Wall Legal Moves');
  let allLegal = true;
  for (const step of res1.path) {
    if (simpleMaze[step.r][step.c] === 1) {
      allLegal = false;
    }
  }
  assert(allLegal, 'All steps in Best-First path are legal walkable cells');

  // --- Test 7: Procedurally Generated Mazes ---
  console.log('\n📌 Test 7: Procedurally Generated 15x15 Mazes');
  let procPassed = 0;
  for (let i = 1; i <= 5; i++) {
    const pMaze = MazeGenerator.generate(15, 15);
    const pRes = BestFirstSolver.solve(pMaze.grid, pMaze.startPos, pMaze.goalPos);
    if (pRes.success && pRes.pathLength > 0) {
      procPassed++;
    }
  }
  assert(procPassed === 5, 'Best-First successfully solved 5/5 procedurally generated mazes');

  // --- Test 8: Triple Solver Comparison (BFS vs DFS vs Best-First) ---
  console.log('\n📌 Test 8: Triple Solver Benchmark (BFS vs DFS vs Best-First)');
  const testMaze = MazeGenerator.generate(15, 15);
  const bfsRes = BFSSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);
  const dfsRes = DFSSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);
  const bfRes = BestFirstSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);

  assert(bfsRes.success && dfsRes.success && bfRes.success, 'All 3 solvers successfully solved the same maze');
  assert(bfRes.algorithm === 'Best-First', 'BestFirstSolver returned correct algorithm identifier');

  console.log(`  ℹ️ Triple Comparison Benchmark:`);
  console.log(`     BFS        -> Path Length: ${bfsRes.pathLength} steps | Explored: ${bfsRes.nodesExplored} nodes | Time: ${bfsRes.executionTimeMs} ms`);
  console.log(`     DFS        -> Path Length: ${dfsRes.pathLength} steps | Explored: ${dfsRes.nodesExplored} nodes | Time: ${dfsRes.executionTimeMs} ms`);
  console.log(`     Best-First -> Path Length: ${bfRes.pathLength} steps | Explored: ${bfRes.nodesExplored} nodes | Time: ${bfRes.executionTimeMs} ms`);

  console.log('\n----------------------------------------------------');
  console.log(`📊 BEST-FIRST TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('====================================================\n');

  return { passedTests, totalTests };
}
