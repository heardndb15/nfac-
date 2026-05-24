'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CASES } from '@/lib/cases';

export default function CasesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setMounted(true);
    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120 + Math.random() * 80);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(giv);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.9) 100%)' }}
      />

      <div className={`w-full max-w-4xl z-10 transition-transform duration-75 ${glitch ? 'translate-x-1' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-5xl font-bold text-red-500 mb-2 tracking-widest uppercase">
            [ ACTIVE CASES ]
          </h1>
          <p className="text-gray-400 text-sm tracking-[0.2em] animate-pulse">
            SELECT A TARGET FOR INVESTIGATION
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAME_CASES.map((caseData, idx) => (
            <motion.div
              key={caseData.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.2 }}
              onClick={() => router.push(`/cases/${caseData.id}`)}
              className="border border-green-900 bg-black p-6 cursor-pointer group relative overflow-hidden h-64 flex flex-col"
            >
              <div className="absolute inset-0 bg-green-900 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              
              <div className="text-red-500 font-bold mb-4 font-mono text-xl tracking-tight">
                CASE #{idx + 1}
              </div>
              
              <div className="text-green-300 flex-1">
                <div className="text-lg mb-2 font-bold">{caseData.title}</div>
                <div className="text-xs text-green-700 uppercase">Status: OPEN</div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-green-900 flex justify-between items-center group-hover:text-red-400 transition-colors">
                <span className="text-xs">ACCESS PROTOCOL</span>
                <span>{`>>`}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
