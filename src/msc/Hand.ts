import Sprite from "../shared/Sprite.ts";

export default class Hand extends Sprite {
  isVisible: boolean;

  constructor() {
    const element = document.getElementById("PickingHand")!;
    super(element);

    this.isVisible = false;
  }

  moveTo(targetRect: DOMRect) {
    if (!this.isVisible) {
      this.show();
    }
    this.element.style.top = `${targetRect.top}px`;
    this.element.style.left = `${targetRect.left + targetRect.width / 2}px`;
  }

  hide() {
    this.element.style.display = "none";
    this.isVisible = false;
  }

  show() {
    this.element.style.display = "block";
    this.isVisible = true;
  }
}
