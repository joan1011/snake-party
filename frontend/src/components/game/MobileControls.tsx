import React from 'react';
import { Direction } from '@/game/types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
  className?: string;
}

export function MobileControls({ onDirectionChange, className }: MobileControlsProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2 w-40", className)}>
      <div />
      <button
        onClick={() => onDirectionChange('UP')}
        className="p-4 bg-card border border-border rounded-lg active:bg-primary/20 active:border-primary transition-colors"
      >
        <ChevronUp className="w-6 h-6 mx-auto text-primary" />
      </button>
      <div />
      <button
        onClick={() => onDirectionChange('LEFT')}
        className="p-4 bg-card border border-border rounded-lg active:bg-primary/20 active:border-primary transition-colors"
      >
        <ChevronLeft className="w-6 h-6 mx-auto text-primary" />
      </button>
      <button
        onClick={() => onDirectionChange('DOWN')}
        className="p-4 bg-card border border-border rounded-lg active:bg-primary/20 active:border-primary transition-colors"
      >
        <ChevronDown className="w-6 h-6 mx-auto text-primary" />
      </button>
      <button
        onClick={() => onDirectionChange('RIGHT')}
        className="p-4 bg-card border border-border rounded-lg active:bg-primary/20 active:border-primary transition-colors"
      >
        <ChevronRight className="w-6 h-6 mx-auto text-primary" />
      </button>
    </div>
  );
}
