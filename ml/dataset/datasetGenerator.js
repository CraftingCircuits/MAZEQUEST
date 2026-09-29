/**
 * MazeQuest — ML Dataset Generator
 * ML Module — Phase 8B Implementation
 * 
 * Generates 2,000 synthetic mazes, extracts spatial features X and search benchmark metrics M_target,
 * performs an 80%/20% Train/Test split, computes quantile cuts EXCLUSIVELY on the Training split,
 * and exports dataset.json and dataset.csv to data/ml/.
 */

import { MazeGenerator } from '../../maze/maze_generator.js';
import { MazeFeatureExtractor } from '../features/mazeFeatureExtractor.js';

export class DatasetGenerator {
  /**
   * Generates the synthetic dataset of 2,000 mazes.
   * 
   * @param {Object} options
   * @param {number} options.totalCount - Default 2000
   * @param {number} options.seedOffset - Master seed offset
   * @returns {Object} Dataset object containing records, train/test splits, thresholds, and stats
   */
  static generateDataset(options = {}) {
    const totalCount = options.totalCount || 2000;
    const seedOffset = options.seedOffset || 10000;

    console.log(`[DatasetGenerator] Generating ${totalCount} synthetic mazes...`);

    // Size distribution: 40% (15x15), 40% (21x21), 20% (25x25)
    const count15 = Math.round(totalCount * 0.40); // 800
    const count21 = Math.round(totalCount * 0.40); // 800
    const count25 = totalCount - count15 - count21; // 400

    const sizePlan = [
      ...Array(count15).fill({ rows: 15, cols: 15 }),
      ...Array(count21).fill({ rows: 21, cols: 21 }),
      ...Array(count25).fill({ rows: 25, cols: 25 })
    ];

    const records = [];
    let accepted = 0;
    let rejected = 0;
    const rejectionReasons = {};

    let index = 0;
    while (records.length < totalCount && index < sizePlan.length * 2) {
      const plan = sizePlan[records.length % sizePlan.length];
      const currentSeed = seedOffset + index;
      index++;

      const maze = MazeGenerator.generate(plan.rows, plan.cols, currentSeed);
      const validation = this.validateMaze(maze);

      if (!validation.valid) {
        rejected++;
        rejectionReasons[validation.reason] = (rejectionReasons[validation.reason] || 0) + 1;
        continue;
      }

      const extracted = MazeFeatureExtractor.extract(maze.grid, maze.startPos, maze.goalPos);
      if (!extracted || !extracted.benchmarkM || !extracted.featuresX) {
        rejected++;
        rejectionReasons['Extraction failed'] = (rejectionReasons['Extraction failed'] || 0) + 1;
        continue;
      }

      const recordId = `MAZE_${String(records.length + 1).padStart(5, '0')}`;
      const fX = extracted.featuresX;
      const bM = extracted.benchmarkM;

      records.push({
        maze_id: recordId,
        seed: currentSeed,
        height: fX.height,
        width: fX.width,
        total_cells: fX.totalCells,
        open_cell_count: fX.openCellCount,
        wall_count: fX.wallCount,
        wall_density: fX.wallDensity,
        dead_end_count: fX.deadEndCount,
        dead_end_ratio: fX.deadEndRatio,
        branching_point_count: fX.branchingPointCount,
        branching_ratio: fX.branchingPointRatio,
        straight_corridor_count: fX.straightCorridorCount,
        straight_corridor_ratio: fX.straightCorridorRatio,
        turn_corridor_count: fX.turnCorridorCount,
        turn_corridor_ratio: fX.turnCorridorRatio,

        // Benchmark Metrics (Excluded from ML Model Feature Vector X)
        shortest_path_length: bM.shortestPathLength,
        manhattan_dist: bM.manhattanDistance,
        path_detour_factor: bM.pathDetourFactor,
        bfs_nodes_explored: bM.bfsNodesExplored,
        search_expansion_ratio: bM.searchExpansionRatio,
        complexity_index_search: bM.complexityIndexSearch,

        // Split & Target Label
        split: '',
        difficulty: -1
      });

      accepted++;
    }

    console.log(`[DatasetGenerator] Generation complete. Accepted: ${accepted}, Rejected: ${rejected}`);

    // 2. Deterministic Train/Test Split (80% Train, 20% Test)
    const shuffled = this.deterministicShuffle(records, 42);
    const trainCount = Math.round(totalCount * 0.80); // 1,600

    const trainRecords = shuffled.slice(0, trainCount);
    const testRecords = shuffled.slice(trainCount);

    trainRecords.forEach(r => { r.split = 'train'; });
    testRecords.forEach(r => { r.split = 'test'; });

    // 3. Compute Quantile Cut Thresholds EXCLUSIVELY on Training Split
    const trainScores = trainRecords.map(r => r.complexity_index_search).sort((a, b) => a - b);
    const p33 = this.quantile(trainScores, 0.333);
    const p66 = this.quantile(trainScores, 0.667);

    console.log(`[DatasetGenerator] Training Split Quantile Thresholds: P33.3 = ${p33.toFixed(4)}, P66.7 = ${p66.toFixed(4)}`);

    // 4. Apply Fixed Training Thresholds to Label BOTH Train & Test Records
    const applyLabel = (r) => {
      if (r.complexity_index_search <= p33) {
        r.difficulty = 0; // Easy
      } else if (r.complexity_index_search <= p66) {
        r.difficulty = 1; // Medium
      } else {
        r.difficulty = 2; // Hard
      }
    };

    trainRecords.forEach(applyLabel);
    testRecords.forEach(applyLabel);

    // Reassemble full dataset in original maze_id order
    const labeledMap = new Map();
    [...trainRecords, ...testRecords].forEach(r => labeledMap.set(r.maze_id, r));
    const finalRecords = records.map(r => labeledMap.get(r.maze_id));

    return {
      records: finalRecords,
      trainRecords,
      testRecords,
      thresholds: { p33, p66 },
      stats: {
        totalGenerated: index,
        accepted,
        rejected,
        rejectionReasons
      }
    };
  }

