import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Dumbbell, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { haptics } from '../lib/haptics';

export const Login: React.FC = () => {
  const { signIn, useGuestDemo, isCloudConnected } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    haptics.tap();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        haptics.warning();
        setError(signInError.message);
      } else {
        haptics.success();
        navigate('/');
      }
    } catch (err: any) {
      haptics.warning();
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoAccess() {
    haptics.success();
    useGuestDemo();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0E1013]">
      <div className="w-full max-w-xs">
        {/* Brand Header */}
        <div className="mb-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <div className="w-7 h-7 bg-[#15171C] border border-[#E8B347]/50 flex items-center justify-center text-[#E8B347]">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <h1 className="font-display text-2xl tracking-wider text-[#EDEEF0]">
              IRON <span className="text-[#E8B347]">LOG</span>
            </h1>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] font-mono text-[#8B8F98]">
            <span>PWA READY</span>
            <span>•</span>
            <span className="text-[#6FCF97]">HAPTICS ACTIVE</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card p-4 border border-[#22252C] bg-[#15171C]">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8B8F98] font-mono mb-1">
                Athlete Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                className="input-field text-xs py-1"
                placeholder="athlete@gym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8B8F98] font-mono mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                className="input-field text-xs py-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-2 bg-[#E36565]/10 border border-[#E36565]/40 text-[#E36565] text-[11px] font-mono rounded-[2px]">
                {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-1.5 text-xs uppercase"
            >
              {loading ? 'Entering...' : 'Log In'}
            </button>
          </form>

          {/* Quick Instant Entry Option */}
          <div className="mt-3 pt-3 border-t border-[#22252C] text-center">
            <button
              id="guest-demo-btn"
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-1.5 px-2 bg-[#0E1013] border border-[#22252C] text-[#E8B347] hover:border-[#E8B347]/60 text-[11px] uppercase font-bold tracking-wider rounded-[2px] transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Instant Offline Athlete Mode</span>
            </button>
          </div>

          <div className="mt-3 text-center text-xs text-[#8B8F98]">
            New athlete?{' '}
            <Link
              to="/signup"
              onClick={() => haptics.tap()}
              className="text-[#E8B347] hover:underline font-semibold"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
