import Ball from "./classes/Ball.ts";
import GameSoundControl from "../shared/SoundControl.ts";
import CountdownControl from "../shared/CountDownControl.ts";
import AbstractGame from "../shared/AbstractGame.ts";
import Item, { ItemInfo } from "./classes/Item.ts";
import soundTrack from "/src/baj/sounds/music.mp3";
import wrongSound from "/src/baj/sounds/wrong.mp3";
import rewardSound from "/src/shared/sounds/reward.mp3";
import clappingSound from "../shared/sounds/clapping.mp3";

const fps: number = 60;

interface GameProps {
  element: HTMLElement; // Container element
  time: number; // Time to play
  luck?: number; // Change spawn object (%/100)
}

class Game extends AbstractGame {
  protected ball: Ball;
  protected soundControl: GameSoundControl<
    "soundTrack" | "wrong" | "reward" | "clapping"
  >;
  protected countDownControl: CountdownControl;
  protected tableElement: HTMLElement;

  protected luck: number;
  protected items: Item[] = []; // Array to store items
  protected rewards: Item[] = []; // Array to store rewards

  private scoreObjectTypes: ItemInfo[] = [
    { type: "chopstick", value: 10, weight: 0.7 },
    { type: "spoon", value: -5, weight: 0.15 },
    { type: "fork", value: -10, weight: 0.15 },
  ];
  constructor({ element, time = 30, luck = 0.2 }: GameProps) {
    super(element, time);
    const ballElement = document.getElementById("Ball")!;
    this.tableElement = document.getElementById("GameTable")!;
    this.soundControl = new GameSoundControl();

    const countdownElement = document.getElementById("CountdownWrapper")!;
    this.countDownControl = new CountdownControl({
      wrapperElement: countdownElement,
    });

    this.ball = new Ball({
      element: ballElement,
      handPosition: 50,
      initialHoldTimeMin: 1200,
      initialHoldTimeMax: 800,
    });
    this.luck = luck;
    this.soundControl
      .loadMultiSound({
        soundTrack: soundTrack,
        wrong: wrongSound,
        reward: rewardSound,
        clapping: clappingSound,
      })
      .then((_) => {});
  }

  init() {
    this.menuDisplay.style.display = "flex";
    this.listener();
  }

  spawnRewards() {
    const [min, max] = [2, 5];
    let totalRewardItem = Math.floor(Math.random() * (max - min + 1) + min);
    // Spawner
    const spawner = () => {
      const timeout = Math.floor(Math.random() * 5000) + 2000;
      const timer = setTimeout(() => {
        if (totalRewardItem <= 0) {
          clearTimeout(timer);
          return;
        }
        const item = new Item({
          wrapperElement: this.tableElement,
          item: { type: "cake", value: 20, weight: 0.7 },
          onClick: () => {
            // Decrease total reward item
            totalRewardItem--;
            this.handleRewardClick.bind(this)(item);
          },
        });
        this.rewards.push(item);

        // Remove item after 2-5 seconds
        const rewardTimer = setTimeout(
          () => {
            item.remove();
            this.rewards = this.rewards.filter((i) => i !== item);
            clearTimeout(rewardTimer);
          },
          Math.floor(Math.random() * 3000) + 2000,
        );

        spawner();
        clearTimeout(timer);
      }, timeout);
    };
    spawner();
  }

  handleRewardClick(item: Item) {
    if (this.ball.isFlying && !this.isGameOver) {
      this.soundControl.playSound("reward");
      this.updateScore(item.info.value, item.rect);
      item.remove();
      this.rewards = this.rewards.filter((i) => i !== item);
    }
  }

  spawnItems() {
    const [min, max] = [10, 20];
    const itemCount = Math.floor(Math.random() * (max - min + 1) + min);

    for (let i = 0; i < itemCount; i++) {
      // Spawn change depend on weight
      const type = this.weightedRandomScoreObjectType();
      if (type) {
        const info = this.scoreObjectTypes.find((obj) => obj.type === type);
        if (info) {
          const item = new Item({
            wrapperElement: this.tableElement,
            item: info,
            onClick: this.handleItemClick.bind(this),
          });
          this.items.push(item);
        }
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

  handleItemClick(item: Item) {
    if (this.ball.isFlying && !this.isGameOver) {
      if (item.info.value < 0) {
        this.soundControl.playSound("wrong");
      }
      this.updateScore(item.info.value, item.rect);
      item.remove();
      this.items = this.items.filter((i) => i !== item);
    }
  }

  gameLoop = (currentTime: number) => {
    if (!this.isGameOver) {
      const delta = Math.ceil(currentTime - this.lastFrameTime);
      if (delta >= Math.floor(1000 / fps)) {
        this.updateTimer(currentTime);
        this.ball.updatePosition(currentTime);
        this.lastFrameTime = currentTime;
      }
      this.animateId = requestAnimationFrame(this.gameLoop);
    }
  };

  startGame() {
    this.soundControl.playSound("soundTrack", true);
    this.menuDisplay.style.display = "none";
    this.gameBoardDisplay.style.display = "block";
    this.countDownControl.start(3).then(() => {
      this.lastTime = performance.now();
      this.lastFrameTime = performance.now();
      this.spawnItems();
      this.spawnRewards();
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
  luck: 0.2,
});
game.init();
