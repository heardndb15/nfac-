import { useEffect, useState } from "react";

interface Props {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
  cursor?: boolean;
}

export function TerminalText({ text, speed = 28, className = "", onDone, cursor = true }: Props) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, onDone]);
  return (
    <span className={className}>
      {shown}
      {cursor && shown.length < text.length && <span className="cursor-blink" />}
    </span>
  );
}
