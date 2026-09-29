/**
 * MazeQuest — BFS Solver Test Suite & Verification Module
 * Phase 6A Automated Testing
 */

import { BFSSolver } from './bfs.js';
import { MazeGenerator } from '../../maze/maze_generator.js';

export function runBFSTests() {
  console.log('====================================================');
  console.log('🧪 MAZEQUEST AI — BFS SOLVER SUITE RUNNER');
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

  // --- Test 1: Simple 5x5 Known Maze ---
  console.log('\n📌 Test 1: Known 5x5 Maze');
  const simpleMaze = [
    [1, 1, 1, 1, 1],
    [1, 'S', 0, 0, 1],
    [1, 1, 1, 0, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const start1 = { r: 1, c: 1 };
  const goal1 = { r: 3, c: 3 };

  const res1 = BFSSolver.solve(simpleMaze, start1, goal1);
  assert(res1.success === true, 'BFS finds path in simple maze');
  assert(res1.path[0].r === 1 && res1.path[0].c === 1, 'Path starts at Start (1,1)');
  assert(res1.path[res1.path.length - 1].r === 3 && res1.path[res1.path.length - 1].c === 3, 'Path ends at Goal (3,3)');
  assert(res1.pathLength > 0, `Path length is valid (${res1.pathLength} steps)`);

  // --- Test 2: Multiple Paths (Verify Shortest Path) ---
  console.log('\n📌 Test 2: Multiple Paths (Shortest Path Guarantee)');
  // Open 4x4 grid: Direct path (1,1) to (3,3) is 4 steps (e.g. (1,1)->(1,2)->(1,3)->(2,3)->(3,3))
  const openGrid = [
    [1, 1, 1, 1, 1],
    [1, 'S', 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res2 = BFSSolver.solve(openGrid, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res2.success === true, 'BFS solves open grid');
  assert(res2.pathLength === 4, `BFS returns optimal shortest path length 4 (got ${res2.pathLength})`);

  // --- Test 3: Unsolvable / Blocked Maze ---
  console.log('\n📌 Test 3: Blocked / Unsolvable Maze');
  const blockedMaze = [
    [1, 1, 1, 1, 1],
    [1, 'S', 1, 0, 1], // Goal walled off
    [1, 1, 1, 1, 1],
    [1, 0, 0, 'G', 1],
    [1, 1, 1, 1, 1]
  ];
  const res3 = BFSSolver.solve(blockedMaze, { r: 1, c: 1 }, { r: 3, c: 3 });
  assert(res3.success === false, 'BFS correctly returns success: false for blocked goal');
  assert(res3.path.length === 0, 'BFS returns empty path array when unsolvable');

  // --- Test 4: Start Equals Goal ---
  console.log('\n📌 Test 4: Start Position Equals Goal Position');
  const sameMaze = [
    [1, 1, 1],
    [1, 'S', 1],
    [1, 1, 1]
  ];
  const res4 = BFSSolver.solve(sameMaze, { r: 1, c: 1 }, { r: 1, c: 1 });
  assert(res4.success === true, 'BFS handles start == goal');
  assert(res4.pathLength === 0, 'Path length is 0 when start == goal');
  assert(res4.path.length === 1, 'Path array contains exactly 1 node');

  // --- Test 5 & 6: Wall and Boundary Guard Validation ---
  console.log('\n📌 Test 5 & 6: Boundary & Wall Legal Moves');
  let allMovesLegal = true;
  for (const step of res1.path) {
    if (simpleMaze[step.r][step.c] === 1) {
      allMovesLegal = false;
    }
  }
  assert(allMovesLegal, 'All steps in BFS path are legal walkable cells (no wall crossing)');

  // --- Test 7: Procedurally Generated Mazes ---
  console.log('\n📌 Test 7: Procedurally Generated 15x15 Mazes');
  let proceduralSuccesses = 0;
  for (let i = 1; i <= 5; i++) {
    const pMaze = MazeGenerator.generate(15, 15);
    const pRes = BFSSolver.solve(pMaze.grid, pMaze.startPos, pMaze.goalPos);
    if (pRes.success && pRes.pathLength > 0 && pRes.executionTimeMs >= 0) {
      proceduralSuccesses++;
    }
  }
  assert(proceduralSuccesses === 5, `BFS successfully solved 5/5 procedurally generated 15x15 mazes`);

  console.log('\n----------------------------------------------------');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('====================================================\n');

  return { passedTests, totalTests };
}
