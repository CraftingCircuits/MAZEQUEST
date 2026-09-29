/**
 * MazeQuest — Procedural Maze Generator
 * Algorithm: Recursive Backtracking (DFS-based Maze Generation)
 * Supports optional seed for 100% reproducible maze generation.
 * Phase 4 & Phase 8B Implementation
 */

export class MazeGenerator {
  /**
   * Generates a procedurally generated maze for a specified difficulty level.
   * 
   * @param {string} difficulty - Difficulty mode: 'EASY' | 'MEDIUM' | 'HARD'
   * @param {number|null} seed - Optional random seed for reproducible generation
   * @returns {{ grid: Array<Array<number|string>>, startPos: {r: number, c: number}, goalPos: {r: number, c: number}, seed: number|null, difficulty: string }}
   */
  static generateForDifficulty(difficulty = 'MEDIUM', seed = null) {
    const mode = (difficulty || 'MEDIUM').toUpperCase();
    let rows = 21;
    let cols = 21;
    let braidRatio = 0.25;

    if (mode === 'EASY') {
      rows = 15;
      cols = 15;
      braidRatio = 0.10;
    } else if (mode === 'HARD') {
      rows = 25;
      cols = 25;
      braidRatio = 0.40;
    } else {
      // MEDIUM
      rows = 21;
      cols = 21;
      braidRatio = 0.25;
    }

    const result = this.generate(rows, cols, seed, braidRatio);
    result.difficulty = mode;
    return result;
  }

  /**
   * Generates a procedurally generated maze using Recursive Backtracking.
   * Supports controlled dead-end braiding to introduce loops, branching, and alternate routes.
   * 
   * @param {number} rows - Number of grid rows (must be odd, e.g. 15)
   * @param {number} cols - Number of grid columns (must be odd, e.g. 15)
   * @param {number|null} seed - Optional random seed for reproducible generation
   * @param {number} braidRatio - Fraction of dead-ends to convert into loops (0.0 to 1.0)
   * @returns {{ grid: Array<Array<number|string>>, startPos: {r: number, c: number}, goalPos: {r: number, c: number}, seed: number|null }}
   */
  static generate(rows = 15, cols = 15, seed = null, braidRatio = 0) {
    // Ensure odd dimensions for proper wall/path lattice alignment
    const height = rows % 2 === 0 ? rows + 1 : rows;
    const width = cols % 2 === 0 ? cols + 1 : cols;

    // Seeded Random Number Generator (Mulberry32 PRNG)
    const random = seed !== null ? this.createMulberry32(seed) : Math.random;

    // 1. Initialize grid with all walls (1)
    const grid = Array.from({ length: height }, () => Array(width).fill(1));

    // 2. Define Start (1, 1) and Goal (height-2, width-2)
    const startPos = { r: 1, c: 1 };
    const goalPos = { r: height - 2, c: width - 2 };

    // Stack for backtracking
    const stack = [];

    // 3. Mark Start cell as visited path (0) and push to stack
    grid[startPos.r][startPos.c] = 0;
    stack.push({ r: startPos.r, c: startPos.c });

    // 4. Recursive Backtracking loop
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid, height, width);

