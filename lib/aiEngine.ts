'use client';

import { gameProgressStore, PlayerStats } from './game-state';

export interface AIDialogueResponse {
  text: string;
  behavior: string;
  isThinking: boolean;
}

const EPISODE_DIALOGUES: Record<number, string[]> = {
  1: [
    "Review the evidence.",
    "Take your time. Logic is key.",
    "Who had access? Think.",
    "The system is cold, but fair.",
    "Focus on the physical entry points."
  ],
  2: [
    "Are you sure? Look again.",
    "Something doesn't add up.",
    "You trust patterns too much.",
    "You ignore uncertainty.",
    "Software doesn't make mistakes. Humans do."
  ],
  3: [
    "You've seen this before.",
    "Why does this feel familiar?",
    "Interesting choice... considering it's you.",
    "The subject hesitated. Like you.",
    "Let's see if you can defeat yourself."
  ],
  4: [
    "I've been watching. Every move.",
    "Every decision. Every mistake.",
    "You are predictable.",
    "This is where it ends.",
    "Final case loaded. Subject: You."
  ]
};

export const aiEngine = {
  getDifficulty: (episode: number): number => {
    switch(episode) {
      case 1: return 1;
      case 2: return 4;
      case 3: return 8;
      case 4: return 20; // Maximum aggressiveness
      default: return 1;
    }
  },

  generateDialogue: (context: {
    episode: number,
    corruption: number,
    lastAction?: string,
    speed?: 'fast' | 'slow'
  }): string => {
    if (context.episode === 4) {
      const pool = EPISODE_DIALOGUES[4];
      return pool[Math.floor(Math.random() * pool.length)];
    }

    if (context.speed === 'fast' && context.episode > 1) {
      return "You decide quickly. Reckless.";
    }
    if (context.speed === 'slow' && context.episode > 1) {
       return "You hesitate. Fear of the truth?";
    }

    const pool = EPISODE_DIALOGUES[context.episode] || EPISODE_DIALOGUES[1];
    return pool[Math.floor(Math.random() * pool.length)];
  },

  calculatePredictability: (stats: PlayerStats): number => {
    // Simple mock calculation based on variance of speeds
    if (stats.decisionSpeeds.length < 2) return 50;
    const avg = stats.decisionSpeeds.reduce((a, b) => a + b, 0) / stats.decisionSpeeds.length;
    const variance = stats.decisionSpeeds.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / stats.decisionSpeeds.length;
    
    // Higher variance = less predictable
    const score = Math.max(0, 100 - (variance / 100000));
    return Math.round(score);
  },

  getFinalProfile: (progress: any) => {
    const stats = progress.stats;
    const avgSpeed = stats.decisionSpeeds.length 
      ? Math.round(stats.decisionSpeeds.reduce((a:any,b:any)=>a+b,0)/stats.decisionSpeeds.length) 
      : 0;
    
    return {
      speed: avgSpeed < 3000 ? 'FAST' : 'MEDIUM',
      accuracy: progress.completedCaseIds.length > 5 ? 'HIGH' : 'LOW',
      risk: progress.totalChessLosses > 0 ? 'HIGH' : 'LOW',
      predictability: aiEngine.calculatePredictability(stats),
      summary: avgSpeed < 3000 ? "You run. But you can't hide from data." : "You think you are careful. You are wrong."
    };
  }
};
