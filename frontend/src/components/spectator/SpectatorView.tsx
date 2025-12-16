import React, { useState, useEffect, useRef, useCallback } from 'react';
import { spectatorApi, ActivePlayer } from '@/services/api';
import { GameBoard } from '@/components/game/GameBoard';
import { GameState, Position } from '@/game/types';
import { createInitialState, moveSnake, generateFood, getAIDirection } from '@/game/gameLogic';
import { Eye, Users, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpectatorViewProps {
  className?: string;
}

export function SpectatorView({ className }: SpectatorViewProps) {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [simulatedGame, setSimulatedGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    loadActivePlayers();
    const interval = setInterval(loadActivePlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadActivePlayers = async () => {
    try {
      const players = await spectatorApi.getActivePlayers();
      setActivePlayers(players);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load active players:', error);
      setLoading(false);
    }
  };

  const watchPlayer = async (player: ActivePlayer) => {
    setSelectedPlayer(player);
    
    // Get spectator count
    const count = await spectatorApi.getSpectatorCount(player.id);
    setSpectatorCount(count);
    
    // Initialize simulated game for this player
    const initialState = createInitialState({ mode: player.mode });
    setSimulatedGame({
      ...initialState,
      score: player.score,
      status: 'playing',
    });
  };

  // AI-controlled game simulation
  useEffect(() => {
    if (!simulatedGame || simulatedGame.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = 0;
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTime >= simulatedGame.speed) {
        setSimulatedGame(prev => {
          if (!prev || prev.status !== 'playing') return prev;
          
          // AI decides next direction
          const aiDirection = getAIDirection(
            prev.snake,
            prev.food,
            prev.direction,
            prev.gridSize
          );
          
          // Update direction and move
          const withNewDirection = { ...prev, nextDirection: aiDirection };
          const moved = moveSnake(withNewDirection);
          
          // If game over, restart after delay
          if (moved.status === 'game-over') {
            setTimeout(() => {
              if (selectedPlayer) {
                const newState = createInitialState({ mode: selectedPlayer.mode });
                setSimulatedGame({
                  ...newState,
                  score: 0,
                  status: 'playing',
                });
              }
            }, 2000);
          }
          
          return moved;
        });
        lastTime = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [simulatedGame?.status, selectedPlayer]);

  const stopWatching = () => {
    setSelectedPlayer(null);
    setSimulatedGame(null);
  };

  return (
    <div className={cn("", className)}>
      <h2 className="font-pixel text-lg text-accent neon-text-accent mb-4 text-center flex items-center justify-center gap-2">
        <Eye className="w-5 h-5" />
        LIVE GAMES
      </h2>

      {!selectedPlayer ? (
        // Player list
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))
          ) : activePlayers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No active games right now
            </p>
          ) : (
            activePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => watchPlayer(player)}
                className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display text-sm">{player.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {player.mode === 'pass-through' ? 'Pass-Through' : 'Walls'} Mode
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-pixel text-sm text-primary">{player.score}</p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        // Watching a player
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg">{selectedPlayer.username}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{spectatorCount} watching</span>
              </div>
            </div>
            <button
              onClick={stopWatching}
              className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Stop Watching
            </button>
          </div>

          {simulatedGame && (
            <div className="flex flex-col items-center gap-4">
              <GameBoard gameState={simulatedGame} cellSize={16} />
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-pixel text-lg text-primary">{simulatedGame.score}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Length</p>
                  <p className="font-display text-lg text-accent">{simulatedGame.snake.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
