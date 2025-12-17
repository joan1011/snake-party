import { useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { leaderboardApi } from '@/services/api';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { GameBoard } from '@/components/game/GameBoard';
import { GameStats } from '@/components/game/GameStats';
import { ModeSelector } from '@/components/game/ModeSelector';
import { MobileControls } from '@/components/game/MobileControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function GamePage() {
  const { gameState, start, pause, reset, setMode, changeDirection } = useSnakeGame();
  const isMobile = useIsMobile();

  const startTimeRef = useRef<number>(0);
  const submittedRef = useRef<boolean>(false);

  // Track game duration
  useEffect(() => {
    if (gameState.status === 'playing') {
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }
      submittedRef.current = false;
    } else if (gameState.status === 'idle') {
      startTimeRef.current = 0;
      submittedRef.current = false;
    }
  }, [gameState.status]);

  // Submit score on game over
  useEffect(() => {
    const submitScore = async () => {
      if (gameState.status === 'game-over' && !submittedRef.current && gameState.score > 0) {
        const duration = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
        submittedRef.current = true;
        startTimeRef.current = 0;

        try {
          await leaderboardApi.submitScore({
            score: gameState.score,
            mode: gameState.mode,
            duration
          });
          toast.success('Score submitted to leaderboard!');
        } catch (error) {
          console.error('Failed to submit score:', error);
          toast.error('Failed to save score');
        }
      }
    };

    submitScore();
  }, [gameState.status, gameState.score, gameState.mode]);

  const isPlaying = gameState.status === 'playing';
  const isPaused = gameState.status === 'paused';
  const canChangeMode = gameState.status === 'idle' || gameState.status === 'game-over';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Game area */}
        <div className="flex flex-col items-center gap-6">
          {/* Mode selector */}
          <ModeSelector
            currentMode={gameState.mode}
            onModeChange={setMode}
            disabled={!canChangeMode}
            className="w-full max-w-[400px]"
          />

          {/* Game board */}
          <GameBoard gameState={gameState} cellSize={isMobile ? 16 : 20} />

          {/* Controls */}
          <div className="flex gap-3">
            {!isPlaying ? (
              <Button
                onClick={start}
                className="arcade-button text-primary-foreground font-display px-8"
              >
                <Play className="w-4 h-4 mr-2" />
                {gameState.status === 'game-over' ? 'Play Again' : 'Start'}
              </Button>
            ) : (
              <Button
                onClick={pause}
                variant="outline"
                className="font-display"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button
                onClick={start}
                className="arcade-button text-primary-foreground font-display"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            <Button
              onClick={reset}
              variant="outline"
              className="font-display"
              disabled={gameState.status === 'playing'}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Mobile controls */}
          {isMobile && (
            <MobileControls onDirectionChange={changeDirection} />
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-display">
              {isMobile ? 'Use the arrows or swipe to move' : 'Use Arrow Keys or WASD to move'}
            </p>
            <p className="mt-1">Press Space to Start/Pause</p>
          </div>
        </div>

        {/* Stats sidebar */}
        <GameStats gameState={gameState} className="w-full lg:w-48" />
      </div>
    </div>
  );
}
