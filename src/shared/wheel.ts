import "/src/shared/_wheel.scss";
import jQuery from "jquery";
import wheelCircle from "/src/shared/images/wheel-circle.svg";
import wheelCircleInner from "/src/shared/images/wheel-circle-inner.svg";
import WheelSpinAudio from "/src/shared/sounds/wheel-spin.mp3";
import WheelWinAudio from "/src/shared/sounds/clapping.mp3";
import { Dialog } from "./dialog";
import { User } from "./user";
import {
  CodeSent,
  Congratulations,
  GoodLuck,
  ReceiveMore,
  ReceiveMoreOffers,
  Restart,
  SpinNow,
  WheelWelcome,
} from "./strings";

export interface Prize {
  image: string;
  text: string;
  reward: boolean;
  result: string;
}

export interface WheelOptions {
  user: User;
  radius: number;
  numberOfRevolutions: number;
  numberOfSecondsPerRevolution: number;
  prizes: Prize[];
  finishSpin?: (prize: Prize) => void;
}

export interface SpinWheelDetail {
  targetSegment: number;
}
export default class Wheel {
  private opts: WheelOptions;
  private svg: SVGElement;
  private started: boolean = false;
  private sounds: any = {
    spin: new Audio(WheelSpinAudio),
    win: new Audio(WheelWinAudio),
  };
  private $wheelScreen: JQuery<HTMLElement> = jQuery("#WheelScreen");
  private $resultScreen: JQuery<HTMLElement> = jQuery("#WheelResultScreen");
  private $restart: JQuery<HTMLElement> = jQuery("#Restart");
  private $receiveMore: JQuery<HTMLElement> = jQuery("#ReceiveMore");
  private $receiveMoreLink: JQuery<HTMLElement> = jQuery("#ReceiveMoreLink");
  private $spin: JQuery<HTMLElement> = jQuery("#Spin");
  private $share: JQuery<HTMLElement> = jQuery("#ShareResult");
  private targetSegment: number = 0;
  constructor(svg: SVGElement, opts: WheelOptions) {
    this.svg = svg;
    this.opts = opts;
    this.svg.setAttribute(
      "viewBox",
      `0 0 ${opts.radius * 2} ${opts.radius * 2}`,
    );
    this.svg.setAttribute("width", `${opts.radius * 2}`);
    this.svg.setAttribute("height", `${opts.radius * 2}`);
    this.$spin.text(SpinNow);
    this.$restart.text(Restart);
  }
  spin(targetSegment: number = 0) {
    this.svg.style.transition = "none"; // Disable transition for reset
    this.svg.style.transform = "rotate(0deg)"; // Reset rotation
    setTimeout(() => {
      this.playSound("spin");
      this.svg.style.transition = "transform 4s cubic-bezier(0.33, 1, 0.68, 1)"; // Re-enable transition
      let rotation = 0;
      const segmentAngle = 360 / this.opts.prizes.length;

      const spinAngle =
        360 * this.opts.numberOfRevolutions +
        (360 - targetSegment * segmentAngle) -
        segmentAngle * 2; // Ensure multiple spins and correct stopping point
      const offset = 5;
      const start = spinAngle - segmentAngle / 2 + offset;
      const end = spinAngle + segmentAngle / 2 - offset;
      const randomSpin = Math.floor(Math.random() * (end - start + 1) + start);
      rotation += randomSpin;
      this.svg.style.transition = `transform ${this.opts.numberOfSecondsPerRevolution}s cubic-bezier(0.33, 1, 0.68, 1)`;
      this.svg.style.transform = `rotate(${rotation}deg)`;
    }, 50);
  }

  render() {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    circle.setAttribute("href", wheelCircle);
    circle.setAttribute("width", `${this.opts.radius * 2}`);
    circle.setAttribute("height", `${this.opts.radius * 2}`);
    circle.setAttribute("x", "0");
    circle.setAttribute("y", "0");
    this.svg.appendChild(circle);

    const circleInner = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    const innerPercent = 0.995;
    const innerSize = this.opts.radius * innerPercent;
    const innerOffset = (this.opts.radius * (1 - innerPercent)) / 2;
    circleInner.setAttribute("href", wheelCircleInner);
    circleInner.setAttribute("width", `${innerSize * 2}`);
    circleInner.setAttribute("height", `${innerSize * 2}`);
    circleInner.setAttribute("x", `${innerOffset * 2}`);
    circleInner.setAttribute("y", `${innerOffset * 2}`);
    this.svg.appendChild(circleInner);

    const numPrizes = this.opts.prizes.length;
    const segmentAngle = 360 / numPrizes;
    for (let i = 0; i < numPrizes; i++) {
      const angle = i * segmentAngle;
      const r = this.opts.radius;
      const tx =
        r + r * 0.9 * Math.cos((Math.PI * (angle + segmentAngle / 2)) / 180);
      const ty =
        r + r * 0.9 * Math.sin((Math.PI * (angle + segmentAngle / 2)) / 180);
      this.drawSectorLine(angle);
      this.drawPrizeText(i, tx, ty, angle, segmentAngle);
      this.drawPrizeImage(i, tx, ty, angle, segmentAngle);
    }
    this.$wheelScreen.find(".GameName").html(WheelWelcome(this.opts.user.name));
    this.listener();
  }

