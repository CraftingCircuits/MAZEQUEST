/**
 * MazeQuest — Application Configuration & Constants
 * Phase 3 Playable Engine
 */

export const APP_CONFIG = {
  TITLE: 'MazeQuest',
  TAGLINE: 'Find the path. Outsmart the maze.',
  VERSION: '0.3.0-phase3',
  DIFFICULTY_LEVELS: ['Easy', 'Medium', 'Hard']
};

/**
 * Phase 3 Fixed Test Maze Grid (11 x 11)
 * Legend:
 *  1   = Wall Cell
 *  0   = Walkable Path Cell
 * 'S'  = Start Cell (1, 1)
 * 'G'  = Goal Cell (9, 9)
 */
export const FIXED_TEST_MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 'S', 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 'G', 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

/**
 * Rendering Color Palette
 */
export const RENDER_THEME = {
  WALL_COLOR: '#1e293b',       // Dark slate
  WALL_BORDER: '#334155',
  PATH_COLOR: '#0f172a',       // Deep navy
  START_COLOR: '#10b981',      // Emerald Green
  GOAL_COLOR: '#ef4444',       // Crimson Red
  PLAYER_COLOR: '#6366f1',     // Indigo Accent
  PLAYER_GLOW: '#818cf8',
  GRID_LINE_COLOR: 'rgba(255, 255, 255, 0.04)'
};
