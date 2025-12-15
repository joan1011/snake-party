export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'pass-through' | 'walls';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  speed: number;
  gridSize: number;
}

export interface GameConfig {
  gridSize: number;
  initialSpeed: number;
  speedIncrement: number;
  mode: GameMode;
}

export const DEFAULT_CONFIG: GameConfig = {
  gridSize: 20,
  initialSpeed: 150,
  speedIncrement: 2,
  mode: 'walls',
};