  private listener() {
    this.svg.addEventListener("transitionend", () => {
      const timer = setTimeout(() => {
        this.$wheelScreen.fadeOut();
        const segment = this.opts.prizes[this.targetSegment];
        const $name = this.$resultScreen.find(".GameName");
        if (segment.reward) {
          $name.html(Congratulations(this.opts.user.name));
          this.$receiveMore.hide();
          this.$receiveMoreLink.text(ReceiveMoreOffers);
          window.parent.postMessage({ event: "RECEIVE_CODE" }, "*"),
            console.log("RECEIVE_CODE");
        } else {
          $name.html(GoodLuck(this.opts.user.name));
          this.$share.hide();
          this.$restart.hide();
          this.$receiveMoreLink.hide();
          this.$receiveMore.text(ReceiveMore);
        }
        this.$resultScreen.find("#WheelGift").html(`
            <img src="${segment.result}" alt="" />
            ${segment.reward ? `<p>${segment.text}</p>` : ""}
        `);
        this.$resultScreen.fadeIn();
        this.playSound("win");
        this.opts.finishSpin && this.opts.finishSpin(segment);
        this.started = false;
        clearTimeout(timer);
      }, 200);
    });

    this.$receiveMore.on("click", (e) => {
      e.preventDefault();
      window.parent.postMessage({ event: "RECEIVE_MORE" }, "*"),
        console.log("RECEIVE_MORE");
    });
    this.$receiveMoreLink.on("click", (e) => {
      e.preventDefault();
      window.parent.postMessage({ event: "RECEIVE_MORE" }, "*"),
        console.log("RECEIVE_MORE");
    });
    this.$restart.on("click", (e) => {
      e.preventDefault();
      window.parent.postMessage({ event: "RESTART" }, "*"),
        console.log("RESTART");
    });
    this.$share.on(
      "click",
      (e) => (
        e.preventDefault(),
        window.parent.postMessage({ event: "SHARE" }, "*"),
        console.log("SHARE")
      ),
    );

    this.$spin.on("click", (e) => {
      e.preventDefault();
      if (!this.started) {
        window.parent.postMessage({ event: "SPIN" }, "*"), console.log("SPIN");
      }
    });

    window.addEventListener(
      "message",
      (
        event: MessageEvent<{
          event: string;
          targetSegment: number;
          name: string;
        }>,
      ) => {
        switch (event.data.event) {
          case "REWARD": {
            this.started = true;
            this.targetSegment = event.data.targetSegment;
            this.spin(this.targetSegment);
            break;
          }
          case "SENT": {
            jQuery("#Loading").fadeOut();
            const dialog = new Dialog(document.getElementById("DialogFinish")!);
            dialog.setContent(CodeSent(this.opts.user.name));
            dialog.setSubmitButton(
              ReceiveMore,
              () => (
                window.parent.postMessage({ event: "RECEIVE_MORE" }, "*"),
                console.log("RECEIVE_MORE")
              ),
            );
            dialog.open();
            break;
          }
        }
      },
    );
  }

  private playSound(key: "spin" | "win") {
    this.sounds[key].currentTime = 0;
    this.sounds[key].play();
  }

  private drawSectorLine(angle: number) {
    const innerPercent = 0.995;
    const innerSize = this.opts.radius * innerPercent;
    const innerOffset = (this.opts.radius * (1 - innerPercent)) / 2;
    const x = innerSize + innerSize * Math.cos((Math.PI * angle) / 180);
    const y = innerSize + innerSize * Math.sin((Math.PI * angle) / 180);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${innerSize + innerOffset}`);
    line.setAttribute("y1", `${innerSize + innerOffset}`);
    line.setAttribute("x2", `${x + innerOffset}`);
    line.setAttribute("y2", `${y + innerOffset}`);
    line.setAttribute("stroke", "url(#paint1_linear_2014_2106)");
    line.setAttribute("stroke-width", "2");
    this.svg.appendChild(line);
  }

  private drawPrizeImage(
    i: number,
    tx: number,
    ty: number,
    angle: number,
    segmentAngle: number,
  ) {
    let size = 60;
    if (this.svg.clientWidth <= 300) {
      size = 50;
    }
    const prize = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    prize.setAttribute("href", this.opts.prizes[i].image);
    prize.setAttribute("width", `${size}`);
    prize.setAttribute("height", `${size}`);
    prize.setAttribute("x", `${tx - size / 2}`);
    prize.setAttribute("y", `${ty + 35}`);
    prize.setAttribute(
      "transform",
      `rotate(${angle + segmentAngle / 2 - 90 - 180} ${tx} ${ty})`,
    );
    this.svg.appendChild(prize);
  }

  private drawPrizeText(
    i: number,
    tx: number,
    ty: number,
    angle: number,
    segmentAngle: number,
  ) {
    const textBoxSize = 120;
    let fontSize = 12;
    if (window.innerWidth <= 376) {
      fontSize = 10;
    }
    const text = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject",
    );
    const div = document.createElement("div");
    div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    div.style.textAlign = "center";
    div.style.color = "white";
    div.style.fontSize = `${fontSize}px`;
    div.style.lineHeight = "1.25";
    div.style.fontFamily = "Cabin";
    div.style.fontWeight = "bold";
    div.innerHTML = this.opts.prizes[i].text;
    text.setAttribute("x", `${tx - textBoxSize / 2}`);
    text.setAttribute("y", `${ty}`);
    text.setAttribute("width", `${textBoxSize}`);
    text.setAttribute("height", `${textBoxSize}`);
    text.setAttribute(
      "transform",
      `rotate(${angle + segmentAngle / 2 - 90 - 180} ${tx} ${ty})`,
    );
    text.appendChild(div);
    this.svg.appendChild(text);
  }
}
