'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomLog, getTimestamp } from '@/lib/events';

interface LogEntry {
  id: string;
  ts: string;
  text: string;
  color: string;
}

interface TerminalProps {
  corruptionLevel: number;
  extraLogs: string[];
}

function logColor(text: string): string {
  if (text.includes('[CRIT]') || text.includes('[???]') || text.includes('[SYS] WHO')) return '#ff3333';
  if (text.includes('[ERR]')) return '#ff5555';
  if (text.includes('[WARN]')) return '#ffaa00';
  if (text.includes('[AI]')) return '#00ccff';
  if (text.includes('[SYS]')) return '#888888';
  if (text.includes('[GAME]')) return '#aaffaa';
  return '#00ff41';
}

export default function Terminal({ corruptionLevel, extraLogs }: TerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '0', ts: getTimestamp(), text: '[SYS] Chess.exe v1.0.0 initialized', color: '#00ff41' },
    { id: '1', ts: getTimestamp(), text: '[INFO] Awaiting player...', color: '#00ff41' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevExtra = useRef<string[]>([]);

  // Auto-generate system logs
  useEffect(() => {
    const delay = Math.max(300, 2500 - corruptionLevel * 2000);
    const iv = setInterval(() => {
      const text = getRandomLog(corruptionLevel);
      setLogs(prev => [
        ...prev.slice(-60),
        { id: Date.now() + Math.random() + '', ts: getTimestamp(), text, color: logColor(text) },
      ]);
    }, delay + Math.random() * 1000);
    return () => clearInterval(iv);
  }, [corruptionLevel]);

  // Push external game logs
  useEffect(() => {
    if (!extraLogs.length) return;
    const newOnes = extraLogs.filter(l => !prevExtra.current.includes(l));
    if (!newOnes.length) return;
    prevExtra.current = extraLogs;
    newOnes.forEach(text => {
      setLogs(prev => [
        ...prev.slice(-60),
        { id: Date.now() + Math.random() + '', ts: getTimestamp(), text, color: logColor(text) },
      ]);
    });
  }, [extraLogs]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black border border-green-950 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-green-950 bg-black shrink-0">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-green-700 text-xs font-mono tracking-wider">SYSTEM.LOG — LIVE STREAM</span>
        <span className="ml-auto text-xs font-mono" style={{ color: corruptionLevel > 0.5 ? '#ff4444' : '#00ff41' }}>
          CORRUPT: {(corruptionLevel * 100).toFixed(1)}%
        </span>
      </div>

      {/* Logs */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#003300 #000' }}
      >
        <AnimatePresence initial={false}>
          {logs.map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-2 leading-5"
            >
              <span className="text-green-900 shrink-0">[{log.ts}]</span>
              <span style={{ color: log.color, wordBreak: 'break-all' }}>{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="text-green-800 animate-pulse">█</div>
      </div>
    </div>
  );
}
