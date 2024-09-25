import Sprite from "../../shared/Sprite.ts";

interface BarProps {
  element: HTMLElement;
}

export default class Bar extends Sprite {
  private zones: HTMLElement[];
  private sliderElement: HTMLElement;
  private sliderDirection: number = 1;
  private sliderSpeed: number = 10; // Initial speed
  private sliderPosition: number = 0;
  private isMoving: boolean = false;
  private level: number = 0;

  constructor({ element }: BarProps) {
    super(element);

    this.sliderElement = this.element.querySelector("#Slider") as HTMLElement;
    this.zones = Array.from(
      this.element.querySelectorAll(".zone"),
    ) as HTMLElement[];
  }

  public startSlider() {
    this.isMoving = true;
  }

  public update() {
    super.update();

    if (!this.isMoving) {
      return;
    }

    this.sliderPosition += this.sliderSpeed * this.sliderDirection;
    const barWidth = this.element.clientWidth;

    if (
      this.sliderPosition <= 0 ||
      this.sliderPosition >= barWidth - this.sliderElement.clientWidth
    ) {
      this.sliderDirection *= -1; // Change direction
    }

    this.sliderElement.style.left = `${this.sliderPosition}px`;
  }

  public stopSlider() {
    this.isMoving = false;
  }

  public setLevel(level: number) {
    this.level = level;
    this.updateZoneSizes();
    this.updateSliderSpeed();
  }

  private getZoneWidthRatios(): { green: number; yellow: number; red: number } {
    const baseGreenRatio = 0.33;
    const baseRedRatio = 0.33;
    const reductionFactor = 0.03;

    let greenRatio = baseGreenRatio - (this.level - 1) * reductionFactor;
    let redRatio = baseRedRatio - (this.level - 1) * reductionFactor;
    let yellowRatio = 1 - (greenRatio + redRatio);

    greenRatio = Math.max(greenRatio, 0);
    redRatio = Math.max(redRatio, 0);
    yellowRatio = 1 - (greenRatio + redRatio);

    return { green: greenRatio, yellow: yellowRatio, red: redRatio };
  }

  private updateSliderSpeed(): number {
    const baseSpeed = 1;
    const speedIncrement = 0.25;

    return baseSpeed + (this.level - 1) * speedIncrement;
  }

  private updateZoneSizes() {
    const zoneRatio = this.getZoneWidthRatios();
    const greenZoneWidth = zoneRatio.green * this.element.clientWidth;
    const redZoneWidth = zoneRatio.red * this.element.clientWidth;
    const gap = 5;
    const randomLeft = Math.floor(
      Math.random() *
        (this.element.clientWidth - (greenZoneWidth + redZoneWidth + gap)),
    );

    this.zones[0].style.width = `${greenZoneWidth}px`; // Green zone
    this.zones[0].style.left = `${randomLeft}px`; // Random position
    this.zones[1].style.left = this.zones[0].offsetLeft + greenZoneWidth + "px";
    this.zones[1].style.width = `${redZoneWidth}px`; // Red zone after green
  }

  public getSliderZone(): "yellow" | "green" | "red" {
    const sliderRect = this.sliderElement.getBoundingClientRect();
    const greenRect = this.zones[0].getBoundingClientRect();
    const redRect = this.zones[1].getBoundingClientRect();

    const pointerRect = sliderRect.left + sliderRect.width / 2;
    if (greenRect.left < pointerRect && pointerRect < greenRect.right) {
      return "green";
    } else if (redRect.left < pointerRect && pointerRect < redRect.right) {
      return "red";
    } else {
      return "yellow";
    }
  }

  public resetSlider() {
    this.isMoving = false;
    this.sliderPosition = 0;
    this.sliderSpeed = 10; // Reset speed
  }
}
