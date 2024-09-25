import Sprite from "../../shared/Sprite.ts";

interface KiteProps {
  element: HTMLElement;
  lanes: HTMLElement[];
}

export default class Kite extends Sprite {
  private readonly lanes: HTMLElement[];
  private currentLaneIndex: number;
  private targetLeft: number | null = null;

  constructor({ element, lanes }: KiteProps) {
    super(element);
    this.lanes = lanes;
    this.currentLaneIndex = 1; // Start in the middle lane
  }

  moveLeft() {
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
      this.setPositionToCurrentLane();
      this.applyRecoilEffect("left");
    }
  }

  moveRight() {
    if (this.currentLaneIndex < this.lanes.length - 1) {
      this.currentLaneIndex++;
      this.setPositionToCurrentLane();
      this.applyRecoilEffect("right");
    }
  }

  setPositionToCurrentLane() {
    const lane = this.lanes[this.currentLaneIndex];
    const parentRect = this.element.parentElement!.getBoundingClientRect();
    const laneRect = lane.getBoundingClientRect();

    this.targetLeft =
      laneRect.left -
      parentRect.left +
      (lane.clientWidth - this.element.clientWidth) / 2;
  }

  getCurrentLeft() {
    return parseFloat(this.rect.left.toString() || "0");
  }

  update() {
    super.update();
    if (this.targetLeft !== null) {
      const currentLeft = this.getCurrentLeft();
      const distance = this.targetLeft - currentLeft;

      // Check if the element is close enough to the target position
      if (Math.abs(distance) < 1) {
        this.element.style.left = `${this.targetLeft}px`;
        this.targetLeft = null;
        return;
      }
      // Smoothly move towards the target position
      this.element.style.left = `${currentLeft + distance * 0.5}px`;
    }
  }

  private applyRecoilEffect(recoil: "left" | "right") {
    this.element.classList.add(`recoil-${recoil}`);
    setTimeout(() => {
      this.element.classList.remove(`recoil-${recoil}`);
    }, 500);
  }
}
