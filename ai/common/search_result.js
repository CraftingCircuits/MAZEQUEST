/**
 * MazeQuest — Common AI Search Result Interface
 * Phase 6A Implementation
 */

export class SearchResult {
  /**
   * Constructs a standardized search result object for AI algorithms.
   * 
   * @param {Object} params
   * @param {string} params.algorithm - Name of the search algorithm (e.g. "BFS")
   * @param {boolean} params.success - Whether a valid path from Start to Goal was found
   * @param {Array<{r: number, c: number}>} params.path - Sequence of coordinates from Start to Goal
   * @param {Array<{r: number, c: number}>} params.visitedNodes - Sequence of explored coordinates in search order
   * @param {number} params.nodesExplored - Total number of nodes popped from search queue/stack
   * @param {number} params.executionTimeMs - Pure execution duration of the search algorithm in milliseconds
   */
  constructor({
    algorithm = 'UNKNOWN',
    success = false,
    path = [],
    visitedNodes = [],
    nodesExplored = 0,
    executionTimeMs = 0.0
  }) {
    this.algorithm = algorithm;
    this.success = success;
    this.path = path;
    this.visitedNodes = visitedNodes;
    this.pathLength = success && path.length > 0 ? path.length - 1 : 0;
    this.nodesExplored = nodesExplored;
    this.executionTimeMs = Number(executionTimeMs.toFixed(3));
  }
}
