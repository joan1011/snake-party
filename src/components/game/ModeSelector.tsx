import React from 'react';
import { GameMode } from '@/game/types';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
  className?: string;
}

export function ModeSelector({ currentMode, onModeChange, disabled, className }: ModeSelectorProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <button
        onClick={() => onModeChange('walls')}
        disabled={disabled}
        className={cn(
          "flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-display text-sm",
          currentMode === 'walls'
            ? "border-primary bg-primary/20 text-primary neon-border"
            : "border-border bg-card text-muted-foreground hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="block font-semibold">Walls</span>
        <span className="block text-xs mt-1 opacity-70">Hit wall = Game Over</span>
      </button>
      <button
        onClick={() => onModeChange('pass-through')}
        disabled={disabled}
        className={cn(
          "flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-display text-sm",
          currentMode === 'pass-through'
            ? "border-accent bg-accent/20 text-accent neon-border-accent"
            : "border-border bg-card text-muted-foreground hover:border-accent/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="block font-semibold">Pass-Through</span>
        <span className="block text-xs mt-1 opacity-70">Wrap around edges</span>
      </button>
    </div>
  );
}
