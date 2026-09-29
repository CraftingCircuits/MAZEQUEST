/**
 * MazeQuest — Application Controller Shell
 * Phase 7A AI Search Visualization Engine Integration & Phase 8 Gameplay/UI Improvement
 */

import { APP_CONFIG } from './config.js';
import { GameState } from './engine/game_state.js';
import { CanvasRenderer } from './engine/renderer.js';
import { InputHandler } from './engine/input_handler.js';
import { MazeGenerator } from '../../maze/maze_generator.js';

// AI Solvers & Visualizer
import { BFSSolver } from '../../ai/bfs/bfs.js';
import { DFSSolver } from '../../ai/dfs/dfs.js';
import { BestFirstSolver } from '../../ai/best_first/best_first.js';
import { AStarSolver } from '../../ai/astar/astar.js';
import { AIVisualizer } from '../../ai/visualization/visualizer.js';
import { AIComparator } from '../../ai/comparison/comparator.js';

// Difficulty Theme & UX Configuration
const DIFFICULTY_CONFIG = {
  0: {
    key: 'EASY',
    emoji: '😊',
    title: 'EASY',
    themeClass: 'theme-easy',
    modeClass: 'mode-easy',
    desc: 'Relaxed 15×15 maze with open corridors and gentle distractor routes.'
  },
  1: {
    key: 'MEDIUM',
    emoji: '🤔',
    title: 'MEDIUM',
    themeClass: 'theme-medium',
    modeClass: 'mode-medium',
    desc: 'Balanced 21×21 maze with moderate branching and distractor turns.'
  },
  2: {
    key: 'HARD',
    emoji: '😤',
    title: 'HARD',
    themeClass: 'theme-hard',
    modeClass: 'mode-hard',
    desc: 'Challenging 25×25 maze with dense branching and complex distractor loops.'
  }
};

export class App {
  constructor() {
    this.gameState = null;
    this.renderer = null;
    this.inputHandler = null;
    this.aiVisualizer = null;
    this.hudTimerInterval = null;

    // View Shell DOM Elements
    this.landingShell = null;
    this.difficultyShell = null;
    this.gameShell = null;

    // Navigation & Action Buttons
    this.btnStart = null;
    this.btnBackHome = null;
    this.btnReset = null;
    this.btnNextLevel = null;
    this.btnVictoryChangeDiff = null;
    this.btnChangeDifficulty = null;

    // Difficulty Selector Elements
    this.difficultySlider = null;
    this.difficultyPreview = null;
    this.difficultyEmoji = null;
    this.difficultyTitle = null;
    this.difficultyDesc = null;
    this.btnPlayGame = null;
    this.btnDifficultyHelp = null;

    // HUD Elements
    this.hudLevel = null;
    this.hudMoves = null;
    this.hudTimer = null;
    this.hudMode = null;

    // Overlay & Canvas Elements
    this.victoryOverlay = null;
    this.victoryTitle = null;
    this.victoryStats = null;
    this.canvas = null;

    // AI UI Elements
    this.selectAlgorithm = null;
    this.selectSpeed = null;
    this.btnRunAI = null;
    this.btnCompareAI = null;
    this.btnClearAI = null;

    // Comparison Modal Elements
    this.comparisonModal = null;
    this.btnCloseComparison = null;
    this.comparisonTableBody = null;
    this.chartNodesExplored = null;
    this.chartExecTime = null;
    this.validationNotice = null;
  }

