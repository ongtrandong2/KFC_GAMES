import "./rules.ts";

import Wheel from "../shared/wheel.ts";
import { Dialog } from "./dialog.ts";
import jQuery from "jquery";
import { prizes } from "./prizes.ts";
import { User } from "./user.ts";
import { Back, GameResult, ReceiveGift } from "./strings.ts";

export default abstract class AbstractGame {
  private score: number;
  element: HTMLElement;
  rect: DOMRect;

  protected testMode: boolean;
  protected isGameOver: boolean;
  protected time: number;
  protected timeLeft: number;
  protected animateId: number | null;
  protected lastTime: number;
  protected lastFrameTime: number;

  protected scoreDisplay: HTMLElement;
  protected timeDisplay: HTMLElement;
  protected menuDisplay: HTMLElement;
  protected progressDisplay: HTMLElement;
  protected gameBoardDisplay: HTMLElement;
  protected user: User | null = null;

  protected constructor(element: HTMLElement, time: number) {
    this.score = 0;
    this.element = element;
    this.rect = element.getBoundingClientRect();

    this.scoreDisplay = document.getElementById("Score")!;
    this.timeDisplay = document.getElementById("Time")!;
    this.menuDisplay = document.getElementById("Control")!;
    this.gameBoardDisplay = document.getElementById("GameBoard")!;
    this.progressDisplay = document
      .getElementById("Progress")!
      .querySelector(".Progress-Done")!;

    this.testMode = false;
    this.isGameOver = false;
    this.time = time;
    this.timeLeft = time;
    this.animateId = null;
    this.lastTime = 0;
    this.lastFrameTime = 0;
  }

  public setScore(score: number) {
    this.score = score;
  }

  public getScore(): number {
    return this.score;
  }

  updateTimer(currentTime: number) {
    if (!this.isGameOver) {
      const delta = currentTime - this.lastTime;
      if (delta >= 1000) {
        this.timeLeft -= 1;
        this.timeDisplay.textContent = this.timeLeft.toString();
        // Process bar
        this.progressDisplay.style.width = `${
          100 - (this.timeLeft / this.time) * 100
        }%`;
        this.lastTime = currentTime;
        if (this.timeLeft <= 0) {
          this.endGame();
        }
      }
    }
  }

  updateScore(addScore: number, rect?: DOMRect) {
    if (!this.isGameOver) {
      const currentScore = this.getScore();
      let updScore = currentScore + addScore;

      if (updScore < 0) {
        updScore = 0;
      }
      this.setScore(updScore);
      this.scoreDisplay.textContent = this.getScore().toString();

      if (rect) {
        this.showPointPopup(addScore, rect);
      }
    }
  }

  public listener() {
    jQuery("#Play").on("click", (ev) => {
      ev.stopPropagation();
      // this.sendEvent({ event: "PREPARING" }), console.log("PREPARING");
      // jQuery("#Loading").css("display", "flex").fadeIn();
      this.startGame();
    });
    jQuery("#PlayTest").on("click", (ev) => {
      ev.stopPropagation();
      this.playTest();
    });
    jQuery(".btn-back").on("click", (ev) => {
      ev.stopPropagation();
      if (!ev.currentTarget.hasAttribute("data-dialog-target")) {
        this.sendEvent({ event: "BACK" }), console.log("BACK");
      }
    });
    window.addEventListener(
      "message",
      (event: MessageEvent<{ event: string; user: User }>) => {
        if (event.data.event === "STARTING") {
          this.user = event.data.user;
          jQuery("#Avatar").attr("src", this.user.avatar);
          jQuery("#Loading").fadeOut();
          if (!this.testMode) {
            this.sendEvent({ event: "STARTED" }), console.log("STARTED");
          }

          this.startGame.call(this);
        }
      },
    );
  }

  private showPointPopup(score: number, rect: DOMRect): void {
    const pointPopup = document.createElement("div");
    pointPopup.classList.add("point-popup");
    pointPopup.textContent = score > 0 ? `+${score}` : `${score}`;

    pointPopup.style.left = `${rect.left - 20}px`;
    pointPopup.style.top = `${rect.top}px`;

    document.body.appendChild(pointPopup);
    // Remove element after animation
    pointPopup.addEventListener("animationend", () => {
      pointPopup.remove();
    });
  }

  sendEvent(msg: any) {
    window.parent.postMessage(msg, "*");
  }

  wheelInit(user: User) {
    const svg = document.querySelector("#wheel-circle");
    const appWheel = document.querySelector("#app") as HTMLElement;

    const wheel = new Wheel(svg as SVGElement, {
      user,
      prizes,
      numberOfRevolutions: 3,
      numberOfSecondsPerRevolution: 3,
      radius: (appWheel.clientWidth * 0.8) / 2,
    });
    wheel.render();
  }

  openDialog(callback?: () => void) {
    const dialog = new Dialog(document.getElementById("DialogFinish")!);
    if (this.testMode) {
      dialog.setContent(GameResult(this.user!.name, this.getScore()));
      dialog.setSubmitButton(Back, () => location.reload());
    } else {
      dialog.setContent(GameResult(this.user!.name, this.getScore()));
      dialog.setSubmitButton(ReceiveGift, () => {
        callback?.();
        jQuery("#GameBoard").fadeOut();
        jQuery("#WheelScreen").fadeIn();
      });
      this.wheelInit(this.user!);
      this.sendEvent({ event: "FINISHED", score: this.getScore() }),
        console.log("FINISHED");
    }
    dialog.open();
  }

  playTest() {
    // This function can be used to test the game
    this.testMode = true;
    this.startGame();
  }

  abstract startGame(): void;

  abstract endGame(): void;
}
