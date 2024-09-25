import Sprite from "../../shared/Sprite.ts";
import CloudOne from "/src/fk/images/cloud-1.png";
import CloudTwo from "/src/fk/images/cloud-1.png";

interface CloudProps {
  parentElement: HTMLElement;
  info: ScoreObjectInfo;
  speed?: number;
  onDestroy?: () => void;
}
const clouds = [CloudOne, CloudTwo];
export default class Cloud extends Sprite {
  lane: HTMLElement;
  value: number;
  isSpawned: boolean;
  cloudSpeed: number;
  onDestroy: (() => void) | undefined;

  constructor({ parentElement, info, speed = 2, onDestroy }: CloudProps) {
    const element = document.createElement("div");
    element.className = info.type;
    if (info.type == "cloud") {
      const cloud = clouds[Math.floor(Math.random() * clouds.length)];
      element.style.backgroundImage = `url(${cloud})`;
      element.style.backgroundSize = "contain";
    }
    parentElement.appendChild(element);

    super(element);
    this.lane = parentElement;
    this.value = info.value;
    this.cloudSpeed = speed;
    this.isSpawned = true;
    this.onDestroy = onDestroy;

    const left = (parentElement.clientWidth - element.clientWidth) / 2;
    this.element.style.top = `-${55}px`;
    this.element.style.left = `${left}px`;
  }

  update() {
    super.update();
    const top = parseFloat(this.element.style.top) || 0;
    const parentHeight = this.lane!.clientHeight;

    if (top < parentHeight) {
      this.element.style.top = `${top + this.cloudSpeed}px`;
    } else {
      this.destroy();
    }
  }

  destroy() {
    this.element.remove();
    if (this.onDestroy) {
      this.onDestroy();
    }
  }

  public getLane() : HTMLElement {
    return this.lane;
  }
}