  init() {
    console.log(`[${APP_CONFIG.TITLE}] Initializing AI Search Engine & Difficulty Architecture v${APP_CONFIG.VERSION}...`);

    // Bind Core Shell View Elements
    this.landingShell = document.getElementById('landing-shell');
    this.difficultyShell = document.getElementById('difficulty-shell');
    this.gameShell = document.getElementById('game-shell');

    // Bind Navigation Buttons
    this.btnStart = document.getElementById('btn-start');
    this.btnBackHome = document.getElementById('btn-back-home');
    this.btnReset = document.getElementById('btn-reset');
    this.btnNextLevel = document.getElementById('btn-next-level');
    this.btnVictoryChangeDiff = document.getElementById('btn-victory-change-diff');
    this.btnChangeDifficulty = document.getElementById('btn-change-difficulty');

    // Bind Difficulty Selector Components
    this.difficultySlider = document.getElementById('difficulty-slider');
    this.difficultyPreview = document.getElementById('difficulty-preview');
    this.difficultyEmoji = document.getElementById('difficulty-emoji');
    this.difficultyTitle = document.getElementById('difficulty-title');
    this.difficultyDesc = document.getElementById('difficulty-desc');
    this.btnPlayGame = document.getElementById('btn-play-game');
    this.btnDifficultyHelp = document.getElementById('btn-difficulty-help');

    // Bind HUD Bar Elements
    this.hudLevel = document.getElementById('hud-level');
    this.hudMoves = document.getElementById('hud-moves');
    this.hudTimer = document.getElementById('hud-timer');
    this.hudMode = document.getElementById('hud-mode');

    // Bind Victory & Canvas Elements
    this.victoryOverlay = document.getElementById('victory-overlay');
    this.victoryTitle = document.getElementById('victory-title');
    this.victoryStats = document.getElementById('victory-stats');
    this.canvas = document.getElementById('maze-canvas');

    // Bind AI Control Panel Elements
    this.selectAlgorithm = document.getElementById('select-algorithm');
    this.selectSpeed = document.getElementById('select-speed');
    this.btnRunAI = document.getElementById('btn-run-ai');
    this.btnCompareAI = document.getElementById('btn-compare-ai');
    this.btnClearAI = document.getElementById('btn-clear-ai');

    // Bind Comparison Modal Elements
    this.comparisonModal = document.getElementById('ai-comparison-modal');
    this.btnCloseComparison = document.getElementById('btn-close-comparison');
    this.comparisonTableBody = document.getElementById('comparison-table-body');
    this.chartNodesExplored = document.getElementById('chart-nodes-explored');
    this.chartExecTime = document.getElementById('chart-exec-time');
    this.validationNotice = document.getElementById('comparison-validation-notice');

    if (!this.btnStart || !this.canvas) {
      console.error(`[${APP_CONFIG.TITLE}] Critical: Required DOM elements missing.`);
      return;
    }

    // Generate Initial Default Procedural Maze (Medium 21x21)
    const initialMaze = MazeGenerator.generateForDifficulty('MEDIUM');

    // Initialize Game Engine Modules
    this.gameState = new GameState(initialMaze);
    this.renderer = new CanvasRenderer(this.canvas);
    this.inputHandler = new InputHandler((dr, dc) => this.handlePlayerMove(dr, dc));

    // Initialize AI Visualizer with UI Bindings
    this.aiVisualizer = new AIVisualizer(this.renderer, this.gameState, {
      statsPanel: document.getElementById('ai-stats-panel'),
      algName: document.getElementById('ai-stat-alg'),
      foundStatus: document.getElementById('ai-stat-found'),
      pathLen: document.getElementById('ai-stat-path'),
      nodesExplored: document.getElementById('ai-stat-explored'),
      execTime: document.getElementById('ai-stat-time')
    });

    this.attachEventListeners();
    console.log(`[${APP_CONFIG.TITLE}] Engine initialized successfully.`);
  }

