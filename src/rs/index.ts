import Character from "./classes/Character.ts";
import Rope from "./classes/Rope.ts";
import ScoreObject from "./classes/ScoreObject.ts";
import AbstractGame from "../shared/AbstractGame.ts";
import GameSoundControl from "../shared/SoundControl.ts";
import backgroundSound from "./sounds/music.mp3";
import rewardSound from "../shared/sounds/reward.mp3";
import clappingSound from "../shared/sounds/clapping.mp3";
import jumpSound from "./sounds/jump.mp3";
import eggSound from "./sounds/egg.mp3";
import ouchSound from "./sounds/ouch.mp3";
import CountdownControl from "../shared/CountDownControl.ts";

const fps: number = 60;

interface GameProps {
  element: HTMLElement; // Container element
  time: number; // Time to play
  luck?: number; // Change spawn object (%/100)
}

class Game extends AbstractGame {
  protected character: Character;
  protected rope: Rope;
  protected scoreObject: ScoreObject | null;
  protected soundControl: GameSoundControl<
    "soundTrack" | "clapping" | "reward" | "jump" | "ouch" | "egg"
  >;
  protected countDownControl: CountdownControl;
  protected testMode: boolean;
  protected isGameOver: boolean;
  protected animateId: number | null;
  protected roundScoreMap: Array<number>;
  protected roundSpawnMap: Array<number>;
  protected time: number;
  protected timeLeft: number;
  protected luck: number;
  protected lastTime: number;
  protected lastFrameTime: number;

  private scoreObjectTypes: ScoreObjectInfo[] = [
    { type: "bucket", value: 20, weight: 0.2 },
    { type: "popcorn", value: 10, weight: 0.4 },
    { type: "egg", value: -10, weight: 0.4 },
  ];

  constructor({ element, time = 30, luck = 0.2 }: GameProps) {
    super(element, time);
    const characterElement = document.getElementById("Character")!;
    const ropeElement = document.getElementById("Rope")!;
    this.soundControl = new GameSoundControl();

    const countdownElement = document.getElementById("CountdownWrapper")!;
    this.countDownControl = new CountdownControl({
      wrapperElement: countdownElement,
    });
    this.soundControl
      .loadMultiSound({
        soundTrack: backgroundSound,
        clapping: clappingSound,
        reward: rewardSound,
        jump: jumpSound,
        ouch: ouchSound,
        egg: eggSound,
      })
      .then((_) => {});

    this.character = new Character({ element: characterElement, gravity: 1.2 });
    this.rope = new Rope({ element: ropeElement, speed: 2, roundInterval: 3 });
    this.scoreObject = null;
    this.testMode = false;
    this.isGameOver = false;
    this.animateId = null;
    this.time = time;
    this.timeLeft = time;
    this.luck = luck;
    this.lastTime = 0;
    this.lastFrameTime = 0;
    this.roundScoreMap = [];
    this.roundSpawnMap = [];
  }
  init() {
    this.menuDisplay.style.display = "flex";
    this.listener();
  }

  jumpControl() {
    if (!this.isGameOver) {
      this.soundControl.playSound("jump");
      this.character.jump(15);
    }
  }

  nextRoundControl(checkRounds: number) {
    // Mark round process
    this.roundScoreMap.push(checkRounds);
  }

  spawnScoreObject() {
    const checkRounds = this.rope.actRounds;
    // Prevent respawn
    if (this.roundSpawnMap.includes(checkRounds)) return;

    if (
      !this.scoreObject &&
      !this.character.jumping &&
      this.roundScoreMap.length !== 0
    ) {
      if (Math.random() < this.luck) {
        // % chance to spawn a score object

        // Spawn change depend on weight
        const type = this.weightedRandomScoreObjectType();
        if (type) {
          const info = this.scoreObjectTypes.find((obj) => obj.type === type);
          if (info) {
            this.scoreObject = new ScoreObject({
              parentElement: this.element,
              info,
            });
          }
        }
        // Random time to despawn with min 1s to max 3s
        const timer = setTimeout(
          () => {
            this.scoreObject?.destroy();
            this.scoreObject = null;
            clearTimeout(timer);
          },
          Math.floor(Math.random() * 2000) + 1000,
        );
      }

      this.roundSpawnMap.push(checkRounds);
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

  checkCollision() {
    const checkRounds = this.rope.actRounds;
    const isSkipping = this.rope.actRounds !== this.rope.rounds;

    if (this.roundScoreMap.includes(checkRounds)) return;

    if (
      (this.rope.angle > 350 || isSkipping) &&
      !this.character.invincibilityFrames
    ) {
      // Collision detected
      if (this.character.bottom <= 20 || !this.character.jumping) {
        this.character.shield();
        // Fail rope
        this.soundControl.playSound("ouch");
        this.updateScore(-5);
      }
      if (this.character.jumping && this.character.bottom > 20) {
        // Pass rope
        this.updateScore(5);
      }
      // Control next round
      this.nextRoundControl(checkRounds);
    }
  }

  checkCollisionScoreObj() {
    if (!this.scoreObject) return;

    if (
      this.scoreObject.isSpawned &&
      this.character.rect.bottom > this.scoreObject.rect.top &&
      this.character.rect.top < this.scoreObject.rect.bottom &&
      this.character.rect.left < this.scoreObject.rect.right &&
      this.character.rect.right > this.scoreObject.rect.left
    ) {
      this.updateScore(this.scoreObject.value, this.scoreObject.rect);
      if (this.scoreObject.value > 0) {
        this.soundControl.playSound("reward");
      } else {
        this.soundControl.playSound("egg");
      }

      this.scoreObject.destroy();
      this.scoreObject = null;
    }
  }

  gameLoop = (currentTime: number) => {
    if (!this.isGameOver) {
      const delta = Math.ceil(currentTime - this.lastFrameTime);
      if (delta >= Math.floor(1000 / fps)) {
        this.character.update();
        this.rope.update();
        this.checkCollision();
        this.checkCollisionScoreObj();
        this.updateTimer(currentTime);

        // Spawn score object
        this.spawnScoreObject();

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
      this.gameLoop(this.lastFrameTime);
    });
  }

  reset() {
    if (this.animateId) {
      cancelAnimationFrame(this.animateId);
    }
    if (this.scoreObject) {
      this.scoreObject.destroy();
    }
    this.setScore(0);
    this.scoreObject = null;
    this.testMode = false;
    this.isGameOver = false;
    this.animateId = null;
    this.timeLeft = this.time;
    this.lastTime = 0;
    this.lastFrameTime = 0;
    this.roundScoreMap = [];
    this.roundSpawnMap = [];
  }

  endGame() {
    this.isGameOver = true;
    this.soundControl.playSound("clapping");
    this.openDialog();
    this.rope.reset();
    this.character.reset();
    this.animateId && cancelAnimationFrame(this.animateId);
  }
}

const game = new Game({
  element: document.getElementById("Playground")!,
  time: 30,
  luck: 0.5,
});
game.init();
