export class XElement {
    public $el: JQuery<HTMLElement>;

    constructor(element: JQuery<HTMLElement>) {
        this.$el = element;
    }
}