/**
 * MazeQuest — ML Dataset Generation Pipeline Executable
 * ML Module — Phase 8B Implementation
 * 
 * Generates the authoritative 2,000 synthetic maze dataset, validates feature distributions,
 * prints summary statistics, and exports data/ml/dataset.csv and data/ml/dataset.json.
 */

import { DatasetGenerator } from './datasetGenerator.js';
import { DatasetValidator } from './datasetValidator.js';

export class DatasetPipeline {
  /**
   * Runs the full dataset generation and validation pipeline.
   * 
   * @param {Object} options
   * @returns {Object} Generated dataset object and validation report
   */
  static run(options = {}) {
    const totalCount = options.totalCount || 2000;
    const seedOffset = options.seedOffset || 10000;

    console.log('====================================================');
    console.log('   MAZEQUEST — PHASE 8B DATASET GENERATION PIPELINE ');
    console.log('====================================================\n');

    const startTime = performance.now();
    const dataset = DatasetGenerator.generateDataset({ totalCount, seedOffset });
    const endTime = performance.now();

    const durationSec = Number(((endTime - startTime) / 1000).toFixed(2));
    console.log(`[DatasetPipeline] Dataset generation completed in ${durationSec} seconds.`);

    // Run Validation Suite
    const validationReport = DatasetValidator.validate(dataset.records);
    DatasetValidator.printSummary(validationReport);

    const csvContent = DatasetGenerator.toCSV(dataset.records);
    const jsonContent = JSON.stringify(dataset.records, null, 2);

    // Save outputs if running in Node environment
    if (typeof process !== 'undefined' && process.cwd) {
      Promise.all([import('fs'), import('path')]).then(([fsMod, pathMod]) => {
        try {
          const outputDir = pathMod.default.resolve(process.cwd(), 'data', 'ml');
          if (!fsMod.default.existsSync(outputDir)) {
            fsMod.default.mkdirSync(outputDir, { recursive: true });
          }

          const csvPath = pathMod.default.join(outputDir, 'dataset.csv');
          const jsonPath = pathMod.default.join(outputDir, 'dataset.json');

          fsMod.default.writeFileSync(csvPath, csvContent, 'utf-8');
          fsMod.default.writeFileSync(jsonPath, jsonContent, 'utf-8');

          console.log(`\n[DatasetPipeline] SUCCESS: Dataset files exported:`);
          console.log(` - CSV:  ${csvPath}`);
          console.log(` - JSON: ${jsonPath}`);
        } catch (err) {
          console.warn(`[DatasetPipeline] Warning: Could not save files to disk (${err.message})`);
        }
      }).catch(() => {});
    }

    return {
      dataset,
      validationReport,
      csvContent,
      jsonContent,
      durationSec
    };
  }
}

// Auto-run if executed directly via Node CLI
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  Promise.all([import('path'), import('url')]).then(([pathMod, urlMod]) => {
    if (urlMod.fileURLToPath(import.meta.url) === pathMod.default.resolve(process.argv[1])) {
      DatasetPipeline.run();
    }
  }).catch(() => {});
}
