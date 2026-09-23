import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GameDefinition } from '../../core/models/game.models';
import { ProgressService } from '../../core/services/progress.service';

@Component({
  selector: 'kids-game-card',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
})
export class GameCardComponent {
  readonly game = input.required<GameDefinition>();
  readonly progress = inject(ProgressService);
}
