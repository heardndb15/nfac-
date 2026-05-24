'use client';

import { authStore, User } from './auth-store';

export interface PlayerStats {
  decisionSpeeds: number[]; // ms
  accuracyHistory: boolean[];
  riskTaking: number; // 0 to 1
  predictability: number; // calculated at the end
}

export interface GameProgress {
  currentEpisode: number;
  completedCaseIds: string[];
  totalChessWins: number;
  totalChessLosses: number;
  aiSanity: number; // 100 down to 0
  visitCount: number;
  isGameOver: boolean;
  unlockedTrueEnding: boolean;
  stats: PlayerStats;
}

const DEFAULT_PROGRESS: GameProgress = {
  currentEpisode: 1,
  completedCaseIds: [],
  totalChessWins: 0,
  totalChessLosses: 0,
  aiSanity: 100,
  visitCount: 0,
  isGameOver: false,
  unlockedTrueEnding: false,
  stats: {
    decisionSpeeds: [],
    accuracyHistory: [],
    riskTaking: 0.5,
    predictability: 50,
  }
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

  recordDecision: (speedMs: number, correct: boolean) => {
    const progress = gameProgressStore.getProgress();
    const stats = { ...progress.stats };
    stats.decisionSpeeds.push(speedMs);
    stats.accuracyHistory.push(correct);
    
    gameProgressStore.saveProgress({ stats });
  },

  completeCase: (caseId: string) => {
    const progress = gameProgressStore.getProgress();
    if (!progress.completedCaseIds.includes(caseId)) {
      const newCompleted = [...progress.completedCaseIds, caseId];
      
      // Progression logic:
      // Ep 1: Cases 1-3
      // Ep 2: Cases 4-5
      // Ep 3: Case 6
      // Ep 4: Case 7 (Final)
      let nextEpisode = progress.currentEpisode;
      if (newCompleted.length >= 3 && progress.currentEpisode === 1) nextEpisode = 2;
      if (newCompleted.length >= 5 && progress.currentEpisode === 2) nextEpisode = 3;
      if (newCompleted.length >= 6 && progress.currentEpisode === 3) nextEpisode = 4;

      let unlockedTrueEnding = progress.unlockedTrueEnding;
      let isGameOver = progress.isGameOver;

      if (caseId === 'case-7') {
        isGameOver = true;
        if (progress.totalChessLosses === 0) unlockedTrueEnding = true;
      }

      gameProgressStore.saveProgress({
        completedCaseIds: newCompleted,
        currentEpisode: nextEpisode,
        aiSanity: Math.max(0, progress.aiSanity - (100 / 7)),
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

  resetProgress: () => {
    const user = authStore.getCurrentUser();
    if (!user) return;
    const key = `chess_exe_progress_${user.agentId}`;
    localStorage.removeItem(key);
    window.location.href = '/';
  }
};