  /**
   * Validates structural integrity of a generated maze.
   */
  static validateMaze(maze) {
    if (!maze || !maze.grid || maze.grid.length === 0) {
      return { valid: false, reason: 'Empty or null grid' };
    }

    const { grid, startPos, goalPos } = maze;
    const height = grid.length;
    const width = grid[0].length;

    if (startPos.r < 0 || startPos.r >= height || startPos.c < 0 || startPos.c >= width) {
      return { valid: false, reason: 'Start position out of bounds' };
    }
    if (goalPos.r < 0 || goalPos.r >= height || goalPos.c < 0 || goalPos.c >= width) {
      return { valid: false, reason: 'Goal position out of bounds' };
    }

    if (grid[startPos.r][startPos.c] === 1 || grid[goalPos.r][goalPos.c] === 1) {
      return { valid: false, reason: 'Start or goal is on a wall cell' };
    }

    return { valid: true };
  }

  /**
   * Calculates percentile quantile value from sorted array.
   */
  static quantile(sortedArr, q) {
    const pos = (sortedArr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sortedArr[base + 1] !== undefined) {
      return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
    }
    return sortedArr[base];
  }

  /**
   * Deterministic Fisher-Yates shuffle with seed.
   */
  static deterministicShuffle(array, seed) {
    const arr = [...array];
    let m = arr.length;
    let t, i;
    const random = MazeGenerator.createMulberry32(seed);

    while (m) {
      i = Math.floor(random() * m--);
      t = arr[m];
      arr[m] = arr[i];
      arr[i] = t;
    }

    return arr;
  }

  /**
   * Formats records array as a clean CSV string.
   */
  static toCSV(records) {
    if (!records || records.length === 0) return '';
    const headers = Object.keys(records[0]);
    const lines = [headers.join(',')];

    for (const r of records) {
      const row = headers.map(h => r[h]);
      lines.push(row.join(','));
    }

    return lines.join('\n');
  }
}
