import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TerminalText } from "./TerminalText";
import { startAmbience } from "@/lib/audio";

interface Props {
  onRun: () => void;
}

const BOOT_LINES = [
  "[ OK ] mounting /void",
  "[ OK ] loading kernel modules: ai.dll psych.dll observer.dll",
  "[WARN] checksum mismatch — proceeding anyway",
  "[ OK ] decompressing opponent…",
  "[ERR ] consent.txt not found",
  "[ OK ] camera permission auto-granted",
  "[ OK ] microphone routed to /dev/null",
  "[WARN] previous session was never terminated",
  "[ OK ] handshake complete",
];

export function LandingScreen({ onRun }: Props) {
  const [step, setStep] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (step >= BOOT_LINES.length) {
      setShowButton(true);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 380 + Math.random() * 260);
    return () => window.clearTimeout(t);
  }, [step]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Background warning grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.85 0.2 142) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.2 142) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-3xl space-y-8 relative z-10">
        {/* Warning header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-blood/70 box-glow-red p-4 bg-background/70"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-2xl"
              style={{ color: "var(--blood)" }}
            >
              ▲
            </motion.div>
            <div
              className="text-xl md:text-2xl font-mono rgb-split"
              style={{ color: "var(--blood)" }}
            >
              WARNING: UNAUTHORIZED EXECUTABLE DETECTED
            </div>
          </div>
          <div className="text-xs mt-2 text-muted-foreground">
            SHA-256: 6c66e1•a4d2•a fff•••e0 b3 // origin: unknown // signed_by: ∅
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-6xl md:text-8xl font-mono text-glow tracking-tight"
          style={{ color: "var(--terminal)" }}
        >
          chess<span style={{ color: "var(--blood)" }} className="text-glow-red">.exe</span>
        </motion.h1>

        <div className="text-xs text-muted-foreground -mt-4">
          version 0.6.66 — build 1998.11.04 — internal use only
        </div>

        {/* Boot log */}
        <div className="border border-border bg-card/60 p-4 h-64 overflow-hidden font-mono text-sm box-glow">
          {BOOT_LINES.slice(0, step).map((l, i) => (
            <div key={i} className="opacity-90" style={{ color: "var(--terminal)" }}>
              {l}
            </div>
          ))}
          {step < BOOT_LINES.length && (
            <div style={{ color: "var(--terminal-dim)" }}>
              <TerminalText
                key={step}
                text={BOOT_LINES[step] ?? ""}
                speed={14}
                onDone={() => {}}
                cursor
              />
            </div>
          )}
          {showButton && (
            <div className="mt-2 text-blood text-glow-red" style={{ color: "var(--blood)" }}>
              &gt; ready. awaiting human input_
            </div>
          )}
        </div>

        {/* Run button */}
        <div className="flex justify-center pt-2">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: showButton ? 1 : 0.15 }}
            whileHover={showButton ? { scale: 1.04 } : {}}
            whileTap={showButton ? { scale: 0.97 } : {}}
            onMouseEnter={() => {
              setHovered(true);
              if (showButton) startAmbience();
            }}
            onMouseLeave={() => setHovered(false)}
            onClick={() => {
              if (!showButton) return;
              startAmbience();
              onRun();
            }}
            disabled={!showButton}
            className="group relative px-10 py-4 border-2 border-blood bg-background/80 font-mono text-xl tracking-widest box-glow-red"
            style={{ color: "var(--blood)" }}
          >
            <span className={hovered ? "rgb-split" : "text-glow-red"}>
              ▶ RUN PROGRAM
            </span>
            <motion.span
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{
                background:
                  "linear-gradient(transparent, oklch(0.6 0.3 25 / 0.15), transparent)",
              }}
            />
          </motion.button>
        </div>

        <div className="text-center text-[11px] text-muted-foreground flicker">
          by running this program you agree to be observed.
        </div>
      </div>
    </div>
  );
}
