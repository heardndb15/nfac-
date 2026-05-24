'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore } from '@/lib/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [glitch, setGlitch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 3000);
    return () => clearInterval(giv);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.length < 3) {
      setError('USERNAME TOO SHORT');
      return;
    }

    setLoading(true);
    // Simulate some "system work"
    await new Promise(r => setTimeout(r, 800));

    const user = authStore.register(username, password);
    if (user) {
      authStore.setCurrentUser(user);
      router.push('/');
    } else {
      setError('IDENTITY ALREADY EXISTS IN DATABASE');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Scanlines & Vignette */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.1) 2px,rgba(0,255,65,0.1) 4px)' }} />
      <div className="fixed inset-0 pointer-events-none z-40" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.9) 100%)' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md z-10 transition-transform duration-75 ${glitch ? 'translate-x-1 skew-x-1' : ''}`}
      >
        <div className="border border-green-900 bg-black/80 backdrop-blur-sm p-8 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tighter text-green-500">
              CREATE_IDENTITY.SYS
            </h1>
            <div className="text-[10px] text-green-800 animate-pulse">REV 4.2</div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-green-700 block">System Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="w-full bg-black border border-green-900 p-3 outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all uppercase placeholder:text-green-950"
                placeholder="SURJECT_NAME"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-green-700 block">Access Key (Optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-green-900 p-3 outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all placeholder:text-green-950"
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-950/30 border border-red-900/50 p-3 text-red-500 text-xs text-center font-bold animate-pulse"
                >
                  [ERROR] {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={loading}
              className={`w-full py-4 font-bold tracking-[0.2em] transition-all relative overflow-hidden group ${
                loading ? 'bg-green-900 cursor-not-allowed' : 'bg-green-600/10 border border-green-500 hover:bg-green-500 hover:text-black'
              }`}
            >
              {loading ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                <span>INITIALIZE_ACCOUNT</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-green-900/40 flex flex-col gap-4 text-center">
            <p className="text-[10px] text-green-800">
              BY CLICKING INITIALIZE, YOU CONSENT TO BEHAVIORAL DATA EXTRACTION BY CHESS.EXE
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="text-xs text-green-600 hover:text-green-400 transition-colors uppercase tracking-widest"
            >
              Already tracked? Log in here
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer info */}
      <div className="mt-8 text-green-900 text-[10px] uppercase tracking-widest">
        Kernel process: active | network: local | soul_id: extracted
      </div>
    </div>
  );
}
