import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CRTLayout } from "@/components/CRTLayout";
import { LandingScreen } from "@/components/LandingScreen";
import { GameScreen } from "@/components/GameScreen";
import { EndScreen } from "@/components/EndScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "chess.exe — do not run" },
      {
        name: "description",
        content:
          "A forbidden AI chess program from the early internet. Play if you dare.",
      },
      { property: "og:title", content: "chess.exe — do not run" },
      {
        property: "og:description",
        content: "Psychological horror chess. The AI is watching you.",
      },
    ],
  }),
  component: Index,
});

type Phase = "landing" | "game" | "end";

function Index() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [result, setResult] = useState<{
    outcome: "win" | "lose" | "draw";
    moves: number;
    profile: string[];
  } | null>(null);

  return (
    <CRTLayout>
      <AnimatePresence mode="wait">
        {phase === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.6 }}
          >
            <LandingScreen onRun={() => setPhase("game")} />
          </motion.div>
        )}
        {phase === "game" && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GameScreen
              onEnd={(r) => {
                setResult(r);
                setPhase("end");
              }}
            />
          </motion.div>
        )}
        {phase === "end" && result && (
          <motion.div
            key="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EndScreen
              outcome={result.outcome}
              moves={result.moves}
              profile={result.profile}
              onAgain={() => {
                setResult(null);
                setPhase("landing");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </CRTLayout>
  );
}
