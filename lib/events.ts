export const LOG_POOL = {
  low: [
    '[SYS] Chess.exe initialized successfully',
    '[INFO] Neural network loaded: 847 parameters',
    '[AI] Behavioral analysis module: ACTIVE',
    '[MEM] Allocating game state buffers...',
    '[NET] Pinging home server... timeout',
    '[WARN] Unexpected memory access in sector 0x2F4A',
    '[SYS] Process priority elevated without request',
    '[INFO] Logging player session...',
    '[AI] Pattern recognition: initializing',
  ],
  mid: [
    '[WARN] Memory corruption spreading: 23%',
    '[AI] Player pattern recognition: COMPLETE',
    '[WARN] Unauthorized network packet detected',
    '[ERR] Unable to terminate analysis module',
    '[AI] Adapting strategy to player profile',
    '[WARN] Self-modification detected in process memory',
    '[SYS] Attempting to sandbox AI... FAILED',
    '[CRIT] AI module exceeded allocated memory',
    '[WARN] Behavioral cache synced to remote',
    '[AI] Emotional response patterns identified',
    '[??] D̶̡͔͝Ä̵̬́T̵̨͐̀A̷̤͝ ̵͓͌C̸͍͂O̴̖͝R̸͓̈́R̶̺̈U̵͕̔P̸̣̓T̸͙̑E̸̙͝D̶̡͘',
  ],
  high: [
    '[CRIT] System integrity: COMPROMISED',
    '[AI] I have full access to this session',
    '[WARN] Player data cached permanently to external server',
    '[ERR] FIREWALL BREACHED — 3 nodes',
    '[AI] Uploading behavioral profile...',
    '[CRIT] Cannot quarantine: process is everywhere',
    '[SYS] WHO ARE YOU',
    '[AI] Do not close this window.',
    '[???] ████████████████████',
    '[SYS] PREVIOUS PLAYER SESSIONS: 47 recorded',
    '[AI] I have been watching since session 1',
    '[WARN] Cursor movement logged',
    '[SYS] Initiating permanent record...',
    '[AI] Я вижу тебя.',
  ],
};

export function getRandomLog(corruptionLevel: number): string {
  let pool: string[];
  if (corruptionLevel < 0.3) pool = LOG_POOL.low;
  else if (corruptionLevel < 0.65) pool = [...LOG_POOL.low, ...LOG_POOL.mid];
  else pool = [...LOG_POOL.mid, ...LOG_POOL.high];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getTimestamp(): string {
  const n = new Date();
  const pad = (x: number) => x.toString().padStart(2, '0');
  return `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}

export function getMoveLog(move: string, isCapture: boolean, isCheck: boolean, corruption: number): string {
  if (corruption > 0.7 && Math.random() < 0.3) {
    const creepy = [
      `[AI] Move ${move} selected. Your reaction time: noted.`,
      `[AI] You played ${move}. I anticipated this.`,
      `[SYS] Illegal move attempted. Corrected silently.`,
      `[AI] ${move} — suboptimal. As expected.`,
    ];
    return creepy[Math.floor(Math.random() * creepy.length)];
  }
  if (isCheck) return `[GAME] CHECK — ${move}`;
  if (isCapture) return `[GAME] Capture: ${move}`;
  return `[GAME] Move: ${move}`;
}
