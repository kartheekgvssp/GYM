// Haptics & Sensory Feedback Engine for Iron Log PWA
// Provides both physical vibration (navigator.vibrate) and zero-latency Web Audio micro-clicks

const HAPTICS_KEY = 'ironlog_haptics_enabled';
const SOUND_KEY = 'ironlog_sound_enabled';

class HapticsEngine {
  private hapticsEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedHaptic = localStorage.getItem(HAPTICS_KEY);
      this.hapticsEnabled = savedHaptic !== null ? savedHaptic === 'true' : true;

      const savedSound = localStorage.getItem(SOUND_KEY);
      this.soundEnabled = savedSound !== null ? savedSound === 'true' : true;
    }
  }

  public get isVibrateSupported(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator;
  }

  public get isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public get isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setHapticsEnabled(enabled: boolean): void {
    this.hapticsEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(HAPTICS_KEY, String(enabled));
      window.dispatchEvent(new CustomEvent('ironlog_sensory_changed'));
    }
    if (enabled) {
      this.tap();
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_KEY, String(enabled));
      window.dispatchEvent(new CustomEvent('ironlog_sensory_changed'));
    }
    if (enabled) {
      this.playClickSound();
    }
  }

  private initAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Raw vibration executor
  public vibrate(pattern: number | number[]): void {
    if (!this.hapticsEnabled || !this.isVibrateSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error on restricted frames
    }
  }

  // --- Tactile Sensory Signatures ---

  // Light micro-tap (nav tabs, buttons, chip selection)
  public tap(): void {
    this.vibrate(10);
    if (this.soundEnabled) {
      this.playClickSound(900, 0.04, 0.015);
    }
  }

  // Step increment (+2.5, +5, reps notch)
  public step(): void {
    this.vibrate(15);
    if (this.soundEnabled) {
      this.playClickSound(1200, 0.05, 0.02);
    }
  }

  // Success notch (set logged, workout saved)
  public success(): void {
    this.vibrate([18, 40, 24]);
    if (this.soundEnabled) {
      this.playTwoTone(523.25, 659.25, 0.06);
    }
  }

  // Warning/Delete
  public warning(): void {
    this.vibrate([35, 45, 35]);
    if (this.soundEnabled) {
      this.playClickSound(300, 0.08, 0.06);
    }
  }

  // Personal Record (PR) celebration buzz
  public prCelebration(): void {
    this.vibrate([50, 40, 90, 50, 160, 50, 240]);
    if (this.soundEnabled) {
      this.playFanfare();
    }
  }

  // Rest timer countdown ticks (3, 2, 1)
  public timerTick(): void {
    this.vibrate(8);
    if (this.soundEnabled) {
      this.playClickSound(750, 0.04, 0.02);
    }
  }

  // Rest timer completed alarm
  public timerComplete(): void {
    this.vibrate([120, 70, 160, 70, 260]);
    if (this.soundEnabled) {
      this.playTimerBuzzer();
    }
  }

  // Workout completed
  public sessionFinished(): void {
    this.vibrate([80, 50, 120, 50, 180]);
    if (this.soundEnabled) {
      this.playTwoTone(587.33, 880.0, 0.12);
    }
  }

  // --- Web Audio Synthesis (zero external audio file dependency) ---

  private playClickSound(freq: number = 800, gainLevel: number = 0.05, duration: number = 0.02): void {
    const ctx = this.initAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay restrictions
    }
  }

  private playTwoTone(f1: number, f2: number, dur: number): void {
    const ctx = this.initAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f1, now);
      osc.frequency.setValueAtTime(f2, now + dur);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur * 2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + dur * 2);
    } catch {
      // Ignore
    }
  }

  private playFanfare(): void {
    const ctx = this.initAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.09, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.15);
      });
    } catch {
      // Ignore
    }
  }

  private playTimerBuzzer(): void {
    const ctx = this.initAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Dual-pulse gym buzzer
      [0, 0.18, 0.36].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch {
      // Ignore
    }
  }
}

export const haptics = new HapticsEngine();
