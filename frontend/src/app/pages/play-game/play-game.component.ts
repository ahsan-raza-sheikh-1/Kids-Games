import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { filter, map, switchMap } from 'rxjs';
import { GameCatalogService } from '../../core/services/game-catalog.service';
import { GameDefinition } from '../../core/models/game.models';
import { ProgressService } from '../../core/services/progress.service';
import { SoundService } from '../../core/services/sound.service';
import { RetroGameComponent } from '../../shared/retro-game/retro-game.component';

type PlayStatus = 'idle' | 'correct' | 'incorrect' | 'complete';

@Component({
  selector: 'kids-play-game',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, RetroGameComponent],
  templateUrl: './play-game.component.html',
  styleUrl: './play-game.component.scss',
})
export class PlayGameComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(GameCatalogService);
  private readonly progress = inject(ProgressService);
  private readonly sound = inject(SoundService);
  private readonly destroyRef = inject(DestroyRef);

  readonly game = signal<GameDefinition | null>(null);
  readonly roundIndex = signal(0);
  readonly selectedAnswer = signal<string | null>(null);
  readonly status = signal<PlayStatus>('idle');
  readonly score = signal(0);
  readonly showHint = signal(false);
  readonly finalStars = signal(0);
  readonly isRetroGame = computed(() => {
    const interaction = this.game()?.interaction;
    return interaction === 'snake' || interaction === 'mines' || interaction === 'chess' || interaction === 'checkers';
  });
  readonly currentRound = computed(() => this.game()?.rounds[this.roundIndex()] ?? null);
  readonly progressPercent = computed(() => {
    const currentGame = this.game();
    if (!currentGame) {
      return 0;
    }
    const completedRounds = this.status() === 'complete' ? currentGame.rounds.length : this.roundIndex();
    return (completedRounds / currentGame.rounds.length) * 100;
  });

  constructor() {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => Boolean(id)),
      switchMap(id => this.catalog.getGame(id)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(game => {
      if (!game) {
        void this.router.navigateByUrl('/library');
        return;
      }
      this.game.set(game);
    });
  }

  choose(choiceId: string): void {
    const currentRound = this.currentRound();
    if (!currentRound || this.status() !== 'idle') {
      return;
    }

    this.selectedAnswer.set(choiceId);
    const isCorrect = choiceId === currentRound.answer;
    this.status.set(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      this.score.update(value => value + 1);
      this.sound.play('correct');
    } else {
      this.sound.play('wrong');
    }
  }

  continue(): void {
    const currentGame = this.game();
    if (!currentGame || this.status() === 'idle' || this.status() === 'incorrect') {
      return;
    }

    if (this.roundIndex() >= currentGame.rounds.length - 1) {
      const result = this.progress.completeGame(currentGame.id, this.score(), currentGame.rounds.length);
      this.finalStars.set(result.stars);
      this.status.set('complete');
      this.sound.play('complete');
      return;
    }

    this.roundIndex.update(value => value + 1);
    this.selectedAnswer.set(null);
    this.showHint.set(false);
    this.status.set('idle');
    this.sound.play('tap');
  }

  tryAgain(): void {
    this.selectedAnswer.set(null);
    this.showHint.set(false);
    this.status.set('idle');
    this.sound.play('tap');
  }

  restart(): void {
    this.roundIndex.set(0);
    this.selectedAnswer.set(null);
    this.status.set('idle');
    this.score.set(0);
    this.showHint.set(false);
    this.finalStars.set(0);
    this.sound.play('tap');
  }
}
