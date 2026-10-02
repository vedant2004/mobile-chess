// Web Audio API Unified Game Synthesizer for Chess, Solitaire, Balloon Pop, and UI

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;

  constructor() {
    // AudioContext will initialize on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  private getDestination(): AudioNode | null {
    this.initContext();
    return this.masterGain;
  }

  // --- UI SOUNDS ---
  public playButtonClick() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio error ignored
    }
  }

  // --- CHESS SOUNDS ---
  public playMove() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  public playCapture() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  public playCastle() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.09].forEach((offset) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(280 + offset * 100, now + offset);
        osc.frequency.exponentialRampToValueAtTime(130, now + offset + 0.07);

        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    } catch {}
  }

  public playCheck() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(587.33, now + 0.22);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch {}
  }

  public playGameEnd(victory: boolean = true) {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const notes = victory ? [523.25, 659.25, 783.99, 1046.5] : [440, 392, 349.23, 293.66];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.1;

        osc.type = victory ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {}
  }

  public playLowTime() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // --- SOLITAIRE SOUNDS ---
  public playCardFlip() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  public playCardMove() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  public playFoundationDrop() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  public playSolitaireWin() {
    this.playGameEnd(true);
  }

  // --- BALLOON POP SOUNDS ---
  public playBalloonPop(size: number = 32, combo: number = 1) {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch inversely proportional to size, boosted by combo!
      const baseFreq = 700 - size * 8 + Math.min(10, combo) * 35;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, now + 0.09);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  public playComboChime(combo: number) {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 440 * Math.pow(2, (Math.min(combo, 12) * 2) / 12);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playBonusChime() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      [880, 1108.73, 1318.51].forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(start);
        osc.stop(start + 0.14);
      });
    } catch {}
  }

  public playBombExplosion() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playGameOver() {
    this.playGameEnd(false);
  }
}

export const soundManager = new SoundManager();
