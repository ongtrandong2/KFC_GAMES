export default class Sprite {
    element: HTMLElement;
    rect: DOMRect;
    initialRect: DOMRect;

    constructor(element: HTMLElement) {
        this.element = element;
        this.rect = element.getBoundingClientRect();
        this.initialRect = this.rect; // Store the initial position
    }

    draw() {
        // Override in subclasses if necessary
    }

    update() {
        this.rect = this.element.getBoundingClientRect();
    }

    reset() {
        this.rect = this.initialRect;
    }
}