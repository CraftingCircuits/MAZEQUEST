/**
 * MazeQuest — Canvas Renderer Engine
 * Phase 7A AI Search Visualization Support
 */

import { RENDER_THEME } from '../config.js';

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
  }

  /**
   * Main render method. Draws maze grid, walls, AI visualization overlay, start/goal markers, and player avatar.
   * 
   * @param {GameState} gameState 
   * @param {Object} vizState - Optional visualization overlay state
   * @param {Set<string>} vizState.exploredSet - Set of explored cell coordinates ("r,c")
   * @param {Set<string>} vizState.pathSet - Set of final path cell coordinates ("r,c")
   * @param {{r: number, c: number}} vizState.currentEvalNode - Currently evaluating cell
   */
  render(gameState, vizState = {}) {
    const { mazeGrid, height, width, playerPos, startPos, goalPos } = gameState;
    const { exploredSet, pathSet, currentEvalNode } = vizState;

    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    // Calculate Cell Dimensions
    const cellW = canvasW / width;
    const cellH = canvasH / height;

    // Clear Canvas
    this.ctx.clearRect(0, 0, canvasW, canvasH);

    // 1. Draw Grid Cells, Walls & AI Visualization Overlay
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const x = c * cellW;
        const y = r * cellH;
        const cellType = mazeGrid[r][c];

        if (cellType === 1) {
          // Wall Cell
          this.ctx.fillStyle = RENDER_THEME.WALL_COLOR;
          this.ctx.fillRect(x, y, cellW, cellH);

          this.ctx.strokeStyle = RENDER_THEME.WALL_BORDER;
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, cellW, cellH);
        } else {
          // Path Cell
          const key = `${r},${c}`;

          if (pathSet && pathSet.has(key)) {
            // AI Final Path Highlight (Vibrant Emerald)
            this.ctx.fillStyle = 'rgba(16, 185, 129, 0.65)';
            this.ctx.fillRect(x, y, cellW, cellH);
          } else if (exploredSet && exploredSet.has(key)) {
            // AI Explored Node Highlight (Translucent Indigo/Cyan)
            this.ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
            this.ctx.fillRect(x, y, cellW, cellH);
          } else {
            // Standard Walkable Path Tile
            this.ctx.fillStyle = RENDER_THEME.PATH_COLOR;
            this.ctx.fillRect(x, y, cellW, cellH);
          }

          // Subtle Grid Border
          this.ctx.strokeStyle = RENDER_THEME.GRID_LINE_COLOR;
          this.ctx.lineWidth = 0.5;
          this.ctx.strokeRect(x, y, cellW, cellH);
        }
      }
    }

    // 2. Draw Currently Evaluating AI Node (Pulse Marker)
    if (currentEvalNode) {
      const evalX = currentEvalNode.c * cellW;
      const evalY = currentEvalNode.r * cellH;
      this.ctx.fillStyle = 'rgba(56, 189, 248, 0.8)'; // Bright Cyan
      this.ctx.fillRect(evalX, evalY, cellW, cellH);
    }

    // 3. Draw Start Marker ('S')
    this.drawMarker(startPos.r, startPos.c, cellW, cellH, RENDER_THEME.START_COLOR, 'S');

    // 4. Draw Goal Marker ('G')
    this.drawMarker(goalPos.r, goalPos.c, cellW, cellH, RENDER_THEME.GOAL_COLOR, 'G');

    // 5. Draw Player Avatar
    this.drawPlayer(playerPos.r, playerPos.c, cellW, cellH);
  }

  /**
   * Helper to draw Start / Goal markers
   */
  drawMarker(r, c, cellW, cellH, color, text) {
    const padding = cellW * 0.12;
    const x = c * cellW + padding;
    const y = r * cellH + padding;
    const w = cellW - (padding * 2);
    const h = cellH - (padding * 2);

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, 6);
    this.ctx.fill();

    // Text Label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `700 ${Math.floor(cellW * 0.45)}px 'Outfit', sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, c * cellW + cellW / 2, r * cellH + cellH / 2);
  }

  /**
   * Helper to draw Player Avatar with smooth glow effect
   */
  drawPlayer(r, c, cellW, cellH) {
    const centerX = c * cellW + cellW / 2;
    const centerY = r * cellH + cellH / 2;
    const radius = Math.min(cellW, cellH) * 0.32;

    // Glowing outer ring
    this.ctx.save();
    this.ctx.shadowColor = RENDER_THEME.PLAYER_GLOW;
    this.ctx.shadowBlur = 12;

    this.ctx.fillStyle = RENDER_THEME.PLAYER_COLOR;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Inner highlight
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(centerX - radius * 0.25, centerY - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