  attachEventListeners() {
    // Flow Navigation
    if (this.btnStart) {
      this.btnStart.addEventListener('click', () => this.showDifficultySelection());
    }
    if (this.btnBackHome) {
      this.btnBackHome.addEventListener('click', () => this.showLanding());
    }
    if (this.btnPlayGame) {
      this.btnPlayGame.addEventListener('click', () => this.startSelectedDifficultyGame());
    }
    if (this.btnChangeDifficulty) {
      this.btnChangeDifficulty.addEventListener('click', () => this.showDifficultySelection());
    }
    if (this.btnVictoryChangeDiff) {
      this.btnVictoryChangeDiff.addEventListener('click', () => this.showDifficultySelection());
    }
    if (this.btnDifficultyHelp) {
      this.btnDifficultyHelp.addEventListener('click', () => this.showDifficultyHelp());
    }

    // Slider & Step Label Listeners
    if (this.difficultySlider) {
      this.difficultySlider.addEventListener('input', (e) => this.onDifficultySliderChange(e.target.value));
    }
    const stepLabels = document.querySelectorAll('.step-label');
    stepLabels.forEach(label => {
      label.addEventListener('click', () => {
        const step = label.getAttribute('data-step');
        if (step !== null && this.difficultySlider) {
          this.difficultySlider.value = step;
          this.onDifficultySliderChange(step);
        }
      });
    });

    // In-game Action Buttons
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.restartCurrentLevel());
    }
    if (this.btnNextLevel) {
      this.btnNextLevel.addEventListener('click', () => this.advanceToNextLevel());
    }

    // AI Controls
    if (this.btnRunAI) {
      this.btnRunAI.addEventListener('click', () => this.runAISolver());
    }
    if (this.btnCompareAI) {
      this.btnCompareAI.addEventListener('click', () => this.runAIComparison());
    }
    if (this.btnCloseComparison) {
      this.btnCloseComparison.addEventListener('click', () => this.closeAIComparison());
    }
    if (this.btnClearAI) {
      this.btnClearAI.addEventListener('click', () => this.clearAIOverlay());
    }
    if (this.selectSpeed) {
      this.selectSpeed.addEventListener('change', (e) => {
        this.aiVisualizer.setSpeed(e.target.value);
      });
    }

    // Close Modal on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.comparisonModal && !this.comparisonModal.classList.contains('hidden')) {
        this.closeAIComparison();
      }
    });
  }

  showLanding() {
    console.log(`[${APP_CONFIG.TITLE}] Navigating to Home Landing...`);
    this.stopHudTimerLoop();
    if (this.aiVisualizer) {
      this.aiVisualizer.cancel();
    }
    if (this.inputHandler) {
      this.inputHandler.disable();
    }

    if (this.difficultyShell) this.difficultyShell.classList.add('hidden');
    if (this.gameShell) this.gameShell.classList.add('hidden');
    if (this.landingShell) this.landingShell.classList.remove('hidden');
  }

  showDifficultySelection() {
    console.log(`[${APP_CONFIG.TITLE}] Navigating to Difficulty Selection Screen...`);
    this.stopHudTimerLoop();
    if (this.aiVisualizer) {
      this.aiVisualizer.cancel();
    }
    if (this.inputHandler) {
      this.inputHandler.disable();
    }

    if (this.landingShell) this.landingShell.classList.add('hidden');
    if (this.gameShell) this.gameShell.classList.add('hidden');
    if (this.difficultyShell) this.difficultyShell.classList.remove('hidden');

    const currentStep = this.difficultySlider ? this.difficultySlider.value : 1;
    this.onDifficultySliderChange(currentStep);
  }

  onDifficultySliderChange(val) {
    const step = parseInt(val, 10);
    const cfg = DIFFICULTY_CONFIG[step] || DIFFICULTY_CONFIG[1];

    if (this.difficultyPreview) {
      this.difficultyPreview.className = `difficulty-preview ${cfg.themeClass}`;
    }
    if (this.difficultySlider) {
      this.difficultySlider.className = `difficulty-slider ${cfg.themeClass}`;
    }
    if (this.btnPlayGame) {
      this.btnPlayGame.className = `btn btn-primary btn-play ${cfg.themeClass}`;
    }

    if (this.difficultyEmoji) this.difficultyEmoji.textContent = cfg.emoji;
    if (this.difficultyTitle) this.difficultyTitle.textContent = cfg.title;
    if (this.difficultyDesc) this.difficultyDesc.textContent = cfg.desc;

    const stepLabels = document.querySelectorAll('.step-label');
    stepLabels.forEach(label => {
      if (label.getAttribute('data-step') === String(step)) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  }

  showDifficultyHelp() {
    alert(
      "MazeQuest Difficulty Modes:\n\n" +
      "• EASY: 15×15 grid with low branching (10% loops). Relaxed escape route.\n" +
      "• MEDIUM: 21×21 grid with moderate branching (25% loops) & distractor turns.\n" +
      "• HARD: 25×25 grid with dense branching (40% loops) & deep exploration."
    );
  }

  startSelectedDifficultyGame() {
    const step = this.difficultySlider ? parseInt(this.difficultySlider.value, 10) : 1;
    const cfg = DIFFICULTY_CONFIG[step] || DIFFICULTY_CONFIG[1];
    const selectedDiff = cfg.key;

    console.log(`[${APP_CONFIG.TITLE}] Starting new game on ${selectedDiff} difficulty...`);

    // Generate fresh maze for selected difficulty
    const newMaze = MazeGenerator.generateForDifficulty(selectedDiff);

    // Initialize fresh GameState with selected difficulty persistence
    this.gameState = new GameState(newMaze);
    this.gameState.setSelectedDifficulty(selectedDiff);

    // Update AI Visualizer state reference
    if (this.aiVisualizer) {
      this.aiVisualizer.gameState = this.gameState;
    } else {
      this.aiVisualizer = new AIVisualizer(this.renderer, this.gameState, {
        statsPanel: document.getElementById('ai-stats-panel'),
        algName: document.getElementById('ai-stat-alg'),
        foundStatus: document.getElementById('ai-stat-found'),
        pathLen: document.getElementById('ai-stat-path'),
        nodesExplored: document.getElementById('ai-stat-explored'),
        execTime: document.getElementById('ai-stat-time')
      });
    }

    // Switch view to Game Shell
    if (this.landingShell) this.landingShell.classList.add('hidden');
    if (this.difficultyShell) this.difficultyShell.classList.add('hidden');
    if (this.gameShell) this.gameShell.classList.remove('hidden');
    if (this.victoryOverlay) this.victoryOverlay.classList.add('hidden');

    // Start level 1 & controls
    this.gameState.startLevel();
    this.inputHandler.enable();
    this.startHudTimerLoop();
    this.updateHUD();
    this.renderer.render(this.gameState);
  }

  runAISolver() {
    const selectedAlg = this.selectAlgorithm ? this.selectAlgorithm.value : 'BFS';
    console.log(`[${APP_CONFIG.TITLE}] Running AI Solver: ${selectedAlg}...`);

    // Cancel any ongoing player/AI overlay animations safely
    this.aiVisualizer.cancel();

    // Execute selected solver synchronously (measures pure algorithm execution)
    let searchResult = null;
    const grid = this.gameState.mazeGrid;
    const start = this.gameState.startPos;
    const goal = this.gameState.goalPos;

    switch (selectedAlg) {
      case 'DFS':
        searchResult = DFSSolver.solve(grid, start, goal);
        break;
      case 'Best-First':
        searchResult = BestFirstSolver.solve(grid, start, goal);
        break;
      case 'A*':
        searchResult = AStarSolver.solve(grid, start, goal);
        break;
      case 'BFS':
      default:
        searchResult = BFSSolver.solve(grid, start, goal);
        break;
    }

    // Pass SearchResult to AI Visualizer for step-by-step animation
    this.aiVisualizer.visualize(searchResult);
  }

  runAIComparison() {
    console.log(`[${APP_CONFIG.TITLE}] Running 4-Algorithm Comparison on Current Maze...`);

    // 1. Cancel any active visualization overlay safely
    if (this.aiVisualizer) {
      this.aiVisualizer.cancel();
    }

    // 2. Execute comparison on current maze grid instance
    const grid = this.gameState.mazeGrid;
    const start = this.gameState.startPos;
    const goal = this.gameState.goalPos;

    const compData = AIComparator.compareAll(grid, start, goal);
    const results = compData.results;

    // 3. Populate Comparison Table
    if (this.comparisonTableBody) {
      this.comparisonTableBody.innerHTML = '';
      results.forEach(r => {
        const tr = document.createElement('tr');
        const pathLenText = r.success ? `${r.pathLength} steps` : '—';
        const foundClass = r.success ? 'highlight-green' : 'highlight-red';
        const foundText = r.success ? 'Yes' : 'No';

        tr.innerHTML = `
          <td class="alg-name-tag">${r.algorithm}</td>
          <td class="${foundClass}">${foundText}</td>
          <td>${pathLenText}</td>
          <td>${r.nodesExplored}</td>
          <td>${r.executionTimeMs} ms</td>
        `;
        this.comparisonTableBody.appendChild(tr);
      });
    }

    // 4. Render Factual Bar Charts (Nodes Explored & Execution Time)
    const maxExplored = Math.max(...results.map(r => r.nodesExplored), 1);
    const maxTime = Math.max(...results.map(r => r.executionTimeMs), 0.001);

    if (this.chartNodesExplored) {
      this.chartNodesExplored.innerHTML = '';
      results.forEach(r => {
        const pct = Math.round((r.nodesExplored / maxExplored) * 100);
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
          <span class="bar-label">${r.algorithm}</span>
          <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
          <span class="bar-value">${r.nodesExplored}</span>
        `;
        this.chartNodesExplored.appendChild(row);
      });
    }

    if (this.chartExecTime) {
      this.chartExecTime.innerHTML = '';
      results.forEach(r => {
        const pct = Math.max(8, Math.round((r.executionTimeMs / maxTime) * 100));
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
          <span class="bar-label">${r.algorithm}</span>
          <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
          <span class="bar-value">${r.executionTimeMs} ms</span>
        `;
        this.chartExecTime.appendChild(row);
      });
    }

    // 5. Render Validation & Consistency Notice
    if (this.validationNotice) {
      this.validationNotice.textContent = compData.validation.astarBfsMessage;
      if (compData.validation.isAStarBfsEqual) {
        this.validationNotice.className = 'validation-notice';
      } else {
        this.validationNotice.className = 'validation-notice warning';
      }
    }

    // 6. Show Modal
    if (this.comparisonModal) {
      this.comparisonModal.classList.remove('hidden');
      this.comparisonModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeAIComparison() {
    if (this.comparisonModal) {
      this.comparisonModal.classList.add('hidden');
      this.comparisonModal.setAttribute('aria-hidden', 'true');
    }
  }

  clearAIOverlay() {
    console.log(`[${APP_CONFIG.TITLE}] Clearing AI overlay...`);
    this.aiVisualizer.clearOverlay();
  }

  handlePlayerMove(dr, dc) {
    // Clear AI visualizer overlay if player moves manually
    if (this.aiVisualizer && this.aiVisualizer.isAnimating) {
      this.aiVisualizer.cancel();
    }

    const { moved, solved } = this.gameState.movePlayer(dr, dc);

    if (moved) {
      this.updateHUD();
      this.renderer.render(this.gameState);
    }

    if (solved) {
      this.handleGoalReached();
    }
  }

  handleGoalReached() {
    console.log(`[${APP_CONFIG.TITLE}] Level ${this.gameState.currentLevel} Completed! Moves: ${this.gameState.movesCount}, Time: ${this.gameState.getFormattedTime()}`);
    
    this.inputHandler.disable();
    this.stopHudTimerLoop();

    if (this.aiVisualizer) {
      this.aiVisualizer.cancel();
    }

    // Display Victory Overlay with level title and statistics
    this.victoryTitle.textContent = `LEVEL ${this.gameState.currentLevel} COMPLETED!`;
    this.victoryStats.textContent = `Moves: ${this.gameState.movesCount} | Time: ${this.gameState.getFormattedTime()}`;
    this.victoryOverlay.classList.remove('hidden');
  }

  advanceToNextLevel() {
    const currentDiff = this.gameState ? this.gameState.selectedDifficulty : 'MEDIUM';
    console.log(`[${APP_CONFIG.TITLE}] Advancing to Level ${this.gameState.currentLevel + 1} (${currentDiff})...`);

    this.victoryOverlay.classList.add('hidden');
    this.closeAIComparison();
    if (this.aiVisualizer) {
      this.aiVisualizer.clearOverlay();
    }
    
    // Generate fresh procedural maze for the next level under the SAME selected difficulty
    const newMaze = MazeGenerator.generateForDifficulty(currentDiff);
    this.gameState.advanceToNextLevel(newMaze);

    this.inputHandler.enable();
    this.startHudTimerLoop();
    this.updateHUD();
    this.renderer.render(this.gameState);
  }

  restartCurrentLevel() {
    console.log(`[${APP_CONFIG.TITLE}] Restarting Level ${this.gameState.currentLevel}...`);

    this.victoryOverlay.classList.add('hidden');
    this.closeAIComparison();
    if (this.aiVisualizer) {
      this.aiVisualizer.clearOverlay();
    }

    this.gameState.resetLevel();

    this.inputHandler.enable();
    this.startHudTimerLoop();
    this.updateHUD();
    this.renderer.render(this.gameState);
  }

  updateHUD() {
    if (this.hudLevel) this.hudLevel.textContent = this.gameState.currentLevel;
    if (this.hudMoves) this.hudMoves.textContent = this.gameState.movesCount;
    if (this.hudTimer) this.hudTimer.textContent = this.gameState.getFormattedTime();
    
    if (this.hudMode && this.gameState) {
      const diff = (this.gameState.selectedDifficulty || 'MEDIUM').toUpperCase();
      this.hudMode.textContent = diff;
      this.hudMode.className = `hud-value mode-${diff.toLowerCase()}`;
    }
  }

  startHudTimerLoop() {
    this.stopHudTimerLoop();
    this.hudTimerInterval = setInterval(() => {
      if (this.gameState.gameStatus === 'PLAYING') {
        if (this.hudTimer) this.hudTimer.textContent = this.gameState.getFormattedTime();
      }
    }, 500);
  }

  stopHudTimerLoop() {
    if (this.hudTimerInterval) {
      clearInterval(this.hudTimerInterval);
      this.hudTimerInterval = null;
    }
  }
}

