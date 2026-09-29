/**
 * MazeQuest — Main Script Entry Point
 * Phase 6D AI Search Architecture & Solvers Integration
 */

import { App } from './app.js';
import { runBFSTests } from '../../ai/bfs/bfs_test.js';
import { runDFSTests } from '../../ai/dfs/dfs_test.js';
import { runBestFirstTests } from '../../ai/best_first/best_first_test.js';
import { runAStarTests } from '../../ai/astar/astar_test.js';
import { FeatureExtractorTestSuite } from '../../ml/features/mazeFeatureExtractor.test.js';
import { DatasetGeneratorTestSuite } from '../../ml/dataset/datasetGenerator.test.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  // Run AI & ML Verification Test Suites in DevTools
  console.log('[MazeQuest Engine] Running Automated AI & ML Feature Extractor Test Suites...');
  runBFSTests();
  runDFSTests();
  runBestFirstTests();
  runAStarTests();
  FeatureExtractorTestSuite.runAll();
  DatasetGeneratorTestSuite.runAll();
});

