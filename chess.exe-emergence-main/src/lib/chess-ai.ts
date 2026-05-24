import { Chess, Move } from "chess.js";

// Simple heuristic AI: prefers captures, checks, center control.
// Strong enough to feel responsive, not a stockfish.
const VALUES: Record<string, number> = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };

function scoreMove(game: Chess, move: Move): number {
  let s = 0;
  if (move.captured) s += (VALUES[move.captured] ?? 0) * 10;
  if (move.promotion) s += 8;
  if (move.san.includes("+")) s += 3;
  if (move.san.includes("#")) s += 1000;
  const center = ["d4", "e4", "d5", "e5"];
  if (center.includes(move.to)) s += 1.5;
  // small randomization for personality
  s += Math.random() * 1.2;
  // shallow look-ahead: after move, what's the best opponent capture?
  const g2 = new Chess(game.fen());
  g2.move(move.san);
  const replies = g2.moves({ verbose: true }) as Move[];
  let worst = 0;
  for (const r of replies) {
    if (r.captured) worst = Math.max(worst, (VALUES[r.captured] ?? 0) * 10);
  }
  s -= worst * 0.9;
  return s;
}

export function pickAIMove(game: Chess): Move | null {
  const moves = game.moves({ verbose: true }) as Move[];
  if (!moves.length) return null;
  let best = moves[0];
  let bestScore = -Infinity;
  for (const m of moves) {
    const s = scoreMove(game, m);
    if (s > bestScore) {
      bestScore = s;
      best = m;
    }
  }
  return best;
}
