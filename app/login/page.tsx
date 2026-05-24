'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [glitch, setGlitch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const giv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4500);
    return () => clearInterval(giv);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulation
    await new Promise(r => setTimeout(r, 600));

    const user = authStore.login(username, password);
    if (user) {
      authStore.setCurrentUser(user);
      router.push('/');
    } else {
      setError('ACCESS DENIED: IDENTITY UNKNOWN OR INCORRECT KEY');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Visual Effects */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10" style={{ background: 'repeating-linear-gradient(90deg,transparent,transparent 1px,rgba(0,255,65,0.05) 1px,rgba(0,255,65,0.05) 2px)' }} />
      <div className="fixed inset-0 pointer-events-none z-40" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,1) 100%)' }} />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md z-10 transition-transform duration-75 ${glitch ? 'translate-y-0.5 -translate-x-0.5' : ''}`}
      >
        <div className="border border-red-900 bg-black/90 p-8 shadow-[0_0_30px_rgba(255,0,0,0.05)]">
          <div className="flex items-center justify-between mb-10 border-b border-red-900/50 pb-4">
            <h1 className="text-xl font-bold tracking-widest text-red-600 animate-pulse">
              AUTH_VERIFICATION.EXE
            </h1>
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(255,0,0,1)]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-red-900 block">Identifier</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-red-900/40 p-4 outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all uppercase text-red-500 font-bold"
                placeholder="USER_ID"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-red-900 block">Encrypted Code</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-red-900/40 p-4 outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all text-red-500"
                placeholder="********"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-600 text-[10px] text-center font-bold border-l-2 border-red-600 pl-4 py-1 italic"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={loading}
              className={`w-full py-4 font-bold tracking-widest transition-all ${
                loading ? 'bg-red-900 text-red-200 cursor-not-allowed opacity-50' : 'bg-red-600 text-black hover:bg-red-500 active:scale-[0.98]'
              }`}
            >
              {loading ? "VERIFYING..." : "GRANT_ACCESS()"}
            </button>
          </form>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => router.push('/register')}
              className="text-[10px] text-red-900 hover:text-red-500 transition-colors uppercase tracking-[0.2em] border-b border-transparent hover:border-red-500 pb-1"
            >
              New Subject? Register in Registry
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
