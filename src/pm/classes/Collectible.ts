import Sprite from "../../shared/Sprite.js";

interface CollectibleProps {
  parentElement: HTMLElement;
  info: ScoreObjectInfo;
}

export default class Collectible extends Sprite {
  value: number;
  type: string;
  isSpawned: boolean;

  constructor({ parentElement, info }: CollectibleProps) {
    const element = document.createElement("div");
    element.classList.add("score-object", info.type);
    parentElement.appendChild(element);

    super(element);
    this.value = info.value;
    this.type = info.type;
    this.isSpawned = true;
  }

  destroy() {
    this.element.remove();
  }
}
