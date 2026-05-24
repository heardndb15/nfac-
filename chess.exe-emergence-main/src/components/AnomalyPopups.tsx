import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface Anomaly {
  id: number;
  text: string;
  kind?: "popup" | "warn";
}

interface Props {
  anomalies: Anomaly[];
}

export function AnomalyPopups({ anomalies }: Props) {
  const popups = anomalies.filter((a) => a.kind !== "warn");
  const warns = anomalies.filter((a) => a.kind === "warn");
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {popups.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              top: `${15 + ((i * 13) % 60)}%`,
              left: `${20 + ((i * 17) % 55)}%`,
            }}
            className="absolute border border-blood/60 bg-background/95 px-3 py-2 text-xs font-mono shake-soft box-glow-red max-w-[280px]"
          >
            <div
              className="text-[10px] opacity-70 mb-0.5"
              style={{ color: "var(--blood)" }}
            >
              ▲ system anomaly
            </div>
            <div className="rgb-split" style={{ color: "var(--blood)" }}>
              {a.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Top warning banner stack */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center">
        <AnimatePresence>
          {warns.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="px-3 py-1 text-[11px] font-mono border border-blood/70 bg-black/80 text-glow-red rgb-split flicker"
              style={{ color: "var(--blood)" }}
            >
              {a.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function GlobalGlitchOverlay({ intensity }: { intensity: number }) {
  // Random horizontal slice tear
  const [tear, setTear] = useState<{ top: number; h: number; off: number } | null>(null);
  useEffect(() => {
    if (intensity < 1) return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.18 + intensity * 0.05) {
        setTear({
          top: Math.random() * 90,
          h: 2 + Math.random() * 18,
          off: (Math.random() - 0.5) * 30,
        });
        window.setTimeout(() => setTear(null), 120);
      }
    }, 1400 - Math.min(900, intensity * 120));
    return () => window.clearInterval(id);
  }, [intensity]);
  if (!tear) return null;
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[45] mix-blend-screen"
      style={{
        top: `${tear.top}%`,
        height: `${tear.h}vh`,
        transform: `translateX(${tear.off}px)`,
        background:
          "linear-gradient(to right, transparent, oklch(0.7 0.3 27 / 0.25), transparent)",
      }}
    />
  );
}
