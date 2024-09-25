import Sprite from "../../shared/Sprite.ts";

interface BallProps {
  element: HTMLElement;
  handPosition: number; // The position of the hand (initial position of the ball)
  initialHoldTimeMin: number; // Pause min duration in milliseconds
  initialHoldTimeMax: number; // Pause max duration in milliseconds
}

export default class Ball extends Sprite {
  private gravity: number = 1; // Gravity value
  private initialVelocity: number = 25; // Initial velocity for throwing the ball up
  private positionY: number; // Current position of the ball
  private velocityY: number; // Current velocity of the ball
  private readonly handPosition: number;

  private lastUpdate: number = 0;
  private initialPauseMin: number = 1000;
  private initalPauseMax: number = 2000;
  public pauseDuration: number = 0;
  public isFlying: boolean = false; // State to check if the ball is flying

  constructor({
    element,
    handPosition,
    initialHoldTimeMin,
    initialHoldTimeMax,
  }: BallProps) {
    super(element);
    this.handPosition = handPosition;
    this.initialPauseMin = initialHoldTimeMin;
    this.initalPauseMax = initialHoldTimeMax;
    this.positionY = handPosition; // Start from the hand position
    this.velocityY = this.initialVelocity; // Start with the initial upward velocity
  }

  public setHoldTime(min: number, max: number): void {
    if (this.pauseDuration >= min && this.pauseDuration <= max) return;
    this.initialPauseMin = min;
    this.initalPauseMax = max;
  }

  public getHoldTime(): number {
    return Math.floor(
      Math.random() * (this.initalPauseMax - this.initialPauseMin + 1000) +
        this.initialPauseMin,
    );
  }

  public updatePosition(timestamp: number): void {
    super.update();
    if (timestamp - this.lastUpdate < this.pauseDuration && !this.isFlying) {
      return; // Skip the update during pause duration
    }

    if (!this.isFlying) {
      // The ball is now starting to fly
      this.isFlying = true;
    }

    // Apply gravity to velocity
    this.velocityY -= this.gravity;

    // Update vertical position based on velocity
    this.positionY += this.velocityY;

    // Apply position to the ball element
    this.element.style.bottom = this.positionY + "px";

    // Check if the ball has reached the hand position (bottom position)
    if (this.positionY <= this.handPosition) {
      // Reset position and velocity to simulate throwing the ball again after a delay
      this.positionY = this.handPosition;
      this.velocityY = this.initialVelocity; // Reset the velocity for the next throw

      // Set the last update timestamp to implement the pause
      this.lastUpdate = timestamp;
      this.isFlying = false; // The ball is not flying when caught
      this.gravity = Math.random() * (1.1 - 0.9) + 0.9;
      this.pauseDuration = this.getHoldTime();
    }
  }
}
