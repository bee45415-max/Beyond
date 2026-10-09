import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';

export class GameCamera {
  // World coordinates of top-left corner of visible frame
  public x: number = 0;
  public y: number = 0;

  // Logical units inside game coordinate system
  public viewportWidth: number = 960;
  public viewportHeight: number = 540;

  // Actual physical screen/canvas dimensions
  public screenWidth: number = 960;
  public screenHeight: number = 540;
  public dpr: number = 1;
  public scale: number = 1;

  // Target coordinates in world
  public targetX: number = 1250;
  public targetY: number = 1140;

  // Smoothing & lead
  public followSpeed: number = 7.5; // smooth damping
  public leadOffsetX: number = 0;
  public leadOffsetY: number = 0;
  public zoom: number = 1.0;

  // Screen shake
  public shakeDuration: number = 0;
  public shakeIntensity: number = 0;

  // Expandability hooks for stage 2+: vehicle or focus lock
  public trackingMode: 'player' | 'vehicle' | 'cinematic' | 'locked' = 'player';
  public lockedBounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null;

  constructor(initialX: number = 1250, initialY: number = 1140) {
    this.targetX = initialX;
    this.targetY = initialY;
    this.x = initialX - this.viewportWidth / 2;
    this.y = initialY - this.viewportHeight / 2;
  }

  /**
   * Resize logical game viewport according to screen size & device pixel ratio
   * Base logical vertical view height is 580 units, expanding horizontally with aspect ratio.
   */
  public resize(screenWidth: number, screenHeight: number, dpr: number = 1) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.dpr = Math.max(1, Math.min(3, dpr));

    const aspect = screenWidth / Math.max(1, screenHeight);
    const targetHeight = 560 / this.zoom;
    this.viewportHeight = targetHeight;
    this.viewportWidth = targetHeight * aspect;

    this.scale = screenHeight / this.viewportHeight;
  }

  public setZoom(zoom: number) {
    this.zoom = Math.max(0.5, Math.min(2.0, zoom));
    this.resize(this.screenWidth, this.screenHeight, this.dpr);
  }

  public triggerShake(intensity: number = 8, duration: number = 0.25) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  public update(
    targetX: number,
    targetY: number,
    facingDir: 'left' | 'right',
    isMoving: boolean,
    dt: number,
    boundWidth: number = WORLD_WIDTH,
    boundHeight: number = WORLD_HEIGHT
  ) {
    this.targetX = targetX;
    this.targetY = targetY;

    // Smooth forward lookahead based on player movement & facing direction
    const desiredLeadX = isMoving ? (facingDir === 'right' ? 60 : -60) : (facingDir === 'right' ? 25 : -25);
    this.leadOffsetX += (desiredLeadX - this.leadOffsetX) * Math.min(1, dt * 3.0);

    const desiredCamX = this.targetX + this.leadOffsetX - this.viewportWidth / 2;
    const desiredCamY = this.targetY - this.viewportHeight / 2;

    // Clamp camera within world boundaries so it never reveals outer void
    const minX = 0;
    const maxX = Math.max(0, boundWidth - this.viewportWidth);
    const minY = 0;
    const maxY = Math.max(0, boundHeight - this.viewportHeight);

    const clampedX = Math.max(minX, Math.min(maxX, desiredCamX));
    const clampedY = Math.max(minY, Math.min(maxY, desiredCamY));

    // Damped exponential lerp for buttery smooth tracking
    const factor = Math.min(1, dt * this.followSpeed);
    this.x += (clampedX - this.x) * factor;
    this.y += (clampedY - this.y) * factor;

    // Shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }
  }

  /**
   * Computes current camera offset including camera shake
   */
  public getRenderOffset(): { x: number; y: number } {
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeDuration > 0 && this.shakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
    }
    return {
      x: this.x + shakeX,
      y: this.y + shakeY,
    };
  }

  /**
   * Frustum / Viewport Culling:
   * Returns true if an entity/prop bounding box is inside the visible screen view.
   */
  public isVisible(x: number, y: number, w: number, h: number, margin: number = 60): boolean {
    const left = this.x - margin;
    const right = this.x + this.viewportWidth + margin;
    const top = this.y - margin;
    const bottom = this.y + this.viewportHeight + margin;

    return x + w >= left && x <= right && y + h >= top && y <= bottom;
  }

  /**
   * Convert world coordinates to screen/canvas coordinates
   */
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const offset = this.getRenderOffset();
    return {
      x: (worldX - offset.x) * this.scale,
      y: (worldY - offset.y) * this.scale,
    };
  }

  /**
   * Convert screen touch/mouse coordinates to world coordinates
   */
  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const offset = this.getRenderOffset();
    return {
      x: screenX / this.scale + offset.x,
      y: screenY / this.scale + offset.y,
    };
  }
}
