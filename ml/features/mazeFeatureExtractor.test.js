/**
 * MazeQuest — Feature Extractor Unit Test Suite
 * Phase 8B Implementation
 */

import { MazeFeatureExtractor } from './mazeFeatureExtractor.js';
import { MazeGenerator } from '../../maze/maze_generator.js';

export class FeatureExtractorTestSuite {
  static runAll() {
    console.log('====================================================');
    console.log('   MAZEQUEST — FEATURE EXTRACTOR UNIT TEST SUITE    ');
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

    // Test 1: Known 3x3 Grid Matrix Topology
    try {
      // 3x3 Grid Matrix:
      // S . .
      // 1 1 .
      // . . G
      // S=(0,0), G=(2,2). Path cells = (0,0), (0,1), (0,2), (1,2), (2,0), (2,1), (2,2) -> 7 open, 2 walls -> total 9
      const grid = [
        ['S', 0, 0],
        [1, 1, 0],
        [0, 0, 'G']
      ];
      const startPos = { r: 0, c: 0 };
      const goalPos = { r: 2, c: 2 };

      const extracted = MazeFeatureExtractor.extract(grid, startPos, goalPos);
      const fX = extracted.featuresX;
      const bM = extracted.benchmarkM;

      assert(fX.totalCells === 9, 'Test 1.1: totalCells calculated correctly (9)');
      assert(fX.wallCount === 2, 'Test 1.2: wallCount calculated correctly (2)');
      assert(fX.openCellCount === 7, 'Test 1.3: openCellCount calculated correctly (7)');
      assert(Math.abs(fX.wallDensity - (2 / 9)) < 0.001, 'Test 1.4: wallDensity ratio correct (0.2222)');

      // Dead End check: (2,0) has 1 neighbor (2,1). Start (0,0) and Goal (2,2) are excluded.
      assert(fX.deadEndCount === 1, 'Test 1.5: deadEndCount excludes Start & Goal and identifies (2,0) correctly');
    } catch (e) {
      assert(false, 'Test 1: Known 3x3 Grid Threw Exception', e.message);
    }

    // Test 2: Known Branching, Straight & Turn Corridor Topology
    try {
      // 5x5 Grid Matrix with explicit corridor types:
      // S 0 0 0 G  -> (0,2) has 3 neighbors: (0,1), (0,3), (1,2) -> Branching!
      // 1 1 0 1 1  -> (1,2) has 2 neighbors: (0,2), (2,2) -> Straight!
      // 1 1 0 1 1  -> (2,2) has 2 neighbors: (1,2), (2,3) -> Turn!
      // 1 1 0 0 1
      // 1 1 1 1 1
      const grid = [
        ['S', 0, 0, 0, 'G'],
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ];
      const startPos = { r: 0, c: 0 };
      const goalPos = { r: 0, c: 4 };

      const extracted = MazeFeatureExtractor.extract(grid, startPos, goalPos);
      const fX = extracted.featuresX;

      assert(fX.branchingPointCount >= 1, 'Test 2.1: Identifies branching point with >=3 neighbors');
      assert(fX.straightCorridorCount >= 1, 'Test 2.2: Identifies straight collinear corridor');
      assert(fX.turnCorridorCount >= 1, 'Test 2.3: Identifies orthogonal turn corridor');
    } catch (e) {
      assert(false, 'Test 2: Known Corridor Types Threw Exception', e.message);
    }

    // Test 3: Path Detour Factor & Start Equals Goal Edge Case
    try {
      const grid = [
        ['S', 0],
        [0, 'G']
      ];
      const startSame = { r: 0, c: 0 };
      const goalSame = { r: 0, c: 0 };

      const extractedSame = MazeFeatureExtractor.extract(grid, startSame, goalSame);
      assert(extractedSame.benchmarkM.pathDetourFactor === 1.0, 'Test 3.1: Start == Goal handles detour factor safely (1.0)');

      const goalDiff = { r: 1, c: 1 };
      const extractedDiff = MazeFeatureExtractor.extract(grid, startSame, goalDiff);
      assert(extractedDiff.benchmarkM.pathDetourFactor >= 1.0, 'Test 3.2: Start != Goal detour factor is >= 1.0');
    } catch (e) {
      assert(false, 'Test 3: Start Equals Goal Threw Exception', e.message);
    }

    // Test 4: Full Extraction on Procedural Generated Maze
    try {
      const maze = MazeGenerator.generate(15, 15, 42);
      const extracted = MazeFeatureExtractor.extract(maze.grid, maze.startPos, maze.goalPos);
      
      assert(extracted !== null, 'Test 4.1: Feature extraction succeeds on generated maze');
      assert(extracted.featuresX.wallDensity > 0 && extracted.featuresX.wallDensity < 1, 'Test 4.2: wallDensity in valid range (0,1)');
      assert(extracted.benchmarkM.shortestPathLength > 0, 'Test 4.3: BFS benchmark finds valid shortest path length');
      assert(extracted.benchmarkM.bfsNodesExplored > 0, 'Test 4.4: BFS benchmark records node expansion count');
    } catch (e) {
      assert(false, 'Test 4: Generated Maze Threw Exception', e.message);
    }

    console.log(`\n----------------------------------------------------`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed.`);
    console.log('====================================================\n');
    return failed === 0;
  }
}

// Auto-run if executed directly via Node CLI (safely guarded for browser compatibility)
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  Promise.all([import('path'), import('url')]).then(([pathMod, urlMod]) => {
    if (urlMod.fileURLToPath(import.meta.url) === pathMod.default.resolve(process.argv[1])) {
      FeatureExtractorTestSuite.runAll();
    }
  }).catch(() => {});
}
