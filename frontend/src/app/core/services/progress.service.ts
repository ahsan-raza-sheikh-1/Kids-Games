import { Injectable, computed, signal } from '@angular/core';
import { ProgressEntry, ProgressState } from '../models/game.models';

export interface GameResult {
  stars: number;
  isNewBest: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly storageKey = 'brighttrail-progress-v1';
  private readonly state = signal<ProgressState>(this.readState());

  readonly progress = this.state.asReadonly();
  readonly totalStars = computed(() => Object.values(this.state().completed)
    .reduce((total, entry) => total + entry.stars, 0));

  isCompleted(gameId: string): boolean {
    return Boolean(this.state().completed[gameId]);
  }

  getEntry(gameId: string): ProgressEntry | undefined {
    return this.state().completed[gameId];
  }

  completeGame(gameId: string, correctAnswers: number, totalRounds: number): GameResult {
    const scoreRatio = totalRounds === 0 ? 0 : correctAnswers / totalRounds;
    const stars = Math.max(1, Math.min(3, Math.ceil(scoreRatio * 3)));
    const previous = this.state().completed[gameId];
    const isNewBest = !previous || correctAnswers > previous.bestScore;
    const entry: ProgressEntry = {
      gameId,
      bestScore: Math.max(correctAnswers, previous?.bestScore ?? 0),
      stars: Math.max(stars, previous?.stars ?? 0),
      completedAt: new Date().toISOString(),
    };

    this.state.update(current => ({
      ...current,
      completed: { ...current.completed, [gameId]: entry },
    }));
    this.writeState(this.state());

    return { stars: entry.stars, isNewBest };
  }

  clearProgress(): void {
    const emptyState = { completed: {} } satisfies ProgressState;
    this.state.set(emptyState);
    this.writeState(emptyState);
  }

  private readState(): ProgressState {
    if (typeof localStorage === 'undefined') {
      return { completed: {} };
    }

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) {
        return { completed: {} };
      }
      return JSON.parse(saved) as ProgressState;
    } catch {
      return { completed: {} };
    }
  }

  private writeState(state: ProgressState): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    }
  }
}
