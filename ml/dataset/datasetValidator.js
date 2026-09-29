/**
 * MazeQuest — ML Dataset Validator
 * ML Module — Phase 8B Implementation
 * 
 * Conducts automated schema validation, missing value checks, range sanity checks,
 * feature summary statistics (Min, Max, Mean, Median, Std), and class distribution reporting.
 */

export class DatasetValidator {
  /**
   * Validates a generated dataset and returns a comprehensive validation report.
   * 
   * @param {Array<Object>} records - Array of dataset records
   * @param {Object} options - Validation options
   * @returns {Object} Validation report containing checks, warnings, class distribution, and feature stats
   */
  static validate(records, options = {}) {
    if (!records || !Array.isArray(records) || records.length === 0) {
      return { valid: false, errors: ['Dataset is empty or null'], stats: {} };
    }

    const errors = [];
    const warnings = [];
    const totalRecords = records.length;

    const expectedFields = [
      'maze_id', 'seed', 'height', 'width', 'total_cells', 'open_cell_count', 'wall_count',
      'wall_density', 'dead_end_count', 'dead_end_ratio', 'branching_point_count', 'branching_ratio',
      'straight_corridor_count', 'straight_corridor_ratio', 'turn_corridor_count', 'turn_corridor_ratio',
      'shortest_path_length', 'manhattan_dist', 'path_detour_factor', 'bfs_nodes_explored',
      'search_expansion_ratio', 'complexity_index_search', 'split', 'difficulty'
    ];

    const modelInputFeaturesX = [
      'wall_density', 'dead_end_ratio', 'branching_ratio', 'straight_corridor_ratio', 'turn_corridor_ratio'
    ];

    // 1. Schema & Field Presence Checks
    const firstRow = records[0];
    for (const field of expectedFields) {
      if (!(field in firstRow)) {
        errors.push(`Missing field in schema: ${field}`);
      }
    }

    // 2. Row-by-Row Integrity Checks
    let nanCount = 0;
    let infCount = 0;
    let invalidRatioCount = 0;
    let invalidDetourCount = 0;
    let invalidDifficultyCount = 0;

    const classDistTotal = { 0: 0, 1: 0, 2: 0 };
    const classDistTrain = { 0: 0, 1: 0, 2: 0 };
    const classDistTest = { 0: 0, 1: 0, 2: 0 };

    for (let i = 0; i < records.length; i++) {
      const r = records[i];

      // Check numeric validity for numerical fields
      for (const field of expectedFields) {
        if (field === 'maze_id' || field === 'split') continue;
        const val = r[field];

        if (typeof val !== 'number' || Number.isNaN(val)) {
          nanCount++;
          errors.push(`Row ${i} (${r.maze_id}): Field ${field} is NaN or non-number`);
        } else if (!Number.isFinite(val)) {
          infCount++;
          errors.push(`Row ${i} (${r.maze_id}): Field ${field} is Infinity`);
        }
      }

      // Check spatial ratio bounds [0, 1]
      for (const f of modelInputFeaturesX) {
        const val = r[f];
        if (val < 0.0 || val > 1.0) {
          invalidRatioCount++;
          errors.push(`Row ${i} (${r.maze_id}): Feature ${f} out of range [0, 1]: ${val}`);
        }
      }

      // Check detour factor bounds (should be >= 1.0 for valid 4-dir movement when Start != Goal)
      if (r.manhattan_dist > 0 && r.path_detour_factor < 0.999) {
        invalidDetourCount++;
        warnings.push(`Row ${i} (${r.maze_id}): Path detour factor < 1.0: ${r.path_detour_factor}`);
      }

      // Check difficulty class bounds
      if (![0, 1, 2].includes(r.difficulty)) {
        invalidDifficultyCount++;
        errors.push(`Row ${i} (${r.maze_id}): Invalid difficulty class: ${r.difficulty}`);
      } else {
        classDistTotal[r.difficulty]++;
        if (r.split === 'train') classDistTrain[r.difficulty]++;
        if (r.split === 'test') classDistTest[r.difficulty]++;
      }
    }

    // 3. Feature Summary Statistics (Min, Max, Mean, Median, Std)
    const featureStats = {};
    const numericalFields = expectedFields.filter(f => f !== 'maze_id' && f !== 'split');

    for (const field of numericalFields) {
      const values = records.map(r => r[field]).filter(v => typeof v === 'number' && !Number.isNaN(v));
      values.sort((a, b) => a - b);

      const count = values.length;
      const min = values[0];
      const max = values[count - 1];
      const sum = values.reduce((acc, v) => acc + v, 0);
      const mean = sum / count;
      const median = values[Math.floor(count / 2)];

      const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
      const std = Math.sqrt(variance);

      const uniqueValues = new Set(values).size;
      const zeroValues = values.filter(v => v === 0).length;

      featureStats[field] = {
        min: Number(min.toFixed(4)),
        max: Number(max.toFixed(4)),
        mean: Number(mean.toFixed(4)),
        median: Number(median.toFixed(4)),
        std: Number(std.toFixed(4)),
        uniqueValues,
        zeroValues
      };
    }

    const isValid = errors.length === 0;

    return {
      valid: isValid,
      totalRecords,
      errors: errors.slice(0, 20), // Cap output preview
      warnings: warnings.slice(0, 20),
      classDistributions: {
        total: classDistTotal,
        train: classDistTrain,
        test: classDistTest
      },
      featureStats
    };
  }

  /**
   * Prints a formatted summary table of feature statistics to console.
   */
  static printSummary(report) {
    console.log('====================================================');
    console.log('   MAZEQUEST — DATASET VALIDATION REPORT            ');
    console.log('====================================================');
    console.log(`Status: ${report.valid ? 'VALIDATED (PASS)' : 'INVALID (FAIL)'}`);
    console.log(`Total Records: ${report.totalRecords}`);
    console.log(`Class Distribution (Total): Easy (0): ${report.classDistributions.total[0]}, Medium (1): ${report.classDistributions.total[1]}, Hard (2): ${report.classDistributions.total[2]}`);
    console.log(`Class Distribution (Train): Easy (0): ${report.classDistributions.train[0]}, Medium (1): ${report.classDistributions.train[1]}, Hard (2): ${report.classDistributions.train[2]}`);
    console.log(`Class Distribution (Test) : Easy (0): ${report.classDistributions.test[0]}, Medium (1): ${report.classDistributions.test[1]}, Hard (2): ${report.classDistributions.test[2]}\n`);

    console.log('--- FEATURE SUMMARY STATISTICS ---');
    console.table(report.featureStats);
    console.log('====================================================\n');
  }
}
