import Sprite from "../../shared/Sprite.ts";

interface RopeProps {
    element: HTMLElement;
    speed: number;
    extraTimePerRound?: number;
    roundInterval?: number;
}

export default class Rope extends Sprite {
    speed: number;
    angle: number;
    previousAngle: number;
    rounds: number;  // Count current round
    actRounds: number;
    extraTimePerRound: number; // Time increase per round
    roundInterval: number;
    initialProps: Required<RopeProps>;

    constructor({ element, speed, extraTimePerRound = 0.2, roundInterval = 4 }: RopeProps) {
        super(element);
        this.speed = speed; // Speed in seconds for one full rotation
        this.angle = 0;
        this.previousAngle = 0; // New property to track previous angle
        this.rounds = 0;
        this.actRounds = 0;
        this.extraTimePerRound = extraTimePerRound;
        this.roundInterval = roundInterval;

        this.initialProps = Object.assign({ element, speed, extraTimePerRound, roundInterval });
    }

    increaseSpeed() {
        this.speed = Math.max(0.5, this.speed - this.extraTimePerRound); // Increase speed (decrease the duration)
    }

    update() {
        super.update();

        // Sometimes frame skip angle to new round
        this.actRounds = this.rounds;

        this.angle = Math.floor((this.angle + (360 / (this.speed * 60))) % 360);
        if (this.angle < this.previousAngle) {
            this.rounds++;
            // SpeedUp
            if (this.rounds % this.roundInterval === 0) {
                console.log("Speed up")
                this.increaseSpeed();
            }
        }
        this.previousAngle = this.angle

        this.element.style.transform = `rotateX(${-this.angle}deg)`;
        if (this.angle >= 0 && this.angle <= 180) {
            this.element.style.zIndex = '1';
        } else {
            this.element.style.zIndex = '3';
        }
    }

    reset() {
        super.reset();

        this.speed = this.initialProps.speed;
        this.angle = 0;
        this.previousAngle = 0;
        this.rounds = 0;
        this.actRounds = 0;
        this.extraTimePerRound = this.initialProps.extraTimePerRound;
        this.roundInterval = this.initialProps.roundInterval;
    }
}