import Sprite from "../../shared/Sprite.ts";

interface CharacterProps {
  element: HTMLElement;
  gravity: number;
  gracePeriod?: number;
}

const MAX_JUMP_COUNT = 2;

export default class Character extends Sprite {
  bottom: number;
  jumpSpeed: number;
  gravity: number;
  jumping: boolean;
  jumpTimes: number;
  gracePeriod: number; // Invulnerability period
  invincibilityFrames: boolean;
  initialProps: Required<CharacterProps>;

  constructor({ element, gravity, gracePeriod = 800 }: CharacterProps) {
    super(element);
    this.bottom = 0;
    this.jumpSpeed = 0;
    this.gravity = gravity;
    this.jumping = false;
    this.jumpTimes = 0;
    this.gracePeriod = gracePeriod;
    this.invincibilityFrames = false;

    this.initialProps = { element, gravity: gravity, gracePeriod: gracePeriod };
  }

  jump(speed: number) {
    if (this.jumpTimes >= MAX_JUMP_COUNT) return;

    this.jumping = true;
    this.jumpSpeed = speed;
    this.jumpTimes++;
  }

  shield() {
    this.invincibilityFrames = true;
    this.element.classList.add("flash");
    setTimeout(() => {
      this.invincibilityFrames = false;
      this.element.classList.remove("flash");
    }, this.gracePeriod);
  }

  update() {
    super.update();
    if (this.jumping) {
      this.bottom += this.jumpSpeed;
      this.jumpSpeed -= this.gravity;
      if (this.bottom <= 0) {
        this.bottom = 0;
        this.jumping = false;
        this.jumpTimes = 0;
      }
    }
    this.element.style.bottom = this.bottom + "px";
  }

  reset() {
    super.reset();

    this.bottom = 0;
    this.jumpSpeed = 0;
    this.jumpTimes = 0;
    this.gravity = this.initialProps.gravity;
    this.jumping = false;
    this.gracePeriod = this.initialProps.gracePeriod;
    this.invincibilityFrames = false;
  }
}
