/**
 * MazeQuest — Dataset Generator Unit Test Suite
 * Phase 8B Implementation
 */

import { DatasetGenerator } from './datasetGenerator.js';
import { DatasetValidator } from './datasetValidator.js';

export class DatasetGeneratorTestSuite {
  static runAll() {
    console.log('====================================================');
    console.log('   MAZEQUEST — DATASET GENERATOR UNIT TEST SUITE   ');
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

    // Test 1: Synthetic Dataset Generation & Schema Validation
    try {
      // Test generation on 50 sample mazes for fast unit test execution
      const dataset = DatasetGenerator.generateDataset({ totalCount: 50, seedOffset: 5000 });
      
      assert(dataset.records.length === 50, 'Test 1.1: Generates requested dataset record count (50)');
      assert(dataset.trainRecords.length === 40, 'Test 1.2: 80% Train split count correct (40)');
      assert(dataset.testRecords.length === 10, 'Test 1.3: 20% Test split count correct (10)');

      const validation = DatasetValidator.validate(dataset.records);
      assert(validation.valid, 'Test 1.4: Dataset passes automated validation suite without errors');
    } catch (e) {
      assert(false, 'Test 1: Dataset Generation Threw Exception', e.message);
    }

    // Test 2: Train-Only Quantile Threshold Isolation
    try {
      const dataset = DatasetGenerator.generateDataset({ totalCount: 50, seedOffset: 6000 });
      const { p33, p66 } = dataset.thresholds;

      assert(typeof p33 === 'number' && !Number.isNaN(p33), 'Test 2.1: Training P33.3 threshold is valid number');
      assert(typeof p66 === 'number' && !Number.isNaN(p66), 'Test 2.2: Training P66.7 threshold is valid number');
      assert(p33 <= p66, 'Test 2.3: P33.3 <= P66.7 threshold ordering holds');

      // Verify difficulty labels match thresholds
      const allLabelsValid = dataset.records.every(r => {
        if (r.complexity_index_search <= p33) return r.difficulty === 0;
        if (r.complexity_index_search <= p66) return r.difficulty === 1;
        return r.difficulty === 2;
      });

      assert(allLabelsValid, 'Test 2.4: All difficulty labels match training quantile thresholds');
    } catch (e) {
      assert(false, 'Test 2: Quantile Isolation Threw Exception', e.message);
    }

    // Test 3: CSV Export Formatting
    try {
      const dataset = DatasetGenerator.generateDataset({ totalCount: 10, seedOffset: 7000 });
      const csvStr = DatasetGenerator.toCSV(dataset.records);

      assert(typeof csvStr === 'string' && csvStr.length > 0, 'Test 3.1: toCSV returns non-empty string');
      const lines = csvStr.trim().split('\n');
      assert(lines.length === 11, 'Test 3.2: CSV contains 1 header line + 10 data rows');
      assert(lines[0].includes('maze_id') && lines[0].includes('difficulty'), 'Test 3.3: CSV header contains maze_id and difficulty');
    } catch (e) {
      assert(false, 'Test 3: CSV Export Threw Exception', e.message);
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
      DatasetGeneratorTestSuite.runAll();
    }
  }).catch(() => {});
}
