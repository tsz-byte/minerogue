/**
 * MineRogue - Input Manager
 * Handles pointer lock, keyboard, mouse, and scroll input.
 */
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this._locked = false;
    this.keys = new Set();
    this._mouseButtons = new Set();
    this._mouseDelta = { x: 0, y: 0 };
    this._scrollDelta = 0;
    this._lockCallbacks = [];
    this._unlockCallbacks = [];

    this._onKeyDown = (e) => {
      this.keys.add(e.code);
    };
    this._onKeyUp = (e) => {
      this.keys.delete(e.code);
    };
    this._onMouseDown = (e) => {
      this._mouseButtons.add(e.button);
    };
    this._onMouseUp = (e) => {
      this._mouseButtons.delete(e.button);
    };
    this._onMouseMove = (e) => {
      if (this._locked) {
        this._mouseDelta.x += e.movementX;
        this._mouseDelta.y += e.movementY;
      }
    };
    this._onWheel = (e) => {
      this._scrollDelta += Math.sign(e.deltaY);
    };
    this._onPointerLockChange = () => {
      const locked = document.pointerLockElement === this.canvas;
      this._locked = locked;
      if (locked) {
        for (const cb of this._lockCallbacks) cb();
      } else {
        for (const cb of this._unlockCallbacks) cb();
      }
    };
    this._onContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('wheel', this._onWheel, { passive: true });
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    this.canvas.addEventListener('contextmenu', this._onContextMenu);
  }

  requestPointerLock() {
    this.canvas.requestPointerLock();
  }

  isLocked() {
    return this._locked;
  }

  isKeyDown(key) {
    return this.keys.has(key);
  }

  isMouseDown(button = 0) {
    return this._mouseButtons.has(button);
  }

  getMouseDelta() {
    return { x: this._mouseDelta.x, y: this._mouseDelta.y };
  }

  getScrollDelta() {
    return this._scrollDelta;
  }

  onMouseLock(callback) {
    this._lockCallbacks.push(callback);
  }

  onMouseUnlock(callback) {
    this._unlockCallbacks.push(callback);
  }

  /**
   * Call each frame to reset per-frame deltas.
   */
  update() {
    this._mouseDelta.x = 0;
    this._mouseDelta.y = 0;
    this._scrollDelta = 0;
  }

  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('wheel', this._onWheel);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    this.canvas.removeEventListener('contextmenu', this._onContextMenu);
  }
}
