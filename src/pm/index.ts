import GameSoundControl from "../shared/SoundControl.ts";
import CountdownControl from "../shared/CountDownControl.ts";
import AbstractGame from "../shared/AbstractGame.ts";
import backgroundSound from "./sounds/music-pm.mp3";
import rewardSound from "../shared/sounds/reward.mp3";
import clappingSound from "../shared/sounds/clapping.mp3";
import jumpSound from "../pm/sounds/jump.mp3";
import jumpGreenSound from "./sounds/jump-green.mp3";
import jumpYellowSound from "./sounds/jump-yellow.mp3";
import stoneSound from "./sounds/stone.mp3";
import waterSound from "./sounds/water.mp3";

import Bar from "./classes/Bar.ts";
import Character from "./classes/Character.ts";
import Collectible from "./classes/Collectible.ts";

const fps: number = 60;

interface GameProps {
  element: HTMLElement; // Container element
  time: number; // Time to play
  luck?: number; // Change spawn object (%/100)
}

class Game extends AbstractGame {
  protected character: Character;
  protected bar: Bar;
  protected soundControl: GameSoundControl<
    | "soundTrack"
    | "clapping"
    | "jump"
    | "reward"
    | "jumpGreen"
    | "jumpYellow"
    | "stone"
    | "water"
  >;
  protected countDownControl: CountdownControl;
  private readonly yardElement: HTMLElement;
  private obstacleLevel: number = 0;

  protected luck: number;
  protected paused: boolean = false;

  private scoreObjectTypes: ScoreObjectInfo[] = [
    { type: "bucket", value: 20, weight: 0.25 },
    { type: "popcorn", value: 10, weight: 0.25 },
    { type: "water", value: -5, weight: 0.25 },
    { type: "stone", value: -10, weight: 0.25 },
  ];
  protected collectible: Collectible | null = null;

  constructor({ element, time = 30, luck = 0.2 }: GameProps) {
    super(element, time);
    const characterElement = document.getElementById("Character")!;
    const barElement = document.getElementById("Bar")!;
    this.yardElement = document.getElementById("Yard")!;
    this.soundControl = new GameSoundControl();

    const countdownElement = document.getElementById("CountdownWrapper")!;
    this.countDownControl = new CountdownControl({
      wrapperElement: countdownElement,
    });

    this.character = new Character({ element: characterElement, gravity: 1.2 });
    this.bar = new Bar({ element: barElement });
    this.luck = luck;

    this.soundControl
      .loadMultiSound({
        soundTrack: backgroundSound,
        clapping: clappingSound,
        reward: rewardSound,
        jump: jumpSound,
        jumpGreen: jumpGreenSound,
        jumpYellow: jumpYellowSound,
        stone: stoneSound,
        water: waterSound,
      })
      .then((_) => {});
  }

  jumpControl() {
    if (!this.isGameOver && !this.character.jumping) {
      this.bar.stopSlider();
      const sliderPosition = this.bar.getSliderZone();

      if (sliderPosition === "red") {
        this.highJump();
      } else if (sliderPosition === "green") {
        this.successfulJump();
      } else {
        this.failJump();
      }
    }
  }

  private failJump() {
    this.soundControl.playSound("jumpYellow");
    this.character.jump(100, 100, this.retryLevel.bind(this));
  }

  private successfulJump() {
    this.soundControl.playSound("jumpGreen");
    this.character.jump(285, 100, this.normalJumpProcess.bind(this));
  }

  private highJump() {
    this.soundControl.playSound("jump");
    this.character.jump(285, 200, this.highJumpProcess.bind(this));
  }

  private normalJumpProcess() {
    this.updateScore(20);
    setTimeout(() => {
      this.obstacleLevel++;
      this.updateCharacter();
      this.updateBar();
      this.updateCollectible();
    }, 1000);
  }

  private highJumpProcess() {
    this.updateScore(20);
    if (this.collectible) {
      // Trigger collide
      this.collideSoundHandler(this.collectible.type);
      this.updateScore(this.collectible.value, this.collectible.rect);
      this.collectible.destroy();
      this.collectible = null;
    }
    setTimeout(() => {
      this.obstacleLevel++;
      this.updateCharacter();
      this.updateBar();
      this.updateCollectible();
    }, 1000);
  }

  private retryLevel() {
    setTimeout(() => {
      this.updateCharacter();
      this.updateBar();
      this.updateCollectible();
    }, 1000);
  }

  private collideSoundHandler(type: string) {
    switch (type) {
      case "bucket":
      case "popcorn":
        return this.soundControl.playSound("reward");
      case "stone":
        return this.soundControl.playSound("stone");
      case "water":
        return this.soundControl.playSound("water");
      default:
        break;
    }
  }

  private updateCharacter() {
    this.character.reset();
  }

  private updateBar() {
    this.bar.setLevel(this.obstacleLevel);
    this.bar.startSlider();
  }

  private updateCollectible(): void {
    if (this.collectible) {
      this.collectible.destroy();
    }
    this.spawnCollectible();
  }

  spawnCollectible() {
    // Clean up
    this.collectible = null;
    // Randomly decide whether to spawn a cloud or collectible
    const type = this.weightedRandomScoreObjectType();
    if (type) {
      const info = this.scoreObjectTypes.find((obj) => obj.type === type);
      if (info) {
        this.collectible = new Collectible({
          parentElement: this.yardElement,
          info,
        });
      }
    }
  }

  private weightedRandomScoreObjectType(): string | null {
    const randomValue = Math.random();
    let cumulativeProbability = 0;

    for (const obj of this.scoreObjectTypes) {
      cumulativeProbability += obj.weight;
      if (randomValue < cumulativeProbability) {
        return obj.type;
      }
    }

    return null; // Default return (should not reach here if weights are correctly defined)
  }

  init() {
    this.menuDisplay.style.display = "flex";
    this.listener();
  }

  gameLoop = (currentTime: number) => {
    if (!this.isGameOver) {
      const delta = Math.ceil(currentTime - this.lastFrameTime);
      if (delta >= Math.floor(1000 / fps)) {
        this.character.update();
        this.bar.update();
        this.updateTimer(currentTime);
        this.lastFrameTime = currentTime;
      }
      this.animateId = requestAnimationFrame(this.gameLoop);
    }
  };

  startGame() {
    this.soundControl.playSound("soundTrack");
    this.menuDisplay.style.display = "none";
    this.gameBoardDisplay.style.display = "block";

    this.countDownControl.start(3).then(() => {
      document.body.addEventListener("click", this.jumpControl.bind(this));
      this.lastTime = performance.now();
      this.lastFrameTime = performance.now();
      // Init slider
      this.obstacleLevel++;
      this.updateCharacter();
      this.updateBar();
      this.updateCollectible();

      this.gameLoop(this.lastFrameTime);
    });
  }

  reset() {
    if (this.animateId) {
      cancelAnimationFrame(this.animateId);
    }
    this.setScore(0);
    this.testMode = false;
    this.isGameOver = false;
    this.animateId = null;
    this.timeLeft = this.time;
    this.lastTime = 0;
    this.lastFrameTime = 0;

    this.obstacleLevel = 0;
  }

  endGame() {
    this.isGameOver = true;
    this.soundControl.playSound("clapping");
    this.openDialog();
    this.animateId && cancelAnimationFrame(this.animateId);
  }
}

const game = new Game({
  element: document.getElementById("GameBoard")!,
  time: 30,
  luck: 0.5,
});
game.init();
