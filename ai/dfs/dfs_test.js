/**
 * MazeQuest — DFS Solver Test Suite & Verification Module
 * Phase 6B Automated Testing
 */

import { DFSSolver } from './dfs.js';
import { BFSSolver } from '../bfs/bfs.js';
import { MazeGenerator } from '../../maze/maze_generator.js';

export function runDFSTests() {
  console.log('====================================================');
  console.log('🧪 MAZEQUEST AI — DFS SOLVER SUITE RUNNER');
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
  const res1 = DFSSolver.solve(simpleMaze, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res1.success === true, 'DFS finds path in simple maze');
  assert(res1.path[0].r === 1 && res1.path[0].c === 1, 'Path starts at Start (1,1)');
  assert(res1.path[res1.path.length - 1].r === 3 && res1.path[res1.path.length - 1].c === 3, 'Path ends at Goal (3,3)');

  // --- Test 2: Multiple Routes (Valid Path Verification) ---
  console.log('\n📌 Test 2: Multiple Routes (Returns Valid Path)');
  const openGrid = [
    [1, 1, 1, 1, 1],
    [1, 'S', 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res2 = DFSSolver.solve(openGrid, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res2.success === true, 'DFS solves open grid');
  assert(res2.pathLength > 0, `DFS path length is valid (${res2.pathLength} steps)`);

  // --- Test 3: Unsolvable / Blocked Maze ---
  console.log('\n📌 Test 3: Blocked / Unsolvable Maze');
  const blockedMaze = [
    [1, 1, 1, 1, 1],
    [1, 'S', 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res3 = DFSSolver.solve(blockedMaze, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res3.success === false, 'DFS correctly returns success: false for blocked goal');
  assert(res3.path.length === 0, 'DFS returns empty path array when unsolvable');

  // --- Test 4: Start Equals Goal ---
  console.log('\n📌 Test 4: Start Position Equals Goal Position');
  const sameMaze = [
    [1, 1, 1],
    [1, 'S', 1],
    [1, 1, 1]
  ];
  const res4 = DFSSolver.solve(sameMaze, { r: 1, c: 1 }, { r: 1, c: 1 });
  assert(res4.success === true, 'DFS handles start == goal');
  assert(res4.pathLength === 0, 'DFS path length is 0 when start == goal');

  // --- Test 5 & 6: Wall & Boundary Guards ---
  console.log('\n📌 Test 5 & 6: Boundary & Wall Guards');
  let allLegal = true;
  for (const step of res1.path) {
    if (simpleMaze[step.r][step.c] === 1) {
      allLegal = false;
    }
  }
  assert(allLegal, 'All steps in DFS path are legal walkable cells');

  // --- Test 7: Procedurally Generated Mazes ---
  console.log('\n📌 Test 7: Procedurally Generated 15x15 Mazes');
  let procPassed = 0;
  for (let i = 1; i <= 5; i++) {
    const pMaze = MazeGenerator.generate(15, 15);
    const pRes = DFSSolver.solve(pMaze.grid, pMaze.startPos, pMaze.goalPos);
    if (pRes.success && pRes.pathLength > 0) {
      procPassed++;
    }
  }
  assert(procPassed === 5, 'DFS successfully solved 5/5 procedurally generated mazes');

  // --- Test 8: BFS vs DFS Compatibility & Comparison ---
  console.log('\n📌 Test 8: BFS vs DFS Compatibility on Same Maze');
  const testMaze = MazeGenerator.generate(15, 15);
  const bfsRes = BFSSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);
  const dfsRes = DFSSolver.solve(testMaze.grid, testMaze.startPos, testMaze.goalPos);

  assert(bfsRes.success && dfsRes.success, 'Both BFS and DFS successfully solved the same maze');
  assert(bfsRes.algorithm === 'BFS' && dfsRes.algorithm === 'DFS', 'Solvers returned correct algorithm identifiers');
  console.log(`  ℹ️ Comparison Benchmark:`);
  console.log(`     BFS -> Path Length: ${bfsRes.pathLength} steps | Explored: ${bfsRes.nodesExplored} nodes | Time: ${bfsRes.executionTimeMs} ms`);
  console.log(`     DFS -> Path Length: ${dfsRes.pathLength} steps | Explored: ${dfsRes.nodesExplored} nodes | Time: ${dfsRes.executionTimeMs} ms`);

  console.log('\n----------------------------------------------------');
  console.log(`📊 DFS TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('====================================================\n');

  return { passedTests, totalTests };
}
