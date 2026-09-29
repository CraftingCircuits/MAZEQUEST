/**
 * MazeQuest — AI Search Visualization Controller
 * Phase 7A Implementation
 */

export class AIVisualizer {
  /**
   * @param {CanvasRenderer} renderer - The canvas rendering engine instance
   * @param {GameState} gameState - Current game state
   * @param {Object} uiElements - UI bindings for AI stats display
   */
  constructor(renderer, gameState, uiElements = {}) {
    this.renderer = renderer;
    this.gameState = gameState;
    this.uiElements = uiElements;

    // Visualization State
    this.exploredSet = new Set();
    this.pathSet = new Set();
    this.currentEvalNode = null;
    this.animationTimer = null;
    this.isAnimating = false;

    // Speed Presets (delay in ms per frame)
    this.speedDelays = {
      slow: 70,
      normal: 25,
      fast: 8
    };
    this.currentSpeed = 'normal';
  }

  setSpeed(speedKey) {
    if (this.speedDelays[speedKey] !== undefined) {
      this.currentSpeed = speedKey;
    }
  }

  getDelay() {
    return this.speedDelays[this.currentSpeed] || 25;
  }

  /**
   * Cancels any active animation loop and resets overlay state.
   */
  cancel() {
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    this.isAnimating = false;
    this.exploredSet.clear();
    this.pathSet.clear();
    this.currentEvalNode = null;
    this.renderCurrentState();
  }

  /**
   * Clears overlay without triggering full maze re-render
   */
  clearOverlay() {
    this.cancel();
    if (this.uiElements.statsPanel) {
      this.uiElements.statsPanel.classList.add('hidden');
    }
  }

  /**
   * Main entry point to start animating a SearchResult object.
   * 
   * @param {SearchResult} searchResult 
   * @param {Function} onCompleteCallback 
   */
  visualize(searchResult, onCompleteCallback = null) {
    // 1. Cancel previous animation & reset overlay
    this.cancel();

    if (!searchResult) return;

    this.isAnimating = true;

    // Display Factual Search Statistics immediately (Execution time measures pure solver run)
    this.displayStats(searchResult);

    const visitedNodes = searchResult.visitedNodes || [];
    const finalPath = searchResult.path || [];

    let visitedIndex = 0;

    // 2. Step-by-step Exploration Animation Loop
    const animateExplorationStep = () => {
      if (!this.isAnimating) return;

      if (visitedIndex < visitedNodes.length) {
        const node = visitedNodes[visitedIndex];
        this.currentEvalNode = node;
        this.exploredSet.add(`${node.r},${node.c}`);
        visitedIndex++;

        this.renderCurrentState();
        this.animationTimer = setTimeout(animateExplorationStep, this.getDelay());
      } else {
        // Exploration Animation Complete -> Animate Final Path
        this.currentEvalNode = null;
        if (searchResult.success && finalPath.length > 0) {
          this.animateFinalPath(finalPath, onCompleteCallback);
        } else {
          this.isAnimating = false;
          this.renderCurrentState();
          if (onCompleteCallback) onCompleteCallback();
        }
      }
    };

    animateExplorationStep();
  }

  /**
   * Animates final path sequence after exploration loop completes
   */
  animateFinalPath(pathNodes, onCompleteCallback) {
    let pathIndex = 0;

    const animatePathStep = () => {
      if (!this.isAnimating) return;

      if (pathIndex < pathNodes.length) {
        const node = pathNodes[pathIndex];
        this.pathSet.add(`${node.r},${node.c}`);
        pathIndex++;

        this.renderCurrentState();
        this.animationTimer = setTimeout(animatePathStep, Math.max(15, this.getDelay()));
      } else {
        this.isAnimating = false;
        this.renderCurrentState();
        if (onCompleteCallback) onCompleteCallback();
      }
    };

    animatePathStep();
  }

  /**
   * Triggers canvas render passing temporary visualization overlay state
   */
  renderCurrentState() {
    this.renderer.render(this.gameState, {
      exploredSet: this.exploredSet,
      pathSet: this.pathSet,
      currentEvalNode: this.currentEvalNode
    });
  }

  /**
   * Displays pure solver statistics in UI HUD
   */
  displayStats(result) {
    if (!this.uiElements.statsPanel) return;

    this.uiElements.statsPanel.classList.remove('hidden');

    if (this.uiElements.algName) {
      this.uiElements.algName.textContent = result.algorithm;
    }
    if (this.uiElements.foundStatus) {
      this.uiElements.foundStatus.textContent = result.success ? 'Yes' : 'No';
      this.uiElements.foundStatus.style.color = result.success ? '#6ee7b7' : '#f87171';
    }
    if (this.uiElements.pathLen) {
      this.uiElements.pathLen.textContent = result.success ? `${result.pathLength} steps` : 'N/A';
    }
    if (this.uiElements.nodesExplored) {
      this.uiElements.nodesExplored.textContent = result.nodesExplored;
    }
    if (this.uiElements.execTime) {
      this.uiElements.execTime.textContent = `${result.executionTimeMs} ms`;
    }
  }
}
