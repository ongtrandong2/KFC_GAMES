import "./style.scss";
import "/src/shared/rules.ts";
import jQuery from "jquery";
import gravelIcon from "./images/gravel.png";
import gravelMasterIcon from "./images/gravel-master.png";
import { GravelStack, Gravel } from "./gravel";
import CountdownControl from "../shared/CountDownControl";
import Wheel from "../shared/wheel";
import { Dialog } from "../shared/dialog";
import GameSoundControl from "../shared/SoundControl";
import rewardSound from "/src/shared/sounds/reward.mp3";
import introSound from "/src/msc/sounds/music.mp3";
import dropSound from "/src/msc/sounds/drop.mp3";
import clappingSound from "/src/shared/sounds/clapping.mp3";
import { Back, GameResult, ReceiveGift } from "../shared/strings";

import { prizes } from "../shared/prizes.ts";
import { User } from "../shared/user.ts";
import Hand from "./Hand.ts";

const TotalSeconds: number = 30;
const PopcornPoint: number = 10;
const BucketPoint: number = 20;
const MaxGravel: number = 3;

interface Route {
  lft: number;
  rgt: number;
}
interface GameRoutes {
  [key: number]: Route;
}

class Game {
  private hand: Hand;
  public routes: GameRoutes = {
    0: { lft: 2, rgt: 1 },
    1: { lft: 0, rgt: 3 },
    3: { lft: 1, rgt: 5 },
    5: { lft: 3, rgt: 7 },
    7: { lft: 5, rgt: 9 },
    9: { lft: 7, rgt: 11 },
    11: { lft: 9, rgt: 10 },
    10: { lft: 11, rgt: 8 },
    8: { lft: 10, rgt: 6 },
    6: { lft: 8, rgt: 4 },
    4: { lft: 6, rgt: 2 },
    2: { lft: 4, rgt: 0 },
  };

  public $score: JQuery<HTMLElement> = jQuery("#Score");
  public $timer: JQuery<HTMLElement> = jQuery("#Timer");
  public $play: JQuery<HTMLElement> = jQuery("#Play");
  public $playTest: JQuery<HTMLElement> = jQuery("#PlayTest");
  public $container: JQuery<HTMLElement> = jQuery("#Container");
  public $gameBoard: JQuery<HTMLElement> = jQuery("#GameBoard");
  public $progressBar: JQuery<HTMLElement> = jQuery("#ProgressBar");
  public countDownControl: CountdownControl;

  public gameOver: boolean = false;
  public seconds: number = TotalSeconds;
  public stacks: GravelStack[] = [];
  public earnedPoints: number = 0;
  public selectedStack: GravelStack | undefined;
  public playTestMode: boolean = false;
  public running: boolean = false;
  public user: User | null = null;

  protected soundControl: GameSoundControl<
    "intro" | "drop" | "reward" | "clapping"
  >;

  constructor() {
    this.soundControl = new GameSoundControl();
    const countdownElement = document.getElementById("CountdownWrapper")!;
    this.countDownControl = new CountdownControl({
      wrapperElement: countdownElement,
    });
    this.hand = new Hand();
    this.soundControl.loadSound("reward", rewardSound);
    this.soundControl.loadSound("drop", dropSound);
    this.soundControl.loadSound("intro", introSound);
    this.soundControl.loadSound("clapping", clappingSound);
    this.listener();
  }

  public start(playTestMode: boolean = true) {
    this.soundControl.playSound("intro", true);
    this.$container.addClass("playing");
    this.$gameBoard.fadeIn();
    this.$timer.text(TotalSeconds);
    this.countDownControl.start(3).then((_) => {
      this.playTestMode = playTestMode;
      if (!this.playTestMode) {
        this.sendEvent({ event: "STARTED" }), console.log("STARTED");
      }
      this.init();
    });
  }
  sendEvent(msg: any) {
    window.parent.postMessage(msg, "*");
  }

