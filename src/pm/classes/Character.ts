import Sprite from "../../shared/Sprite.ts";

interface CharacterProps {
  element: HTMLElement;
  gravity: number;
  gracePeriod?: number;
}

const ORIGINAL_LEFT = 80;

export default class Character extends Sprite {
  bottom: number;
  left: number;
  jumpSpeed: number;
  gravity: number;
  jumping: boolean;
  gracePeriod: number; // Invulnerability period
  invincibilityFrames: boolean;
  initialProps: Required<CharacterProps>;
  jumpCallback: (() => any | null) | undefined;
  originalScale: number;
  targetHeight: number | null;
  targetLeft: number | null;

  constructor({ element, gravity, gracePeriod = 800 }: CharacterProps) {
    super(element);
    this.bottom = 0;
    this.left = ORIGINAL_LEFT; // Init left position
    this.jumpSpeed = 0;
    this.gravity = gravity;
    this.jumping = false;
    this.gracePeriod = gracePeriod;
    this.invincibilityFrames = false;

    this.initialProps = { element, gravity: gravity, gracePeriod: gracePeriod };
    this.originalScale = 1;
    this.targetHeight = null;
    this.targetLeft = null;
  }

  jump(height: number, left: number, callback?: () => any) {
    if (this.jumping) return;
    this.jumping = true;
    this.jumpSpeed = 15;
    this.targetHeight = height;
    this.targetLeft = left;
    this.jumpCallback = callback;
  }

  update() {
    super.update();
    if (this.jumping) {
      this.bottom += this.jumpSpeed;
      if (this.targetLeft !== null && this.targetHeight !== null) {
        const leftIncrement =
          (this.targetLeft - ORIGINAL_LEFT) /
          (this.targetHeight / this.jumpSpeed);
        this.left += leftIncrement;
      }

      const scaleFactor = Math.max(0.1, 1 - this.bottom / 1000);
      this.element.style.transform = `scale(${scaleFactor})`;

      if (this.targetHeight !== null && this.bottom >= this.targetHeight) {
        this.bottom = this.targetHeight;
        if (this.targetLeft !== null) {
          this.left = this.targetLeft;
        }
        this.jumpSpeed = 0;
        this.jumping = false;
        this.targetHeight = null;
        this.targetLeft = null;
        this.jumpCallback?.();
        this.jumpCallback = undefined;
      }
    }
    this.element.style.bottom = this.bottom + "px";
    this.element.style.left = this.left + "px";
  }

  reset() {
    this.element.style.opacity = "0";
    super.reset();

    this.bottom = 0;
    this.left = ORIGINAL_LEFT; // Reset
    this.jumpSpeed = 0;
    this.gravity = this.initialProps.gravity;
    this.jumping = false;
    this.gracePeriod = this.initialProps.gracePeriod;
    this.invincibilityFrames = false;
    this.targetHeight = null;
    this.targetLeft = null;
    this.element.style.transform = `scale(${this.originalScale})`;
    this.element.style.left = "0px";
    setTimeout(() => {
      this.element.style.opacity = "1";
    }, 100);
  }
}
