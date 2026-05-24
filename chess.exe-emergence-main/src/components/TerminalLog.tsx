import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface LogEntry {
  id: number;
  kind: "ai" | "sys" | "you" | "corrupt";
  text: string;
}

interface Props {
  logs: LogEntry[];
}

export function TerminalLog({ logs }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  return (
    <div
      ref={ref}
      className="h-full overflow-y-auto font-mono text-sm leading-relaxed pr-2"
    >
      <AnimatePresence initial={false}>
        {logs.map((l) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-1 ${l.kind === "corrupt" ? "rgb-split glitch-clip" : ""}`}
          >
            {l.kind === "ai" && (
              <span className="text-blood text-glow-red" style={{ color: "var(--blood)" }}>
                AI &gt;{" "}
              </span>
            )}
            {l.kind === "sys" && (
              <span className="text-muted-foreground">[SYS] </span>
            )}
            {l.kind === "corrupt" && (
              <span style={{ color: "var(--blood)" }}>[ERR] </span>
            )}
            {l.kind === "you" && (
              <span className="text-terminal-dim" style={{ color: "var(--terminal-dim)" }}>
                YOU &gt;{" "}
              </span>
            )}
            <SlowText text={l.text} kind={l.kind} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SlowText({ text, kind }: { text: string; kind: LogEntry["kind"] }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const speed = kind === "ai" ? 38 : 14;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, kind]);
  const color =
    kind === "ai"
      ? "var(--blood)"
      : kind === "sys"
      ? "var(--terminal-dim)"
      : kind === "corrupt"
      ? "var(--blood)"
      : "var(--terminal)";
  return (
    <span style={{ color }} className={kind === "ai" || kind === "corrupt" ? "text-glow-red" : "text-glow"}>
      {shown}
    </span>
  );
}
