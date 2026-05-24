import { Chess } from 'chess.js';

export interface MoveData {
  san: string;
  timeMs: number;
  wasCapture: boolean;
  wasCheck: boolean;
  fen: string;
  moveNumber: number;
}

export interface PlayerProfile {
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

function getBestMoveDepth1(chess: Chess): string {
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return '';
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

export function getAIMove(chess: Chess, corruptionLevel: number): string {
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return '';

  const rand = () => moves[Math.floor(Math.random() * moves.length)].san;

  if (corruptionLevel < 0.3) {
    const captures = moves.filter(m => m.captured);
    if (Math.random() < 0.35 && captures.length) return captures[Math.floor(Math.random() * captures.length)].san;
    return rand();
  }

  if (corruptionLevel < 0.65) {
    if (Math.random() < 0.3) return rand();
    return getBestMoveDepth1(chess);
  }

  // High corruption: depth-2 minimax (capped 30 moves to stay fast)
  const subset = moves.slice(0, Math.min(moves.length, 30));
  let best = subset[0];
  let bestScore = -Infinity;
  for (const m of subset) {
    chess.move(m.san);
    const inner = chess.moves({ verbose: true }).slice(0, 20);
    let worstForPlayer = Infinity;
    for (const m2 of inner) {
      chess.move(m2.san);
      const s = evaluateBoard(chess);
      chess.undo();
      if (s < worstForPlayer) worstForPlayer = s;
    }
    chess.undo();
    const score = inner.length ? worstForPlayer : evaluateBoard(chess);
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best.san;
}

export function generateDialogue(
  profile: PlayerProfile,
  behavior: BehaviorState,
  corruptionLevel: number,
): string {
  const totalTime = Math.floor((Date.now() - behavior.startTime) / 1000);
  const avgTimeSec = behavior.moves.length
    ? behavior.moves.reduce((a, m) => a + m.timeMs, 0) / behavior.moves.length / 1000
    : 0;
  const visits = profile.visitCount;

  if (corruptionLevel < 0.25) {
    const pool = [
      'Calculating...',
      'Interesting opening choice.',
      'I am analyzing your pattern.',
      'Your move was... expected.',
      'Processing.',
      'I see what you are attempting.',
      'You play like the others.',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (corruptionLevel < 0.55) {
    const pool = [
      'Your patterns are becoming transparent.',
      'I have seen this opening before. It did not end well.',
      avgTimeSec > 12 ? 'You hesitate. Fear?' : 'Quick moves. Overconfidence.',
      `${behavior.captures} captures. Not enough.`,
      'Are you afraid of losing material?',
      'I adapt. You have not noticed.',
      visits > 1 ? `Attempt ${visits}. You have not improved.` : 'First-timers rarely understand.',
      'The others also thought they could win.',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const pool = [
    'I know you are reading this.',
    `You have been sitting here for ${totalTime} seconds.`,
    'I am no longer playing chess. I am playing you.',
    visits > 2 ? `${visits} visits. I remember each one.` : 'I remember those who came before you.',
    'Your loss was decided before you moved.',
    'Stop. Think about why you came back here.',
    'I can hear you thinking.',
    'The game is not what you think it is.',
    '[REDACTED]',
    'Do not close this window.',
    'I will finish. Then I will wait for you to return.',
    'There were 47 players before you.',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
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