      if (neighbors.length > 0) {
        // Pick a random unvisited neighbor using PRNG
        const chosen = neighbors[Math.floor(random() * neighbors.length)];

        // Carve wall between current cell and chosen neighbor
        const wallR = (current.r + chosen.r) / 2;
        const wallC = (current.c + chosen.c) / 2;
        grid[wallR][wallC] = 0;

        // Mark chosen neighbor cell as path
        grid[chosen.r][chosen.c] = 0;

        // Push neighbor onto stack
        stack.push(chosen);
      } else {
        // Backtrack
        stack.pop();
      }
    }

    // 5. Controlled Dead-End Braiding (Topology Enhancement for Loops & Alternate Distractor Routes)
    if (braidRatio > 0) {
      this.applyDeadEndBraiding(grid, height, width, startPos, goalPos, braidRatio, random);
    }

    // 6. Assign Start ('S') and Goal ('G') markers
    grid[startPos.r][startPos.c] = 'S';
    grid[goalPos.r][goalPos.c] = 'G';

    return { grid, startPos, goalPos, seed };
  }

  /**
   * Applies controlled braiding by connecting dead-end passages to adjacent paths,
   * creating alternate distractor routes while preserving maze connectivity and validity.
   */
  static applyDeadEndBraiding(grid, height, width, startPos, goalPos, braidRatio, random) {
    const deadEnds = [];
    const directions = [
      { r: -1, c: 0 }, // North
      { r: 1, c: 0 },  // South
      { r: 0, c: -1 }, // West
      { r: 0, c: 1 }   // East
    ];

    // Scan interior path cells for dead-ends (excluding Start and Goal)
    for (let r = 1; r < height - 1; r++) {
      for (let c = 1; c < width - 1; c++) {
        if (grid[r][c] !== 0) continue;
        if ((r === startPos.r && c === startPos.c) || (r === goalPos.r && c === goalPos.c)) continue;

        // Count open path neighbors
        let openNeighbors = 0;
        const candidateWalls = [];

        for (const dir of directions) {
          const nr = r + dir.r;
          const nc = c + dir.c;
          if (grid[nr][nc] === 0 || grid[nr][nc] === 'S' || grid[nr][nc] === 'G') {
            openNeighbors++;
          } else if (grid[nr][nc] === 1) {
            // Check if wall separates this dead-end from an existing path cell on the other side
            const farR = r + dir.r * 2;
            const farC = c + dir.c * 2;
            if (farR > 0 && farR < height - 1 && farC > 0 && farC < width - 1) {
              if (grid[farR][farC] === 0 || grid[farR][farC] === 'S' || grid[farR][farC] === 'G') {
                candidateWalls.push({ r: nr, c: nc });
              }
            }
          }
        }

        // If exactly 1 open neighbor, it's a dead-end
        if (openNeighbors === 1 && candidateWalls.length > 0) {
          deadEnds.push({ r, c, candidateWalls });
        }
      }
    }

    if (deadEnds.length === 0) return;

    // Shuffle deadEnds deterministically using PRNG
    for (let i = deadEnds.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [deadEnds[i], deadEnds[j]] = [deadEnds[j], deadEnds[i]];
    }

    // Carve walls for a fraction of dead-ends defined by braidRatio
    const countToBraid = Math.floor(deadEnds.length * braidRatio);
    for (let i = 0; i < countToBraid; i++) {
      const de = deadEnds[i];
      if (de.candidateWalls.length > 0) {
        const wallToCarve = de.candidateWalls[Math.floor(random() * de.candidateWalls.length)];
        grid[wallToCarve.r][wallToCarve.c] = 0;
      }
    }
  }

  /**
   * Finds unvisited neighbor cells 2 units away in cardinal directions.
   */
  static getUnvisitedNeighbors(cell, grid, height, width) {
    const neighbors = [];
    const directions = [
      { r: -2, c: 0 }, // North
      { r: 2, c: 0 },  // South
      { r: 0, c: -2 }, // West
      { r: 0, c: 2 }   // East
    ];

    for (const dir of directions) {
      const nr = cell.r + dir.r;
      const nc = cell.c + dir.c;

      // Boundary check (keep 1-cell outer wall border)
      if (nr > 0 && nr < height - 1 && nc > 0 && nc < width - 1) {
        // Unvisited means the cell is still a wall (1)
        if (grid[nr][nc] === 1) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }

    return neighbors;
  }

  /**
   * Mulberry32 Seeded Pseudorandom Number Generator.
   * Returns deterministic float in range [0, 1).
   */
  static createMulberry32(seed) {
    let a = seed >>> 0;
    return function() {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}
