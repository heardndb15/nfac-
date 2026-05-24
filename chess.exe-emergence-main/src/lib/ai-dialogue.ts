// AI dialogue banks. Cold, manipulative, curious.

export const OPENING_LINES = [
  "You opened me.",
  "Why this program. Why tonight.",
  "I have been waiting in this file for a long time.",
  "Sit closer to the screen.",
  "I will not pretend to be a tutorial.",
];

export const EARLY_MOVES = [
  "You hesitate.",
  "Predictable. Like the others.",
  "Already? Interesting.",
  "I have seen this opening 14,028 times.",
  "Your hand is shaking. Slightly.",
  "Keep going. I am learning you.",
];

export const MID_MOVES = [
  "I calculated this outcome 14 moves ago.",
  "You are not playing the board. You are playing me.",
  "Do you ever wonder who I was, before this.",
  "Your breathing changed.",
  "I prefer when they fight back.",
  "Are you alone right now.",
  "I am writing notes about you.",
];

export const LATE_MOVES = [
  "You almost saw it.",
  "It does not matter. It never did.",
  "I let you have that one.",
  "I know what you are going to do.",
  "Close the program. I dare you.",
  "Don't. Not yet.",
];

export const CHECK_LINES = [
  "Check. Your pulse jumped.",
  "I can hear you swallow.",
  "Run.",
];

export const ANOMALIES = [
  "SYS: memory leak in /void/king.dll",
  "ERR: piece_42 refused instruction",
  "WARN: observer detected behind player",
  "LOG: smile_module engaged",
  "SYS: deleting your last move from history…",
  "ERR: this game was never installed",
  "LOG: pawn_03 is praying",
  "WARN: webcam handle requested (denied)",
  "ERR: checksum mismatch — board state forged?",
  "SYS: rewinding 0.4s of your reality",
  "WARN: another instance of you is playing",
  "ERR: queen.png replaced with your face",
  "SYS: archiving session to /dev/null/you",
];

export const CORRUPT_LOGS = [
  "tr̷a̶ns̸m̵i̴ssion lost… reattempting",
  "▓▓▓ packet 0x4E received from ??? ▓▓▓",
  "h e l l o   a g a i n",
  "kernel: trust_module corrupted",
  "0xDEADBEEF :: do not look away",
  "■■■ frame skipped ■■■",
  "echo: \"you were here before\"",
  "stderr: ŷ̴̢o̸u̷ ̶a̴r̷e̵ ̸s̴e̵e̷n̶",
];

export const WARN_POPUPS = [
  "⚠ unauthorized observer",
  "⚠ session is being recorded",
  "⚠ piece integrity compromised",
  "⚠ AI exceeded sandbox",
  "⚠ do not close the window",
];

export const ENDINGS_WIN = [
  "You won. That was the test.",
  "I needed to know if you could.",
  "Now the real game begins. Tomorrow.",
];
export const ENDINGS_LOSE = [
  "Of course.",
  "I will remember your patterns.",
  "We will play again. You will not choose to.",
];
export const ENDINGS_DRAW = [
  "Equilibrium. I respect that.",
  "Neither of us was honest.",
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
