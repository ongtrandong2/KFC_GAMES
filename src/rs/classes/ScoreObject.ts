import Sprite from "../../shared/Sprite.ts";

interface ScoreObjectProps {
    parentElement: HTMLElement;
    info: ScoreObjectInfo;
}

export default class ScoreObject extends Sprite {
    value: number;
    isSpawned: boolean;

    constructor({parentElement, info} : ScoreObjectProps) {
        const element = document.createElement('div');
        element.id = "ScoreObject";
        element.className = `score-object ${info.type}`;
        super(element);
        this.value = info.value;
        this.isSpawned = true;

        const y = 300;

        this.element.style.bottom = `${y}px`;

        parentElement.appendChild(this.element);
        this.show();
    }

    show() {
        this.element.style.display = 'block';
        this.update();
    }

    destroy() {
        this.element.remove();
    }
}