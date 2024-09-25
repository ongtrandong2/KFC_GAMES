import Kite from "./classes/Kite.ts";
import GameSoundControl from "../shared/SoundControl.ts";
import CountdownControl from "../shared/CountDownControl.ts";
import AbstractGame from "../shared/AbstractGame.ts";
import Sprite from "../shared/Sprite.ts";
import Collectible from "./classes/Collectible.ts";
import Cloud from "./classes/Cloud.ts";
import backgroundSound from "./sounds/music-fk.mp3";
import rewardSound from "../shared/sounds/reward.mp3";
import clappingSound from "../shared/sounds/clapping.mp3";
import birdSound from "./sounds/bird.mp3";
import wrongSound from "./sounds/wrong.mp3";

const fps: number = 60;

interface GameProps {
  element: HTMLElement; // Container element
  time: number; // Time to play
  luck?: number; // Change spawn object (%/100)
}

class Game extends AbstractGame {
  protected kite: Kite;
  protected clouds: Cloud[] = [];
  protected collectibles: Collectible[] = [];
  protected soundControl: GameSoundControl<
    "soundTrack" | "reward" | "clapping" | "bird" | "wrong"
  >;
  protected countDownControl: CountdownControl;

  protected luck: number;
  protected cloudSpawnTimeout: any;
  protected probabilityIncrementInterval: any;
  protected collectibleSpawnTimeout: any;
  protected cloudSpeed: number;

  private readonly lanes: HTMLElement[];

  private cloudObjectType: ScoreObjectInfo = {
    type: "cloud",
    value: -5,
    weight: 1,
  };

  private scoreObjectTypes: ScoreObjectInfo[] = [
    { type: "bucket", value: 20, weight: 0.2 },
    { type: "bird", value: -10, weight: 0.2 },
    { type: "popcorn", value: 10, weight: 0.6 },
  ];

