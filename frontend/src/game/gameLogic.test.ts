import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  isValidDirectionChange,
  moveSnake,
  changeDirection,
  startGame,
  pauseGame,
  resumeGame,
  togglePause,
  setGameMode,
  getOppositeDirection,
} from './gameLogic';
import { GameState, Position } from './types';

describe('createInitialState', () => {
  it('creates a valid initial state with default config', () => {
    const state = createInitialState();
    
    expect(state.snake.length).toBe(3);
    expect(state.status).toBe('idle');
    expect(state.score).toBe(0);
    expect(state.direction).toBe('RIGHT');
    expect(state.gridSize).toBe(20);
  });

  it('respects custom config', () => {
    const state = createInitialState({ gridSize: 30, mode: 'pass-through' });
    
    expect(state.gridSize).toBe(30);
    expect(state.mode).toBe('pass-through');
  });
});

describe('generateFood', () => {
  it('generates food not on snake', () => {
    const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
    const food = generateFood(snake, 10);
    
    const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
    expect(onSnake).toBe(false);
  });

  it('generates food within grid bounds', () => {
    const gridSize = 10;
    const snake: Position[] = [{ x: 5, y: 5 }];
    const food = generateFood(snake, gridSize);
    
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(gridSize);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(gridSize);
  });
});

describe('isValidDirectionChange', () => {
  it('allows perpendicular direction changes', () => {
    expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
    expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
  });

  it('prevents opposite direction changes', () => {
    expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
    expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
    expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
    expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
  });

  it('allows same direction', () => {
    expect(isValidDirectionChange('UP', 'UP')).toBe(true);
    expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
  });
});

describe('getOppositeDirection', () => {
  it('returns correct opposite directions', () => {
    expect(getOppositeDirection('UP')).toBe('DOWN');
    expect(getOppositeDirection('DOWN')).toBe('UP');
    expect(getOppositeDirection('LEFT')).toBe('RIGHT');
    expect(getOppositeDirection('RIGHT')).toBe('LEFT');
  });
});

describe('moveSnake', () => {
  it('moves snake in the current direction', () => {
    const state = createInitialState();
    const playingState: GameState = { ...state, status: 'playing' };
    const movedState = moveSnake(playingState);
    
    expect(movedState.snake[0].x).toBe(state.snake[0].x + 1);
    expect(movedState.snake[0].y).toBe(state.snake[0].y);
  });

  it('does not move when not playing', () => {
    const state = createInitialState();
    const movedState = moveSnake(state);
    
    expect(movedState.snake).toEqual(state.snake);
  });

  it('ends game on wall collision in walls mode', () => {
    const state: GameState = {
      ...createInitialState({ mode: 'walls' }),
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      status: 'playing',
    };
    
    const movedState = moveSnake(state);
    expect(movedState.status).toBe('game-over');
  });

  it('wraps around in pass-through mode', () => {
    const state: GameState = {
      ...createInitialState({ mode: 'pass-through' }),
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      status: 'playing',
    };
    
    const movedState = moveSnake(state);
    expect(movedState.status).toBe('playing');
    expect(movedState.snake[0].x).toBe(0);
  });

  it('increases score when eating food', () => {
    const state: GameState = {
      ...createInitialState(),
      snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
      food: { x: 6, y: 5 },
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      status: 'playing',
    };
    
    const movedState = moveSnake(state);
    expect(movedState.score).toBe(10);
    expect(movedState.snake.length).toBe(3);
  });

  it('ends game on self collision', () => {
    const state: GameState = {
      ...createInitialState(),
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
      ],
      direction: 'DOWN',
      nextDirection: 'DOWN',
      status: 'playing',
    };
    
    const movedState = moveSnake(state);
    expect(movedState.status).toBe('game-over');
  });
});

describe('changeDirection', () => {
  it('changes to valid direction when playing', () => {
    const state: GameState = { ...createInitialState(), status: 'playing' };
    const newState = changeDirection(state, 'UP');
    
    expect(newState.nextDirection).toBe('UP');
  });

  it('ignores invalid direction change', () => {
    const state: GameState = { ...createInitialState(), status: 'playing', direction: 'RIGHT' };
    const newState = changeDirection(state, 'LEFT');
    
    expect(newState.nextDirection).toBe('RIGHT');
  });

  it('does not change when not playing', () => {
    const state = createInitialState();
    const newState = changeDirection(state, 'UP');
    
    expect(newState.nextDirection).toBe('RIGHT');
  });
});

describe('startGame', () => {
  it('starts game from idle', () => {
    const state = createInitialState();
    const newState = startGame(state);
    
    expect(newState.status).toBe('playing');
  });

  it('resets and starts from game-over', () => {
    const state: GameState = { ...createInitialState(), status: 'game-over', score: 100 };
    const newState = startGame(state);
    
    expect(newState.status).toBe('playing');
    expect(newState.score).toBe(0);
  });
});

describe('pauseGame', () => {
  it('pauses when playing', () => {
    const state: GameState = { ...createInitialState(), status: 'playing' };
    const newState = pauseGame(state);
    
    expect(newState.status).toBe('paused');
  });

  it('does nothing when not playing', () => {
    const state = createInitialState();
    const newState = pauseGame(state);
    
    expect(newState.status).toBe('idle');
  });
});

describe('resumeGame', () => {
  it('resumes when paused', () => {
    const state: GameState = { ...createInitialState(), status: 'paused' };
    const newState = resumeGame(state);
    
    expect(newState.status).toBe('playing');
  });

  it('does nothing when not paused', () => {
    const state: GameState = { ...createInitialState(), status: 'playing' };
    const newState = resumeGame(state);
    
    expect(newState.status).toBe('playing');
  });
});

describe('togglePause', () => {
  it('pauses when playing', () => {
    const state: GameState = { ...createInitialState(), status: 'playing' };
    const newState = togglePause(state);
    
    expect(newState.status).toBe('paused');
  });

  it('resumes when paused', () => {
    const state: GameState = { ...createInitialState(), status: 'paused' };
    const newState = togglePause(state);
    
    expect(newState.status).toBe('playing');
  });

  it('does nothing when idle', () => {
    const state = createInitialState();
    const newState = togglePause(state);
    
    expect(newState.status).toBe('idle');
  });
});

describe('setGameMode', () => {
  it('sets game mode to pass-through', () => {
    const state = createInitialState();
    const newState = setGameMode(state, 'pass-through');
    
    expect(newState.mode).toBe('pass-through');
  });

  it('sets game mode to walls', () => {
    const state = createInitialState({ mode: 'pass-through' });
    const newState = setGameMode(state, 'walls');
    
    expect(newState.mode).toBe('walls');
  });
});
