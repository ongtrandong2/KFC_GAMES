export default class GameSoundControl<T extends string> {
  private audioContext: AudioContext;
  private sounds: Map<T, AudioBuffer>;
  private sources: Map<T, AudioBufferSourceNode>;
  private isMuted: boolean;
  private readonly gainNode: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.sounds = new Map<T, AudioBuffer>();
    this.sources = new Map<T, AudioBufferSourceNode>();
    this.isMuted = false;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  async loadSound(name: T, src: string): Promise<void> {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  async loadMultiSound(sounds: Partial<Record<T, string>>): Promise<void> {
    const promises = Object.keys(sounds).map(async (name) => {
      const src = sounds[name as T];
      if (src) {
        await this.loadSound(name as T, src);
      }
    });
    await Promise.all(promises);
  }

  playSound(name: T, loop: boolean = false): void {
    const sound = this.sounds.get(name);
    if (sound && !this.isMuted) {
      const source = this.audioContext.createBufferSource();
      source.buffer = sound;
      source.loop = loop;
      source.connect(this.gainNode);
      source.start(0);
      this.sources.set(name, source);
    }
  }

  stopSound(name: T): void {
    const source = this.sources.get(name);
    if (source) {
      source.stop(0);
      this.sources.delete(name);
    }
  }

  mute(): void {
    this.isMuted = true;
    this.gainNode.gain.value = 0;
  }

  unmute(): void {
    this.isMuted = false;
    this.gainNode.gain.value = 1;
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.gainNode.gain.value = this.isMuted ? 0 : 1;
  }

  setVolume(volume: number): void {
    this.gainNode.gain.value = volume;
  }
}
