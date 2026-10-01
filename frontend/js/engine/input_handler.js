/**
 * MazeQuest — Keyboard & Mobile Touch Input Handler
 * Phase 3 Playable Engine & Touch Controls Integration
 */

export class InputHandler {
  constructor(onMoveCallback) {
    this.onMove = onMoveCallback;
    this.boundKeyDownHandler = this.handleKeyDown.bind(this);
    this.isEnabled = false;
    this.setupTouchControls();
  }

  setupTouchControls() {
    const dpadMap = [
      { id: 'dpad-up', dr: -1, dc: 0 },
      { id: 'dpad-down', dr: 1, dc: 0 },
      { id: 'dpad-left', dr: 0, dc: -1 },
      { id: 'dpad-right', dr: 0, dc: 1 }
    ];

    dpadMap.forEach(({ id, dr, dc }) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const handlePointer = (event) => {
        if (!this.isEnabled) return;
        event.preventDefault();

        // Brief visual active pulse for touch feedback
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 120);

        if (dr !== 0 || dc !== 0) {
          this.onMove(dr, dc);
        }
      };

      // Register Pointer Events for high-performance touch & tap input
      btn.addEventListener('pointerdown', handlePointer);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
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
