/**
 * MazeQuest — A* Solver Test Suite & Verification Module
 * Phase 6D Automated Testing
 */

import { AStarSolver } from './astar.js';
import { BFSSolver } from '../bfs/bfs.js';
import { DFSSolver } from '../dfs/dfs.js';
import { BestFirstSolver } from '../best_first/best_first.js';
import { MazeGenerator } from '../../maze/maze_generator.js';

export function runAStarTests() {
  console.log('====================================================');
  console.log('🧪 MAZEQUEST AI — A* SOLVER SUITE RUNNER');
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

  // --- Test 1: Known 5x5 Maze ---
  console.log('\n📌 Test 1: Known 5x5 Maze');
  const simpleMaze = [
    [1, 1, 1, 1, 1],
    [1, 'S', 0, 0, 1],
    [1, 1, 1, 0, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res1 = AStarSolver.solve(simpleMaze, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res1.success === true, 'A* finds path in simple maze');
  assert(res1.path[0].r === 1 && res1.path[0].c === 1, 'Path starts at Start (1,1)');
  assert(res1.path[res1.path.length - 1].r === 3 && res1.path[res1.path.length - 1].c === 3, 'Path ends at Goal (3,3)');

  // --- Test 2: Start Equals Goal ---
  console.log('\n📌 Test 2: Start Position Equals Goal Position');
  const sameMaze = [
    [1, 1, 1],
    [1, 'S', 1],
    [1, 1, 1]
  ];
  const res2 = AStarSolver.solve(sameMaze, { r: 1, c: 1 }, { r: 1, c: 1 });
  assert(res2.success === true, 'A* handles start == goal');
  assert(res2.pathLength === 0, 'A* path length is 0 when start == goal');

  // --- Test 3: Unsolvable / Blocked Maze ---
  console.log('\n📌 Test 3: Blocked / Unsolvable Maze');
  const blockedMaze = [
    [1, 1, 1, 1, 1],
    [1, 'S', 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res3 = AStarSolver.solve(blockedMaze, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res3.success === false, 'A* correctly returns success: false for blocked goal');
  assert(res3.path.length === 0, 'A* returns empty path array when unsolvable');

  // --- Test 4 & 5: Boundary & Wall Guards ---
  console.log('\n📌 Test 4 & 5: Boundary & Wall Legal Moves');
  let allLegal = true;
  for (const step of res1.path) {
    if (simpleMaze[step.r][step.c] === 1) {
      allLegal = false;
    }
  }
  assert(allLegal, 'All steps in A* path are legal walkable cells');

  // --- Test 6: Manhattan Heuristic Verification ---
  console.log('\n📌 Test 6: Manhattan Heuristic Calculation');
  const hVal = BestFirstSolver.calculateHeuristic({ r: 2, c: 3 }, { r: 5, c: 7 });
  assert(hVal === 7, `Manhattan distance |2-5| + |3-7| = 7 (got ${hVal})`);

  // --- Test 7: gScore Verification ---
  console.log('\n📌 Test 7: gScore Unit-Cost Increment Verification');
  // In res1, path length is N steps, so distance from Start to Goal is res1.pathLength
  assert(res1.pathLength === 4, `A* path cost g(Goal) equals 4 steps (got ${res1.pathLength})`);

  // --- Test 8: Better-Path Update Check ---
  console.log('\n📌 Test 8: Better-Path Update Check (Diamond Grid)');
  // A grid where an initial longer detour is discovered before a shorter direct route
  const diamondMaze = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 'S', 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];
  const res8 = AStarSolver.solve(diamondMaze, { r: 1, c: 1 }, { r: 3, c: 5 });
  assert(res8.success === true, 'A* successfully solves diamond maze');
  assert(res8.pathLength === 6, `A* updates gScore to find optimal 6-step path (got ${res8.pathLength})`);

  // --- Test 9: Procedurally Generated Mazes ---
  console.log('\n📌 Test 9: Procedurally Generated 15x15 Mazes');
  let procPassed = 0;
  for (let i = 1; i <= 5; i++) {
    const pMaze = MazeGenerator.generate(15, 15);
    const pRes = AStarSolver.solve(pMaze.grid, pMaze.startPos, pMaze.goalPos);
    if (pRes.success && pRes.pathLength > 0) {
      procPassed++;
    }
  }
  assert(procPassed === 5, 'A* successfully solved 5/5 procedurally generated mazes');

  // --- Test 10: A* vs BFS Path Length Equivalence (CRITICAL OPTIMALITY TEST) ---
  console.log('\n📌 Test 10: A* vs BFS Shortest-Path Length Equivalence (5 Procedural Mazes)');
  let optimalMatches = 0;
  for (let i = 1; i <= 5; i++) {
    const testMaze = MazeGenerator.generate(15, 15);
    const bfsRes = BFSSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);
    const astarRes = AStarSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);

    if (bfsRes.pathLength === astarRes.pathLength) {
      optimalMatches++;
    } else {
      console.error(`  ❌ Mismatch on Maze ${i}: BFS=${bfsRes.pathLength} vs A*=${astarRes.pathLength}`);
    }
  }
  assert(optimalMatches === 5, `A* path length EXACTLY equals BFS optimal path length on 5/5 mazes`);

  // --- Test 11: All Four Algorithms Comparison Benchmark ---
  console.log('\n📌 Test 11: All Four Algorithms Benchmark (BFS vs DFS vs Best-First vs A*)');
  const testMaze = MazeGenerator.generate(15, 15);
  const bfsRes = BFSSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);
  const dfsRes = DFSSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);
  const bfRes = BestFirstSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);
  const astarRes = AStarSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);

  assert(bfsRes.success && dfsRes.success && bfRes.success && astarRes.success, 'All 4 solvers successfully solved the same maze');
  assert(astarRes.algorithm === 'A*', 'AStarSolver returned correct algorithm identifier');

  console.log(`  ℹ️ Four-Algorithm Comparison Benchmark:`);
  console.log(`     BFS        -> Path Length: ${bfsRes.pathLength} steps | Explored: ${bfsRes.nodesExplored} nodes | Time: ${bfsRes.executionTimeMs} ms`);
  console.log(`     DFS        -> Path Length: ${dfsRes.pathLength} steps | Explored: ${dfsRes.nodesExplored} nodes | Time: ${dfsRes.executionTimeMs} ms`);
  console.log(`     Best-First -> Path Length: ${bfRes.pathLength} steps | Explored: ${bfRes.nodesExplored} nodes | Time: ${bfRes.executionTimeMs} ms`);
  console.log(`     A*         -> Path Length: ${astarRes.pathLength} steps | Explored: ${astarRes.nodesExplored} nodes | Time: ${astarRes.executionTimeMs} ms`);

  console.log('\n----------------------------------------------------');
  console.log(`📊 A* TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('====================================================\n');

  return { passedTests, totalTests };
}
