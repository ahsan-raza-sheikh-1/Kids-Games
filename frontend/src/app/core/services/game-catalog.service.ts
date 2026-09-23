import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { GameCatalogResponse, GameDefinition } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class GameCatalogService {
  private readonly http = inject(HttpClient);

  readonly games = signal<GameDefinition[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadGames();
  }

  loadGames(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<GameCatalogResponse>('/api/games').pipe(
      catchError(() => {
        this.error.set('The game shelf is taking a little nap. Start the API, then try again.');
        return of({ version: 0, games: [] } satisfies GameCatalogResponse);
      }),
      finalize(() => this.loading.set(false)),
    ).subscribe(response => this.games.set(response.games));
  }

  getGame(id: string): Observable<GameDefinition | null> {
    const cachedGame = this.games().find(game => game.id === id);
    if (cachedGame) {
      return of(cachedGame);
    }

    return this.http.get<GameDefinition>(`/api/games/${encodeURIComponent(id)}`).pipe(
      map(game => game),
      catchError(() => of(null)),
    );
  }
}
