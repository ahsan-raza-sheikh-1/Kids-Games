export type AgeBand = '5-10' | '10-15';
export type GameInteraction = 'choice' | 'pattern' | 'snake' | 'mines' | 'chess' | 'checkers';

export interface GameSettings {
  boardSize?: number;
  mineCount?: number;
  targetScore?: number;
  maxTargetScore?: number;
  tickMilliseconds?: number;
}

export interface GameChoice {
  id: string;
  label: string;
}

export interface GameRound {
  prompt: string;
  visual: string;
  choices: GameChoice[];
  answer: string;
  hint: string;
}

export interface GameDefinition {
  id: string;
  title: string;
  ageBand: AgeBand;
  minAge: number;
  maxAge: number;
  category: string;
  icon: string;
  accent: string;
  description: string;
  skills: string[];
  durationMinutes: number;
  difficulty: string;
  interaction: GameInteraction;
  rounds: GameRound[];
  settings?: GameSettings;
}

export interface GameCatalogResponse {
  version: number;
  games: GameDefinition[];
}

export interface ProgressEntry {
  gameId: string;
  bestScore: number;
  stars: number;
  completedAt: string;
}

export interface ProgressState {
  completed: Record<string, ProgressEntry>;
}
