import Sprite from "../../shared/Sprite.js";

interface CollectibleProps {
  parentElement: HTMLElement;
  info: ScoreObjectInfo;
  speed?: number;
  onDestroy?: () => void;
}

export default class Collectible extends Sprite {
  lane: HTMLElement;
  value: number;
  type: string;
  isSpawned: boolean;
  speed: number;
  onDestroy: (() => void) | undefined;

  constructor({ parentElement, info, speed = 2, onDestroy }: CollectibleProps) {
    const element = document.createElement("div");
    element.classList.add("score-object", info.type);
    parentElement.appendChild(element);

    super(element);
    this.lane = parentElement;
    this.value = info.value;
    this.type = info.type;
    this.speed = speed;
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
      this.element.style.top = `${top + this.speed}px`;
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

  public getLane(): HTMLElement {
    return this.lane;
  }
}
