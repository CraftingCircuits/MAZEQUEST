/**
 * MazeQuest — Min Priority Queue Helper
 * Algorithm: Binary Min-Heap Priority Queue
 * Phase 6C Implementation
 */

export class PriorityQueue {
  /**
   * Constructs a Min Priority Queue where elements with the lowest priority score are dequeued first.
   * 
   * @param {Function} priorityExtractor - Function returning the numerical priority score for an element
   */
  constructor(priorityExtractor = (element) => element.priority) {
    this.heap = [];
    this.getPriority = priorityExtractor;
    this.insertionCounter = 0; // For deterministic tie-breaking
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Inserts an element into the priority queue.
   * Time Complexity: O(log N)
   */
  push(element, priorityScore) {
    const node = {
      data: element,
      priority: priorityScore,
      id: this.insertionCounter++ // Deterministic tie-breaking
    };
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the element with the lowest priority score.
   * Time Complexity: O(log N)
   * @returns {any} The data of the highest-priority element
   */
  pop() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop().data;

    const top = this.heap[0].data;
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return top;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this._hasHigherPriority(index, parentIdx)) {
        this._swap(index, parentIdx);
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this._hasHigherPriority(leftChild, smallest)) {
        smallest = leftChild;
      }
      if (rightChild < length && this._hasHigherPriority(rightChild, smallest)) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        this._swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  _hasHigherPriority(idxA, idxB) {
    const nodeA = this.heap[idxA];
    const nodeB = this.heap[idxB];

    if (nodeA.priority !== nodeB.priority) {
      return nodeA.priority < nodeB.priority; // Primary: Lower priority score
    }
    return nodeA.id < nodeB.id; // Secondary tie-break: Earlier insertion order
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
