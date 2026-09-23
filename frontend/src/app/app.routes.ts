import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'BrightTrail | Learning Games',
    loadComponent: () => import('./pages/home/home.component').then(module => module.HomeComponent),
  },
  {
    path: 'library',
    title: 'Game Shelf | BrightTrail',
    loadComponent: () => import('./pages/library/library.component').then(module => module.LibraryComponent),
  },
  {
    path: 'play/:id',
    title: 'Play | BrightTrail',
    loadComponent: () => import('./pages/play-game/play-game.component').then(module => module.PlayGameComponent),
  },
  { path: '**', redirectTo: '' },
];
