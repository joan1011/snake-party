import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, 
  Direction, 
  GameConfig, 
  DEFAULT_CONFIG 
} from '@/game/types';
import { 
  createInitialState, 
  moveSnake, 
  changeDirection, 
  startGame, 
  togglePause,
  setGameMode
} from '@/game/gameLogic';

export function useSnakeGame(config: Partial<GameConfig> = {}) {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState({ ...DEFAULT_CONFIG, ...config })
  );
  
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveRef = useRef<number>(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const keyDirectionMap: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
      W: 'UP',
      S: 'DOWN',
      A: 'LEFT',
      D: 'RIGHT',
    };

    if (event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      setGameState(prev => {
        if (prev.status === 'idle' || prev.status === 'game-over') {
          return startGame(prev);
        }
        return togglePause(prev);
      });
      return;
    }

    const direction = keyDirectionMap[event.key];
    if (direction) {
      event.preventDefault();
      setGameState(prev => changeDirection(prev, direction));
    }
  }, []);

  const start = useCallback(() => {
    setGameState(prev => startGame(prev));
  }, []);

  const pause = useCallback(() => {
    setGameState(prev => togglePause(prev));
  }, []);

  const reset = useCallback(() => {
    setGameState(createInitialState({ ...DEFAULT_CONFIG, ...config, mode: gameState.mode }));
  }, [config, gameState.mode]);

  const setMode = useCallback((mode: GameState['mode']) => {
    setGameState(prev => {
      if (prev.status === 'idle' || prev.status === 'game-over') {
        return setGameMode(createInitialState({ ...DEFAULT_CONFIG, ...config, mode }), mode);
      }
      return prev;
    });
  }, [config]);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastMoveRef.current >= gameState.speed) {
        setGameState(prev => moveSnake(prev));
        lastMoveRef.current = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed]);

  // Keyboard controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    gameState,
    start,
    pause,
    reset,
    setMode,
    changeDirection: (dir: Direction) => setGameState(prev => changeDirection(prev, dir)),
  };
}
