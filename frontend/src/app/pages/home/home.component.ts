import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AgeBand } from '../../core/models/game.models';
import { GameCatalogService } from '../../core/services/game-catalog.service';
import { ProgressService } from '../../core/services/progress.service';
import { GameCardComponent } from '../../shared/game-card/game-card.component';

@Component({
  selector: 'kids-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, MatIconModule, GameCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly catalog = inject(GameCatalogService);
  readonly progress = inject(ProgressService);
  readonly selectedAgeBand = signal<AgeBand>('5-10');
  readonly featuredGames = computed(() => this.catalog.games()
    .filter(game => game.ageBand === this.selectedAgeBand())
    .slice(0, 3));

  selectAgeBand(value: string): void {
    if (value === '5-10' || value === '10-15') {
      this.selectedAgeBand.set(value);
    }
  }
}
