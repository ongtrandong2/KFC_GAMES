interface CountdownProps {
    wrapperElement: HTMLElement;
}

export default class CountdownControl {
    private currentNumber: number;
    private wrapperElement: HTMLElement;
    private countdownElement: HTMLElement;
    private interval: number | undefined;

    constructor({wrapperElement}: CountdownProps) {
        this.currentNumber = 0;
        this.wrapperElement = wrapperElement;
        this.countdownElement = this.wrapperElement.querySelector(".Countdown")!;
    }

    public start(startNumber: number): Promise<void>  {
        return new Promise<void>((resolve) => {
            this.currentNumber = startNumber;
            this.wrapperElement.style.display = 'flex';
            this.draw();
            this.interval = window.setInterval(() => this.update(resolve), 1000);
        });
    }

    private update(resolve: () => any): void {
        this.currentNumber--;
        if (this.currentNumber > 0) {
            this.draw();
        } else {
            this.stop();
            this.wrapperElement.style.display = 'none';
            resolve();
        }
    }

    private draw(){
        this.countdownElement.textContent = this.currentNumber.toString();
        this.countdownElement.classList.remove('animate-countdown');
        void this.countdownElement.offsetWidth; // Trigger reflow
        this.countdownElement.classList.add('animate-countdown');
    }

    private stop(): void {
        if (this.interval !== undefined) {
            clearInterval(this.interval);
        }
        this.countdownElement.textContent = "";
        this.countdownElement.classList.remove('animate-countdown');
    }

    public reset(): void {
        this.stop();
        this.currentNumber = 0;
    }
}
