import { XElement } from "./element";

export class Gravel extends XElement {
  public isBucket: boolean;
  constructor($el: JQuery<HTMLElement>, isMaster: boolean = false) {
    super($el);
    this.isBucket = isMaster;
  }
}

export class GravelStack extends XElement {
  public isBucket: boolean;
  public gravels: Gravel[];
  constructor($el: JQuery<HTMLElement>, gravels: Gravel[], isMaster = false) {
    super($el);
    this.gravels = gravels;
    this.isBucket = isMaster;
  }

  public addGravel(gravel: Gravel) {
    this.gravels.push(gravel);
    this.$el.append(gravel.$el);
  }
}
