// Item.ts
import Sprite from "../../shared/Sprite.ts";

interface ItemProps {
  wrapperElement: HTMLElement;
  item: ItemInfo;
  onClick: (item: Item) => void;
}

export interface ItemInfo {
  type: string;
  value: number;
  weight: number;
}

export default class Item extends Sprite {
  private wrapperElement: HTMLElement;
  public info: ItemInfo;
  private readonly onClick: (item: Item) => void;

  constructor({ wrapperElement, item, onClick }: ItemProps) {
    const element = document.createElement("div");
    element.classList.add("item", item.type);
    super(element);
    this.info = item;
    this.wrapperElement = wrapperElement;
    this.append();
    this.rect = this.element.getBoundingClientRect();
    this.onClick = onClick;
    this.addClickListener();
  }

  private setPosition(): void {
    const x = Math.random() * (this.wrapperElement.clientWidth - 50);
    const y = Math.random() * (this.wrapperElement.clientHeight - 50);
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  private setRotation(): void {
    const angle = Math.random() * 360;
    this.element.style.transform = `rotate(${angle}deg)`;
  }

  private addClickListener(): void {
    this.element.addEventListener("click", () => this.onClick(this));
  }

  public append(): void {
    this.wrapperElement.appendChild(this.element);
    this.setPosition();
    this.setRotation();
  }

  public remove(): void {
    this.element.remove();
  }
}
