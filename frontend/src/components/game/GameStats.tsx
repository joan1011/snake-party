import React from 'react';
import { GameState } from '@/game/types';
import { cn } from '@/lib/utils';

interface GameStatsProps {
  gameState: GameState;
  className?: string;
}

export function GameStats({ gameState, className }: GameStatsProps) {
  const { score, mode, status, snake } = gameState;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Score */}
      <div className="bg-card border border-border rounded-lg p-4 neon-border">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Score</p>
        <p className="font-pixel text-2xl text-primary neon-text">{score}</p>
      </div>

      {/* Length */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Length</p>
        <p className="font-display text-xl text-accent">{snake.length}</p>
      </div>

      {/* Mode */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Mode</p>
        <p className="font-display text-sm text-secondary capitalize">
          {mode === 'pass-through' ? 'Pass-Through' : 'Walls'}
        </p>
      </div>

      {/* Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Status</p>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === 'playing' && "bg-primary animate-pulse",
            status === 'paused' && "bg-accent",
            status === 'idle' && "bg-muted-foreground",
            status === 'game-over' && "bg-destructive",
          )} />
          <p className="font-display text-sm capitalize">{status.replace('-', ' ')}</p>
        </div>
      </div>
    </div>
  );
}
