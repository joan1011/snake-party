import { Direction, Position, GameState, GameConfig, DEFAULT_CONFIG, GameStatus } from './types';

export function createInitialState(config: Partial<GameConfig> = {}): GameState {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const center = Math.floor(fullConfig.gridSize / 2);
  
  return {
    snake: [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ],
    food: generateFood([{ x: center, y: center }, { x: center - 1, y: center }, { x: center - 2, y: center }], fullConfig.gridSize),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    status: 'idle',
    mode: fullConfig.mode,
    speed: fullConfig.initialSpeed,
    gridSize: fullConfig.gridSize,
  };
}

export function generateFood(snake: Position[], gridSize: number): Position {
  const availablePositions: Position[] = [];
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const isOnSnake = snake.some(segment => segment.x === x && segment.y === y);
      if (!isOnSnake) {
        availablePositions.push({ x, y });
      }
    }
  }
  
  if (availablePositions.length === 0) {
    return { x: 0, y: 0 };
  }
  
  return availablePositions[Math.floor(Math.random() * availablePositions.length)];
}

export function getOppositeDirection(direction: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return next !== getOppositeDirection(current);
}

export function moveSnake(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  const head = state.snake[0];
  const direction = state.nextDirection;
  
  let newHead: Position;
  
  switch (direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle wall collision based on mode
  if (state.mode === 'pass-through') {
    // Wrap around
    if (newHead.x < 0) newHead.x = state.gridSize - 1;
    if (newHead.x >= state.gridSize) newHead.x = 0;
    if (newHead.y < 0) newHead.y = state.gridSize - 1;
    if (newHead.y >= state.gridSize) newHead.y = 0;
  } else {
    // Walls mode - check for collision
    if (
      newHead.x < 0 ||
      newHead.x >= state.gridSize ||
      newHead.y < 0 ||
      newHead.y >= state.gridSize
    ) {
      return { ...state, status: 'game-over' };
    }
  }

  // Check for self collision
  const hitsSelf = state.snake.some(
    (segment, index) => index !== state.snake.length - 1 && segment.x === newHead.x && segment.y === newHead.y
  );
  
  if (hitsSelf) {
    return { ...state, status: 'game-over' };
  }

  // Check for food
  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;
  
  let newSnake: Position[];
  let newFood = state.food;
  let newScore = state.score;
  let newSpeed = state.speed;

  if (ateFood) {
    newSnake = [newHead, ...state.snake];
    newFood = generateFood(newSnake, state.gridSize);
    newScore = state.score + 10;
    newSpeed = Math.max(50, state.speed - DEFAULT_CONFIG.speedIncrement);
  } else {
    newSnake = [newHead, ...state.snake.slice(0, -1)];
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction,
    score: newScore,
    speed: newSpeed,
  };
}

export function changeDirection(state: GameState, newDirection: Direction): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  if (isValidDirectionChange(state.direction, newDirection)) {
    return { ...state, nextDirection: newDirection };
  }

  return state;
}

export function startGame(state: GameState): GameState {
  if (state.status === 'idle' || state.status === 'game-over') {
    return { ...createInitialState({ mode: state.mode, gridSize: state.gridSize }), status: 'playing' };
  }
  return { ...state, status: 'playing' };
}

export function pauseGame(state: GameState): GameState {
  if (state.status === 'playing') {
    return { ...state, status: 'paused' };
  }
  return state;
}

export function resumeGame(state: GameState): GameState {
  if (state.status === 'paused') {
    return { ...state, status: 'playing' };
  }
  return state;
}

export function togglePause(state: GameState): GameState {
  if (state.status === 'playing') {
    return pauseGame(state);
  }
  if (state.status === 'paused') {
    return resumeGame(state);
  }
  return state;
}

export function setGameMode(state: GameState, mode: GameState['mode']): GameState {
  return { ...state, mode };
}

// AI logic for simulated players
export function getAIDirection(snake: Position[], food: Position, currentDirection: Direction, gridSize: number): Direction {
  const head = snake[0];
  const possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    .filter(d => d !== getOppositeDirection(currentDirection)) as Direction[];
  
  // Simple AI: move towards food with some randomness
  const dx = food.x - head.x;
  const dy = food.y - head.y;
  
  const preferredDirections: Direction[] = [];
  
  if (dx > 0) preferredDirections.push('RIGHT');
  if (dx < 0) preferredDirections.push('LEFT');
  if (dy > 0) preferredDirections.push('DOWN');
  if (dy < 0) preferredDirections.push('UP');
  
  // Filter preferred directions to only valid ones
  const validPreferred = preferredDirections.filter(d => possibleDirections.includes(d));
  
  if (validPreferred.length > 0 && Math.random() > 0.2) {
    return validPreferred[Math.floor(Math.random() * validPreferred.length)];
  }
  
  return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
}
