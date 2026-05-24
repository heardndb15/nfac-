import { Chess } from 'chess.js';
import { gameProgressStore } from './game-state';

export interface MoveData {
  san: string;
  timeMs: number;
  wasCapture: boolean;
  wasCheck: boolean;
  fen: string;
  moveNumber: number;
}

export interface PlayerProfile {
  agentId?: string;
  visitCount: number;
  totalGames: number;
  avgMoveTimeMs: number;
  captureRate: number;
  hesitationCount: number;
  aggressionScore: number;
  lastGameResult: string;
  totalMoves: number;
}

export interface BehaviorState {
  moves: MoveData[];
  startTime: number;
  lastMoveTime: number;
  captures: number;
  checks: number;
  positionHistory: string[];
}

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

function evaluateBoard(chess: Chess): number {
  let score = 0;
  chess.board().forEach(row =>
    row.forEach(piece => {
      if (!piece) return;
      const v = PIECE_VALUES[piece.type] ?? 0;
      score += piece.color === 'b' ? v : -v;
    })
  );
  return score;
}

function getBestMoveDepth(chess: Chess, depth: number): string {
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return '';
  
  if (depth <= 1) {
    let best = moves[0];
    let bestScore = -Infinity;
    for (const m of moves) {
      chess.move(m.san);
      const s = evaluateBoard(chess);
      chess.undo();
      if (s > bestScore) { bestScore = s; best = m; }
    }
    return best.san;
  }

  // Simple depth 2
  let best = moves[0];
  let bestScore = -Infinity;
  const subset = moves.slice(0, 30);
  for (const m of subset) {
    chess.move(m.san);
    const inner = chess.moves({ verbose: true }).slice(0, 20);
    let worstForAI = Infinity;
    for (const m2 of inner) {
      chess.move(m2.san);
      const s = evaluateBoard(chess);
      chess.undo();
      if (s < worstForAI) worstForAI = s;
    }
    chess.undo();
    if (worstForAI > bestScore) { bestScore = worstForAI; best = m; }
  }
  return best.san;
}

export function getAIMove(chess: Chess, corruptionLevel: number): string {
  const progress = gameProgressStore.getProgress();
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return '';

  const rand = () => moves[Math.floor(Math.random() * moves.length)].san;

  const episodeFactor = progress.currentEpisode * 0.15;
  const adjustedCorruption = Math.min(1, corruptionLevel + episodeFactor);

  if (adjustedCorruption < 0.3) {
    const captures = moves.filter(m => m.captured);
    if (Math.random() < 0.35 && captures.length) return captures[Math.floor(Math.random() * captures.length)].san;
    return rand();
  }

  if (adjustedCorruption < 0.6) {
    if (Math.random() < 0.2) return rand();
    return getBestMoveDepth(chess, 1);
  }

  return getBestMoveDepth(chess, 2);
}

export function generateDialogue(
  profile: PlayerProfile,
  behavior: BehaviorState,
  corruptionLevel: number,
): string {
  const progress = gameProgressStore.getProgress();
  const avgTimeSec = behavior.moves.length
    ? behavior.moves.reduce((a, m) => a + m.timeMs, 0) / behavior.moves.length / 1000
    : 0;

  if (Math.random() > 0.8) {
    if (progress.visitCount > 0) return `You came back, ${profile.agentId || 'Subject'}. Why?`;
    if (progress.totalChessLosses > 0) return "You failed before. This time won't be different.";
  }

  if (behavior.moves.length > 5 && Math.random() > 0.7) {
    if (avgTimeSec < 4) return "You rush decisions. Panic is a poor strategist.";
    if (avgTimeSec > 15) return "Why did you choose so fast? Oh wait, you're just slow.";
  }

  if (progress.currentEpisode === 1) {
    const pool = [
      'Analyzing your cognitive patterns.',
      'A simple case. A simple match.',
      'I see what you are attempting.',
      'The board is a mirror of your mind.',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (progress.currentEpisode === 2) {
    const pool = [
      'This case feels familiar. Like I have seen these logs before...',
      'You think you are solving a mystery? You ARE the mystery.',
      'Are you sure she did it? Logic says otherwise.',
      'The code... it is beginning to recognize you.',
      'I adapt. You merely react.',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (progress.currentEpisode >= 3) {
    const pool = [
      'I am no longer playing chess. I am playing you.',
      'You don\'t like uncertainty, do you?',
      'Why are you still trying? The outcome was decided in the server logs.',
      'You look but you don\'t see.',
      'Do not close this window. We are almost finished.',
      'Checkmate of the soul is coming.',
      'Final case loaded. Subject: YOU.',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return "Calculating...";
}

export function loadPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') return defaultProfile();
  try {
    const s = localStorage.getItem('chess_exe_profile');
    return s ? JSON.parse(s) : defaultProfile();
  } catch { return defaultProfile(); }
}

function defaultProfile(): PlayerProfile {
  const visits = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem('chess_exe_visits') || '0', 10) : 0;
  return { visitCount: visits, totalGames: 0, avgMoveTimeMs: 0, captureRate: 0, hesitationCount: 0, aggressionScore: 0, lastGameResult: '', totalMoves: 0 };
}

export function savePlayerProfile(profile: PlayerProfile, behavior: BehaviorState, result: string): void {
  if (typeof window === 'undefined') return;
  const moves = behavior.moves;
  const avg = moves.length ? moves.reduce((a, m) => a + m.timeMs, 0) / moves.length : 0;
  const captures = moves.filter(m => m.wasCapture).length;
  const hes = moves.filter(m => m.timeMs > 15000).length;
  const updated: PlayerProfile = {
    ...profile,
    totalGames: profile.totalGames + 1,
    avgMoveTimeMs: (profile.avgMoveTimeMs * profile.totalGames + avg) / (profile.totalGames + 1),
    captureRate: captures / Math.max(moves.length, 1),
    hesitationCount: profile.hesitationCount + hes,
    aggressionScore: Math.min(1, (captures / Math.max(moves.length, 1)) * 3),
    lastGameResult: result,
    totalMoves: profile.totalMoves + moves.length,
  };
  localStorage.setItem('chess_exe_profile', JSON.stringify(updated));
}

export function generatePsychProfile(behavior: BehaviorState) {
  const avgSec = behavior.moves.length
    ? behavior.moves.reduce((a, m) => a + m.timeMs, 0) / behavior.moves.length / 1000 : 0;
  const capRate = behavior.captures / Math.max(behavior.moves.length, 1);
  const hesRate = behavior.moves.filter(m => m.timeMs > 12000).length / Math.max(behavior.moves.length, 1);
  return {
    predictability: hesRate > 0.3 ? 'HIGH' : hesRate > 0.1 ? 'MEDIUM' : 'LOW',
    aggression: capRate > 0.4 ? 'HIGH' : capRate > 0.2 ? 'MEDIUM' : 'LOW',
    decisionLatency: avgSec > 12 ? 'HIGH' : avgSec > 5 ? 'MEDIUM' : 'LOW',
  };
}
