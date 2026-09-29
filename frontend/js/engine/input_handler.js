/**
 * MazeQuest — Keyboard Input Handler
 * Phase 3 Playable Engine
 */

export class InputHandler {
  constructor(onMoveCallback) {
    this.onMove = onMoveCallback;
    this.boundKeyDownHandler = this.handleKeyDown.bind(this);
    this.isEnabled = false;
  }

  enable() {
    if (!this.isEnabled) {
      window.addEventListener('keydown', this.boundKeyDownHandler);
      this.isEnabled = true;
    }
  }

  disable() {
    if (this.isEnabled) {
      window.removeEventListener('keydown', this.boundKeyDownHandler);
      this.isEnabled = false;
    }
  }

  handleKeyDown(event) {
    let dr = 0;
    let dc = 0;

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        dr = -1;
        dc = 0;
        break;

      case 'ArrowDown':
      case 'KeyS':
        dr = 1;
        dc = 0;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        dr = 0;
        dc = -1;
        break;

      case 'ArrowRight':
      case 'KeyD':
        dr = 0;
        dc = 1;
        break;

      default:
        return; // Ignore other keys
    }

    // Prevent arrow key page scrolling
    event.preventDefault();

    if (dr !== 0 || dc !== 0) {
      this.onMove(dr, dc);
    }
  }
}
