import React, { memo } from 'react';
import { GameState } from '@/game/types';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  cellSize?: number;
  className?: string;
}

export const GameBoard = memo(function GameBoard({ 
  gameState, 
  cellSize = 20,
  className 
}: GameBoardProps) {
  const { snake, food, gridSize, status } = gameState;
  const boardSize = gridSize * cellSize;

  return (
    <div 
      className={cn(
        "relative game-grid border-2 border-primary rounded-lg overflow-hidden neon-border",
        status === 'game-over' && "opacity-60",
        className
      )}
      style={{ width: boardSize, height: boardSize }}
    >
      {/* Food */}
      <div
        className="absolute rounded-full animate-pulse-neon"
        style={{
          left: food.x * cellSize + 2,
          top: food.y * cellSize + 2,
          width: cellSize - 4,
          height: cellSize - 4,
          backgroundColor: 'hsl(0 100% 60%)',
          boxShadow: '0 0 10px hsl(0 100% 60%), 0 0 20px hsl(0 100% 60% / 0.5)',
        }}
      />

      {/* Snake */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        return (
          <div
            key={index}
            className="absolute transition-all duration-75"
            style={{
              left: segment.x * cellSize + 1,
              top: segment.y * cellSize + 1,
              width: cellSize - 2,
              height: cellSize - 2,
              backgroundColor: isHead ? 'hsl(160 100% 50%)' : 'hsl(160 80% 40%)',
              borderRadius: isHead ? '4px' : '2px',
              boxShadow: isHead 
                ? '0 0 10px hsl(160 100% 50%), 0 0 20px hsl(160 100% 50% / 0.5)' 
                : 'none',
            }}
          />
        );
      })}

      {/* Overlay for paused/game-over states */}
      {(status === 'paused' || status === 'game-over' || status === 'idle') && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            {status === 'idle' && (
              <p className="font-pixel text-sm text-primary neon-text">
                PRESS SPACE TO START
              </p>
            )}
            {status === 'paused' && (
              <p className="font-pixel text-sm text-accent neon-text-accent">
                PAUSED
              </p>
            )}
            {status === 'game-over' && (
              <div>
                <p className="font-pixel text-lg text-destructive mb-2">GAME OVER</p>
                <p className="font-pixel text-xs text-muted-foreground">
                  PRESS SPACE TO RESTART
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />
    </div>
  );
});