  constructor({ element, time = 30, luck = 0.2 }: GameProps) {
    super(element, time);
    const kiteElement = document.getElementById("Kite")!;
    this.soundControl = new GameSoundControl();

    const countdownElement = document.getElementById("CountdownWrapper")!;
    this.countDownControl = new CountdownControl({
      wrapperElement: countdownElement,
    });

    this.lanes = Array.from(document.querySelectorAll(".lane"));
    this.kite = new Kite({ element: kiteElement, lanes: this.lanes });

    this.luck = luck;
    this.cloudSpeed = 2;

    this.soundControl
      .loadMultiSound({
        soundTrack: backgroundSound,
        clapping: clappingSound,
        reward: rewardSound,
        bird: birdSound,
        wrong: wrongSound,
      })
      .then((_) => {});
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      this.kite.moveLeft();
    } else if (event.key === "ArrowRight") {
      this.kite.moveRight();
    }
  }

  handleTouchStart(event: TouchEvent) {
    if (!this.isGameOver) {
      const touchX = event.touches[0].clientX;
      const kiteRect = this.kite.element.getBoundingClientRect();
      if (touchX < kiteRect.left) {
        // Clicked on the left side of the kite
        this.kite.moveLeft();
      }
      if (touchX > kiteRect.right) {
        // Clicked on the right side of the kite
        this.kite.moveRight();
      }
    }
  }

  findAvailableLane(): HTMLElement | undefined {
    for (const lane of this.lanes) {
      if (
        !this.collectibles.some((collectible) => collectible.getLane() === lane)
      ) {
        return lane;
      }
    }
    return undefined;
  }

  startCloudSpawn() {
    let probabilityOfTwoLanes = 0.1; // Initial probability

    const incrementProbability = () => {
      // Increase the probability, capped at 1 (100%)
      probabilityOfTwoLanes = Math.min(probabilityOfTwoLanes + 0.1, 1); // Max probability of 100%
    };

    const spawnCloudWithRandomDelay = () => {
      // Increment cloud speed
      this.cloudSpeed += 0.2;
      // Clone and shuffle the lanes array
      const lanesClone = [...this.lanes].sort(() => Math.random() - 0.5);
      const numLanesToUse = Math.random() < probabilityOfTwoLanes ? 2 : 1;
      const selectedLanes = lanesClone.slice(0, numLanesToUse);
      // Spawn clouds in the selected lanes
      selectedLanes.forEach((lane) => {
        this.spawnCloud(lane, this.cloudObjectType);
      });
      // Schedule the next cloud spawn at a random interval between 1.5 and 3 seconds
      const randomDelay = Math.floor(Math.random() * 1500) + 1500;
      this.cloudSpawnTimeout = setTimeout(
        spawnCloudWithRandomDelay,
        randomDelay,
      );
    };
    // Start the first cloud spawn
    spawnCloudWithRandomDelay();
    // Increment the probability every 5 seconds
    this.probabilityIncrementInterval = setInterval(incrementProbability, 5000);
  }

  stopCloudSpawn() {
    clearTimeout(this.cloudSpawnTimeout);
    clearInterval(this.probabilityIncrementInterval);
  }

  spawnCloud(lane: HTMLElement, info: ScoreObjectInfo) {
    const cloud = new Cloud({
      parentElement: lane,
      info,
      speed: this.cloudSpeed,
      onDestroy: () => {
        this.clouds.splice(this.clouds.indexOf(cloud), 1);
      },
    });
    this.clouds.push(cloud);
  }

  startCollectibleSpawn() {
    const spawnCollectibleWithRandomDelay = () => {
      const lane = this.findAvailableLane();
      if (lane) {
        // Logic when no collectible is in the specified lane
        if (
          !this.collectibles.some(
            (collectible) => collectible.getLane() === lane,
          )
        ) {
          // Random item
          const type = this.weightedRandomScoreObjectType();
          if (type) {
            const info = this.scoreObjectTypes.find((obj) => obj.type === type);
            if (info) {
              this.spawnCollectible(lane, info);
            }
          }
        }
      }

      // Schedule the next collectible spawn at a random interval between 1.5 and 3 seconds
      const randomDelay = Math.floor(Math.random() * 1500) + 1500;
      this.collectibleSpawnTimeout = setTimeout(
        spawnCollectibleWithRandomDelay,
        randomDelay,
      );
    };
    // Start the first collectible spawn with delay 2s
    this.collectibleSpawnTimeout = setTimeout(
      spawnCollectibleWithRandomDelay,
      2000,
    );
  }

  stopCollectibleSpawn() {
    clearTimeout(this.collectibleSpawnTimeout);
  }

  spawnCollectible(lane: HTMLElement, info: ScoreObjectInfo) {
    const collectible = new Collectible({
      parentElement: lane,
      info,
      speed: 2,
      onDestroy: () => {
        this.collectibles.splice(this.collectibles.indexOf(collectible), 1);
      },
    });
    this.collectibles.push(collectible);
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

  updateGameObjects() {
    this.clouds.forEach((cloud) => {
      cloud.update();
      if (this.isColliding(this.kite, cloud)) {
        this.updateScore(cloud.value, cloud.rect);
        this.soundControl.playSound("wrong");
        cloud.destroy();
      }
    });

    this.collectibles.forEach((collectible) => {
      collectible.update();
      if (this.isColliding(this.kite, collectible)) {
        this.updateScore(collectible.value, collectible.rect);
        if (collectible.type === "bird") {
          this.soundControl.playSound("bird");
        } else {
          this.soundControl.playSound("reward");
        }
        collectible.destroy();
      }
    });
  }

  isColliding(sprite1: Sprite, sprite2: Sprite): boolean {
    const buffer = 35;

    return !(
      sprite1.rect.right - buffer < sprite2.rect.left ||
      sprite1.rect.left + buffer > sprite2.rect.right ||
      sprite1.rect.bottom < sprite2.rect.top ||
      sprite1.rect.top > sprite2.rect.bottom
    );
  }

  gameLoop = (currentTime: number) => {
    if (!this.isGameOver) {
      const delta = Math.ceil(currentTime - this.lastFrameTime);
      if (delta >= Math.floor(1000 / fps)) {
        this.updateTimer(currentTime);
        this.kite.update();
        this.updateGameObjects();
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
      document.addEventListener("keydown", this.handleKeyPress.bind(this));
      document.addEventListener("touchstart", this.handleTouchStart.bind(this));
      this.lastTime = performance.now();
      this.lastFrameTime = performance.now();
      this.startCloudSpawn();
      this.startCollectibleSpawn();
      this.gameLoop(this.lastFrameTime);
    });
  }

  reset() {
    if (this.animateId) {
      cancelAnimationFrame(this.animateId);
    }
    this.stopCloudSpawn();
    this.stopCollectibleSpawn();
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
    this.stopCloudSpawn();
    this.stopCollectibleSpawn();
    this.animateId && cancelAnimationFrame(this.animateId);
  }
}

const game = new Game({
  element: document.getElementById("GameBoard")!,
  time: 30,
  luck: 0.2,
});
game.init();
