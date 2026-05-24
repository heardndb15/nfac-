import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { motion } from "framer-motion";
import { pickAIMove } from "@/lib/chess-ai";
import {
  CHECK_LINES,
  EARLY_MOVES,
  ENDINGS_DRAW,
  ENDINGS_LOSE,
  ENDINGS_WIN,
  LATE_MOVES,
  MID_MOVES,
  OPENING_LINES,
  ANOMALIES,
  CORRUPT_LOGS,
  WARN_POPUPS,
  pick,
} from "@/lib/ai-dialogue";
import { TerminalLog, type LogEntry } from "./TerminalLog";
import { AnomalyPopups, GlobalGlitchOverlay } from "./AnomalyPopups";
import { glitchBlip, heartbeat, movePulse, setHumLevel, startAmbience } from "@/lib/audio";

let logId = 0;
let anomId = 0;

interface Props {
  onEnd: (result: { outcome: "win" | "lose" | "draw"; moves: number; profile: string[] }) => void;
}

export function GameScreen({ onEnd }: Props) {
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [anomalies, setAnomalies] = useState<{ id: number; text: string; kind?: "popup" | "warn" }[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [intensity, setIntensity] = useState(0); // 0..10
  const [headerGlitch, setHeaderGlitch] = useState(false);
  const [boardFlicker, setBoardFlicker] = useState(false);
  const [profile, setProfile] = useState<string[]>([]);
  const playerMoveTimes = useRef<number[]>([]);
  const lastMoveStart = useRef<number>(Date.now());
  const ended = useRef(false);

  const addLog = useCallback((kind: LogEntry["kind"], text: string) => {
    setLogs((prev) => [...prev, { id: ++logId, kind, text }].slice(-40));
  }, []);

  const addAnomaly = useCallback((text: string, kind: "popup" | "warn" = "popup") => {
    const a = { id: ++anomId, text, kind };
    setAnomalies((p) => [...p, a]);
    glitchBlip();
    window.setTimeout(() => {
      setAnomalies((p) => p.filter((x) => x.id !== a.id));
    }, kind === "warn" ? 1800 : 2600);
  }, []);

  // Boot dialogue
  useEffect(() => {
    startAmbience();
    addLog("sys", "chess.exe v0.6.66 — handshake complete");
    addLog("sys", "loading opponent profile…");
    window.setTimeout(() => addLog("ai", pick(OPENING_LINES)), 1400);
    window.setTimeout(() => addLog("ai", pick(OPENING_LINES)), 4200);
  }, [addLog]);

  // Intensity ramp & periodic anomalies
  useEffect(() => {
    setHumLevel(0.025 + Math.min(0.08, intensity * 0.01));
  }, [intensity]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (ended.current) return;
      const chance = 0.08 + intensity * 0.04;
      if (Math.random() < chance) {
        const roll = Math.random();
        if (roll < 0.2 + intensity * 0.02) {
          // subtle top-banner warning
          addAnomaly(pick(WARN_POPUPS), "warn");
        } else {
          addAnomaly(pick(ANOMALIES), "popup");
        }
      }
      // Occasionally inject a corrupted line into the transcript
      if (Math.random() < 0.05 + intensity * 0.015) {
        addLog("corrupt", pick(CORRUPT_LOGS));
      }
      if (Math.random() < 0.1 + intensity * 0.02) {
        setHeaderGlitch(true);
        window.setTimeout(() => setHeaderGlitch(false), 220);
      }
      if (Math.random() < 0.06 + intensity * 0.02) {
        setBoardFlicker(true);
        window.setTimeout(() => setBoardFlicker(false), 110);
      }
    }, 3500);
    return () => window.clearInterval(id);
  }, [intensity, addAnomaly, addLog]);

  const endGame = useCallback(
    (g: Chess) => {
      if (ended.current) return;
      ended.current = true;
      let outcome: "win" | "lose" | "draw" = "draw";
      if (g.isCheckmate()) {
        outcome = g.turn() === "w" ? "lose" : "win";
      } else if (g.isDraw() || g.isStalemate() || g.isThreefoldRepetition()) {
        outcome = "draw";
      }
      const line =
        outcome === "win" ? pick(ENDINGS_WIN) : outcome === "lose" ? pick(ENDINGS_LOSE) : pick(ENDINGS_DRAW);
      addLog("ai", line);
      const avg =
        playerMoveTimes.current.reduce((a, b) => a + b, 0) /
        Math.max(1, playerMoveTimes.current.length);
      const p: string[] = [];
      p.push(outcome === "win" ? "Defiant. Rare." : outcome === "lose" ? "Compliant. As expected." : "Evasive.");
      p.push(avg > 9000 ? "Hesitates under observation." : avg < 3500 ? "Impulsive. Likely young." : "Measured. Cautious.");
      p.push(moveCount > 40 ? "Endurance suggests obsession." : "Tires quickly when watched.");
      p.push("Subject will return to the program within 48 hours.");
      setProfile(p);
      window.setTimeout(() => onEnd({ outcome, moves: moveCount, profile: p }), 2200);
    },
    [addLog, moveCount, onEnd]
  );

  const aiTurn = useCallback(
    (current: Chess) => {
      setThinking(true);
      const delay = 700 + Math.random() * 1400;
      window.setTimeout(() => {
        const move = pickAIMove(current);
        if (!move) {
          setThinking(false);
          endGame(current);
          return;
        }
        const g2 = new Chess(current.fen());
        g2.move(move.san);
        setGame(g2);
        setFen(g2.fen());
        movePulse();
        setMoveCount((n) => n + 1);

        // Commentary
        const total = moveCount + 1;
        const isCapture = !!move.captured;
        const isCheck = g2.inCheck();
        if (isCheck) {
          addLog("ai", pick(CHECK_LINES));
          heartbeat();
          setIntensity((v) => Math.min(10, v + 1.5));
        } else if (Math.random() < (isCapture ? 0.85 : 0.35)) {
          const bank = total < 8 ? EARLY_MOVES : total < 22 ? MID_MOVES : LATE_MOVES;
          addLog("ai", pick(bank));
        }
        if (isCapture) {
          addAnomaly(`LOG: ${move.captured?.toUpperCase()} consumed at ${move.to}`);
        }
        setIntensity((v) => Math.min(10, v + 0.25));
        setThinking(false);
        if (g2.isGameOver()) endGame(g2);
      }, delay);
    },
    [addLog, addAnomaly, endGame, moveCount]
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (thinking || ended.current || !targetSquare) return false;
      const g = new Chess(game.fen());
      try {
        const move = g.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
        if (!move) return false;
        const dt = Date.now() - lastMoveStart.current;
        playerMoveTimes.current.push(dt);
        lastMoveStart.current = Date.now();
        setGame(g);
        setFen(g.fen());
        setMoveCount((n) => n + 1);
        movePulse();
        addLog("you", move.san);
        if (dt > 12000) {
          window.setTimeout(() => addLog("ai", "You hesitated."), 400);
        }
        if (g.isGameOver()) {
          endGame(g);
          return true;
        }
        aiTurn(g);
        return true;
      } catch {
        return false;
      }
    },
    [game, thinking, aiTurn, addLog, endGame]
  );

  const headerText = useMemo(() => "C:\\PROGRAM_FILES\\chess.exe", []);

  return (
    <div className="min-h-screen w-full p-4 md:p-8 flex flex-col">
      <AnomalyPopups anomalies={anomalies} />
      <GlobalGlitchOverlay intensity={intensity} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2 mb-4 flicker-slow">
        <div
          className={`text-sm md:text-base ${headerGlitch ? "rgb-split glitch-clip" : "text-glow"}`}
          style={{ color: "var(--terminal)" }}
        >
          {headerText}
        </div>
        <div className="text-xs text-muted-foreground flex gap-4">
          <span>moves: {moveCount}</span>
          <span>intensity: {intensity.toFixed(1)}</span>
          <span>{thinking ? "OPPONENT THINKING…" : "AWAITING INPUT"}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Board */}
        <motion.div
          className="flex items-center justify-center"
          animate={
            boardFlicker
              ? { opacity: [1, 0.2, 1, 0.6, 1], x: [0, -3, 2, 0] }
              : { opacity: 1, x: 0 }
          }
          transition={{ duration: 0.25 }}
        >
          <div
            className="relative border border-terminal/40 box-glow p-3 bg-black"
            style={{ width: "min(72vh, 92vw)" }}
          >
            <Chessboard
              options={{
                position: fen,
                onPieceDrop,
                boardOrientation: "white",
                animationDurationInMs: 220,
                darkSquareStyle: {
                  backgroundColor: "oklch(0.14 0.04 142)",
                  boxShadow: "inset 0 0 12px oklch(0.3 0.18 142 / 0.25)",
                },
                lightSquareStyle: {
                  backgroundColor: "oklch(0.22 0.05 142)",
                },
                boardStyle: {
                  borderRadius: 2,
                  filter: `drop-shadow(0 0 8px oklch(0.5 0.2 142 / 0.4))`,
                },
                darkSquareNotationStyle: { color: "oklch(0.8 0.2 142)" },
                lightSquareNotationStyle: { color: "oklch(0.4 0.12 142)" },
              }}
            />
            {/* Scan overlay on board */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,0.18) 2px 3px)",
              }}
            />
            {game.inCheck() && (
              <div
                className="pointer-events-none absolute inset-0 animate-[pulseGlow_1.2s_ease-in-out_infinite]"
                style={{
                  boxShadow: "inset 0 0 60px oklch(0.6 0.3 25 / 0.55)",
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Right: terminal log */}
        <div className="flex flex-col border border-border bg-card/60 box-glow p-3 h-[72vh]">
          <div className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-2">
            ░ live transcript ░
          </div>
          <div className="flex-1 min-h-0">
            <TerminalLog logs={logs} />
          </div>
          <div className="border-t border-border pt-2 text-[10px] text-muted-foreground">
            <div>connection: <span style={{ color: "var(--terminal)" }}>STABLE*</span></div>
            <div>observer: <span style={{ color: "var(--blood)" }}>UNKNOWN</span></div>
            <div>autosave: disabled</div>
          </div>
        </div>
      </div>

      {/* Hidden profile preload (for ending) */}
      <div className="sr-only">{profile.join(" ")}</div>
    </div>
  );
}
