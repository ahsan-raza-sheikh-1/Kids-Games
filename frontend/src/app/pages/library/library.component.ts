import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AgeBand } from '../../core/models/game.models';
import { GameCatalogService } from '../../core/services/game-catalog.service';
import { GameCardComponent } from '../../shared/game-card/game-card.component';

@Component({
  selector: 'kids-library',
  standalone: true,
  imports: [MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, GameCardComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent {
  readonly catalog = inject(GameCatalogService);
  readonly selectedAgeBand = signal<AgeBand | 'all'>('all');
  readonly selectedCategory = signal('all');
  readonly searchTerm = signal('');
  readonly categories = computed(() => Array.from(new Set(this.catalog.games().map(game => game.category))).sort());
  readonly filteredGames = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.catalog.games().filter(game => {
      const matchesAge = this.selectedAgeBand() === 'all' || game.ageBand === this.selectedAgeBand();
      const matchesCategory = this.selectedCategory() === 'all' || game.category === this.selectedCategory();
      const matchesSearch = !term || [game.title, game.description, ...game.skills]
        .join(' ')
        .toLowerCase()
        .includes(term);
      return matchesAge && matchesCategory && matchesSearch;
    });
  });

  selectAgeBand(value: string): void {
    if (value === 'all' || value === '5-10' || value === '10-15') {
      this.selectedAgeBand.set(value);
    }
  }

  setSearchTerm(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