  public listener() {
    this.$play.on("click", (ev) => {
      ev.stopPropagation();
      // this.sendEvent({ event: "PREPARING" }), console.log("PREPARING");
      // jQuery("#Loading").css("display", "flex").fadeIn();
      this.start(this.playTestMode);
    });
    this.$playTest.on("click", (ev) => {
      ev.stopPropagation();
      this.playTestMode = true;
      // this.sendEvent({ event: "PREPARING" }), console.log("PREPARING");
      // jQuery("#Loading").css("display", "flex").fadeIn();
      this.start(this.playTestMode);
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
          this.start(this.playTestMode);
        }
      },
    );
  }
  public endGame() {
    this.gameOver = true;

    this.openDialog(this.earnedPoints);
  }

  public countDown() {
    const ts = setInterval(() => {
      this.seconds--;
      this.$timer?.text(this.seconds);
      this.$progressBar.css(
        "width",
        `${100 - (this.seconds / TotalSeconds) * 100}%`,
      );
      if (this.seconds === 0) {
        clearInterval(ts);
        this.endGame();
      }
    }, 1000);
  }

  public init() {
    this.stacks = jQuery(".popcorn-stack")
      .map<GravelStack>((idx, stack) => {
        const $stack = jQuery(stack).data("idx", idx);
        const isBucket = $stack.hasClass("bucket-stack");
        const stackClass = isBucket ? "bucket" : "popcorn";
        const stackImage = isBucket ? gravelMasterIcon : gravelIcon;
        const numberOfGravels = isBucket
          ? 1
          : Math.floor(Math.random() * MaxGravel) + 1;
        $stack.on("click", (e) => this.onSelectStack(e));
        return new GravelStack(
          $stack,
          Array.from({ length: numberOfGravels }).map(() => {
            const $gravel = jQuery(
              `<img src="${stackImage}" class="${stackClass}" alt="popcorn">`,
            );
            $gravel.appendTo($stack);
            return new Gravel($gravel, isBucket);
          }),
          isBucket,
        );
      })
      .toArray();
    this.countDown();
  }

  public async onSelectStack(e: JQuery.ClickEvent<HTMLElement>) {
    const $stack = jQuery<HTMLElement>(e.currentTarget);
    const idx = $stack.data("idx");
    const stack = this.stacks[idx];
    if (this.gameOver || this.running || stack.gravels.length === 0) return;
    // has not selected a stack before
    if (
      this.selectedStack === undefined &&
      !stack.isBucket &&
      [2, 4, 6, 8, 10].indexOf(idx) !== -1
    ) {
      this.selectedStack = stack;
      $stack.addClass("selected");
      return;
    }
    // has selected a stack before (select direction to move)
    if (this.selectedStack !== undefined) {
      const arrSize = 35;
      const width = $stack.width() as number;
      const height = $stack.height() as number;
      const x = { min: width / 2 - arrSize / 2, max: width / 2 + arrSize / 2 };
      const top = {
        min: 0 - (arrSize * 50) / 100,
        max: 0 + (arrSize * 40) / 100,
      };
      const bottom = {
        min: height - (arrSize * 40) / 100,
        max: height + (arrSize * 60) / 100,
      };
      const stackReact = $stack[0].getBoundingClientRect();
      const clickedX = e.clientX - stackReact.left;
      const clickedY = e.clientY - stackReact.top;

      const selectedIdx = this.selectedStack.$el.data("idx");

      const clickedTop =
        clickedX > x.min &&
        clickedX < x.max &&
        clickedY > top.min &&
        clickedY < top.max;
      const clickedBottom =
        clickedX > x.min &&
        clickedX < x.max &&
        clickedY > bottom.min &&
        clickedY < bottom.max;
      const selected = this.routes[selectedIdx];
      if (clickedTop || clickedBottom) {
        const dir = clickedTop ? "rgt" : "lft";
        const selectedStack = this.selectedStack;
        this.selectedStack.$el.removeClass("selected");
        this.selectedStack = undefined;
        this.hand.moveTo(selectedStack.$el[0].getBoundingClientRect());
        await this.update(dir, selected, selectedStack);
        setTimeout(() => {
          this.hand.hide();
        }, 250);
      }
      if (this.selectedStack !== undefined) {
        this.selectedStack.$el.removeClass("selected");
        this.selectedStack = undefined;
      }
    }
  }

  public async update(
    dir: "lft" | "rgt",
    selectedRoute: Route,
    selectedStack: GravelStack,
  ) {
    this.running = true;
    let next = { ...selectedRoute };
    while (this.gameOver === false) {
      const nextStack = this.stacks[next[dir]];
      next = { ...this.routes[next[dir]] };

      // if next stack is bucket (not empty) and current stack is empty
      if (
        selectedStack.gravels.length === 0 &&
        nextStack.isBucket &&
        nextStack.gravels.length > 0
      ) {
        break;
      }

      // if next stack is not empty and current stack is empty
      if (
        nextStack.gravels.length > 0 &&
        !nextStack.isBucket &&
        selectedStack.gravels.length === 0
      ) {
        selectedStack = nextStack;
        continue;
      }

      // if next stack is empty and current stack is empty
      if (
        nextStack.gravels.length === 0 &&
        selectedStack.gravels.length === 0
      ) {
        if (this.stacks[next[dir]].gravels.length > 0) {
          this.soundControl.playSound("reward");
          const score = this.stacks[next[dir]].gravels.reduce((acc, gravel) => {
            acc += gravel.isBucket ? BucketPoint : PopcornPoint;
            gravel.$el.remove();
            return acc;
          }, 0);
          this.showPointPopup(
            score,
            this.stacks[next[dir]].$el[0].getBoundingClientRect(),
          );
          this.earnedPoints += score;
          this.stacks[next[dir]].gravels = [];
          this.$score?.text(this.earnedPoints);
        }
        break;
      }

      // normal
      const currentGravels = selectedStack.gravels.filter((g) => !g.isBucket);
      const gravel = currentGravels.pop();
      if (gravel !== undefined) {
        await new Promise((resolve) => {
          const ts = setTimeout(() => {
            this.hand.moveTo(nextStack.$el[0].getBoundingClientRect());
            nextStack.addGravel(gravel);
            this.soundControl.playSound("drop");
            clearTimeout(ts);
            resolve(1);
          }, 250);
        });
      }
      selectedStack.gravels = [
        ...selectedStack.gravels.filter((g) => g.isBucket),
        ...currentGravels,
      ];
    }
    this.running = false;
  }
  public openDialog(score: number) {
    this.soundControl.playSound("clapping");
    const dialog = new Dialog(document.getElementById("DialogFinish")!);
    if (this.playTestMode) {
      dialog.setContent(GameResult(this.user!.name, score));
      dialog.setSubmitButton(Back, () => location.reload());
    } else {
      dialog.setContent(GameResult(this.user!.name, score));
      dialog.setSubmitButton(ReceiveGift, () => {
        jQuery("#GameBoard").fadeOut();
        jQuery("#WheelScreen").fadeIn();
      });
      this.wheelInit(this.user!);
      this.sendEvent({ event: "FINISHED", score }), console.log("FINISHED");
    }
    dialog.open();
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
}
(async () => {
  new Game();
})();
