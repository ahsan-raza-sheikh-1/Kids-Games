import { Injectable, signal } from '@angular/core';

type SoundName = 'tap' | 'correct' | 'wrong' | 'complete';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private audioContext?: AudioContext;
  readonly enabled = signal(true);

  toggle(): void {
    this.enabled.update(value => !value);
  }

  play(name: SoundName): void {
    if (!this.enabled() || typeof window === 'undefined') {
      return;
    }

    const AudioContextConstructor = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    this.audioContext ??= new AudioContextConstructor();
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequencies: Record<SoundName, number[]> = {
      tap: [440],
      correct: [523.25, 659.25],
      wrong: [220, 180],
      complete: [523.25, 659.25, 783.99],
    };
    const notes = frequencies[name];

    oscillator.type = name === 'wrong' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(notes[0], now);
    notes.slice(1).forEach((frequency, index) => {
      oscillator.frequency.setValueAtTime(frequency, now + (index + 1) * 0.1);
    });
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22 + notes.length * 0.08);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.28 + notes.length * 0.08);
  }
}
