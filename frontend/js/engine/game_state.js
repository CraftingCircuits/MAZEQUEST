/**
 * MazeQuest — Game State Manager
 * Phase 5 Level Progression Engine
 */

export class GameState {
  /**
   * @param {Array<Array<number|string>>|{grid: Array, startPos: Object, goalPos: Object, difficulty?: string}} mazeInput 
   */
  constructor(mazeInput) {
    this.currentLevel = 1;
    this.movesCount = 0;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.gameStatus = 'IDLE'; // 'IDLE' | 'PLAYING' | 'SOLVED'
    this.selectedDifficulty = (mazeInput && mazeInput.difficulty) ? mazeInput.difficulty : 'MEDIUM';

    this.loadMaze(mazeInput);
  }

  /**
   * Updates selected difficulty mode
   * @param {string} difficulty - 'EASY' | 'MEDIUM' | 'HARD'
   */
  setSelectedDifficulty(difficulty) {
    if (['EASY', 'MEDIUM', 'HARD'].includes((difficulty || '').toUpperCase())) {
      this.selectedDifficulty = difficulty.toUpperCase();
    }
  }

  /**
   * Loads a new maze data structure into state
   */
  loadMaze(mazeInput) {
    if (mazeInput && mazeInput.grid) {
      this.mazeGrid = mazeInput.grid;
      this.startPos = { ...mazeInput.startPos };
      this.goalPos = { ...mazeInput.goalPos };
      if (mazeInput.difficulty) {
        this.selectedDifficulty = mazeInput.difficulty;
      }
    } else {
      this.mazeGrid = mazeInput;
      this.startPos = { r: 1, c: 1 };
      this.goalPos = { r: mazeInput.length - 2, c: mazeInput[0].length - 2 };
      this.locateStartAndGoal();
    }

    this.height = this.mazeGrid.length;
    this.width = this.mazeGrid[0].length;
    this.playerPos = { ...this.startPos };
  }

  /**
   * Advances the session to the next level with a fresh maze
   * @param {{grid: Array, startPos: Object, goalPos: Object, difficulty?: string}} newMaze 
   */
  advanceToNextLevel(newMaze) {
    this.currentLevel += 1;
    this.stopTimer();
    this.loadMaze(newMaze);
    this.startLevel();
  }

  /**
   * Scans the 2D grid matrix for 'S' and 'G' locations if not provided
   */
  locateStartAndGoal() {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.mazeGrid[r][c] === 'S') {
          this.startPos = { r, c };
        } else if (this.mazeGrid[r][c] === 'G') {
          this.goalPos = { r, c };
        }
      }
    }
  }

  /**
   * Starts or restarts the active level state
   */
  startLevel() {
    this.playerPos = { ...this.startPos };
    this.movesCount = 0;
    this.elapsedSeconds = 0;
    this.gameStatus = 'PLAYING';
    this.startTimer();
  }

  /**
   * Resets the current level state back to start position
   */
  resetLevel() {
    this.stopTimer();
    this.startLevel();
  }

  /**
   * Attempts to move player by row delta (dr) and column delta (dc).
   * Enforces wall collision and boundary checking.
   * @param {number} dr - Row delta (-1, 0, +1)
   * @param {number} dc - Column delta (-1, 0, +1)
   * @returns {{ moved: boolean, solved: boolean }}
   */
  movePlayer(dr, dc) {
    if (this.gameStatus !== 'PLAYING') {
      return { moved: false, solved: false };
    }

    const targetR = this.playerPos.r + dr;
    const targetC = this.playerPos.c + dc;

    // Boundary Check
    if (targetR < 0 || targetR >= this.height || targetC < 0 || targetC >= this.width) {
      return { moved: false, solved: false };
    }

    // Wall Collision Check (1 represents Wall)
    if (this.mazeGrid[targetR][targetC] === 1) {
      return { moved: false, solved: false };
    }

    // Valid Walkable Move
    this.playerPos.r = targetR;
    this.playerPos.c = targetC;
    this.movesCount += 1;

    // Check Goal Completion
    const isGoalReached = (this.playerPos.r === this.goalPos.r && this.playerPos.c === this.goalPos.c);
    
    if (isGoalReached) {
      this.gameStatus = 'SOLVED';
      this.stopTimer();
    }

    return { moved: true, solved: isGoalReached };
  }

  startTimer() {
    this.stopTimer();
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      if (this.gameStatus === 'PLAYING') {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getFormattedTime() {
    const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}
