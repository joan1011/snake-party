import React, { useState, useEffect } from 'react';
import { leaderboardApi, LeaderboardEntry, GameMode } from '@/services/api';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardApi.getLeaderboard(
        filter === 'all' ? undefined : filter,
        10
      );
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-display">{rank}</span>;
    }
  };

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4", className)}>
      <h2 className="font-pixel text-lg text-primary neon-text mb-4 text-center">
        LEADERBOARD
      </h2>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'walls', 'pass-through'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={cn(
              "flex-1 px-3 py-2 rounded text-xs font-display transition-colors",
              filter === mode
                ? "bg-primary/20 text-primary border border-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === 'all' ? 'All' : mode === 'walls' ? 'Walls' : 'Pass-Through'}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={`${entry.userId}-${entry.score}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                index < 3 ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm truncate">{entry.username}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {entry.mode === 'pass-through' ? 'Pass-Through' : entry.mode}
                </p>
              </div>
              <div className="text-right">
                <p className="font-pixel text-sm text-primary">{entry.score}</p>
                <p className="text-xs text-muted-foreground">{entry.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
