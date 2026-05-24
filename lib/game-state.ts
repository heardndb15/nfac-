'use client';

import { authStore, User } from './auth-store';

export interface GameProgress {
  currentEpisode: number;
  completedCaseIds: string[];
  totalChessWins: number;
  totalChessLosses: number;
  aiSanity: number; // 100 down to 0
  lastVisitDate: number;
  visitCount: number;
  isGameOver: boolean;
  unlockedTrueEnding: boolean;
}

const DEFAULT_PROGRESS: GameProgress = {
  currentEpisode: 1,
  completedCaseIds: [],
  totalChessWins: 0,
  totalChessLosses: 0,
  aiSanity: 100,
  lastVisitDate: Date.now(),
  visitCount: 0,
  isGameOver: false,
  unlockedTrueEnding: false,
};

export const gameProgressStore = {
  getProgress: (): GameProgress => {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;
    const user = authStore.getCurrentUser();
    if (!user) return DEFAULT_PROGRESS;
    
    const key = `chess_exe_progress_${user.agentId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  },

  saveProgress: (progress: Partial<GameProgress>) => {
    if (typeof window === 'undefined') return;
    const user = authStore.getCurrentUser();
    if (!user) return;

    const current = gameProgressStore.getProgress();
    const updated = { ...current, ...progress };
    const key = `chess_exe_progress_${user.agentId}`;
    localStorage.setItem(key, JSON.stringify(updated));
  },

  completeCase: (caseId: string) => {
    const progress = gameProgressStore.getProgress();
    if (!progress.completedCaseIds.includes(caseId)) {
      const newCompleted = [...progress.completedCaseIds, caseId];
      
      // Progression logic
      let nextEpisode = progress.currentEpisode;
      if (newCompleted.length >= 2 && progress.currentEpisode === 1) nextEpisode = 2;
      if (newCompleted.length >= 4 && progress.currentEpisode === 2) nextEpisode = 3;
      if (newCompleted.length >= 5 && progress.currentEpisode === 3) nextEpisode = 4; // Final

      let unlockedTrueEnding = progress.unlockedTrueEnding;
      let isGameOver = progress.isGameOver;

      // Determine true ending: all cases correct + no losses + final case done
      if (caseId === 'case-6' && progress.totalChessLosses === 0) {
        unlockedTrueEnding = true;
        isGameOver = true;
      }

      gameProgressStore.saveProgress({
        completedCaseIds: newCompleted,
        currentEpisode: nextEpisode,
        aiSanity: Math.max(0, progress.aiSanity - 15),
        unlockedTrueEnding,
        isGameOver
      });
    }
  },

  recordChessResult: (won: boolean) => {
    const progress = gameProgressStore.getProgress();
    gameProgressStore.saveProgress({
      totalChessWins: won ? progress.totalChessWins + 1 : progress.totalChessWins,
      totalChessLosses: won ? progress.totalChessLosses : progress.totalChessLosses + 1,
      aiSanity: won ? Math.max(0, progress.aiSanity - 10) : progress.aiSanity,
    });
  },

  setGameOver: (isOver: boolean) => {
    gameProgressStore.saveProgress({ isGameOver: isOver });
  },

  resetProgress: () => {
    const user = authStore.getCurrentUser();
    if (!user) return;
    const key = `chess_exe_progress_${user.agentId}`;
    localStorage.removeItem(key);
    localStorage.removeItem('chess_exe_visits');
    localStorage.removeItem('chess_exe_profile');
    window.location.href = '/';
  }
};
