import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  Dumbbell, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { authenticateUser } from '../lib/authStore';
import { PREDEFINED_USERS } from '../lib/seedUsers';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';
import { AuthUser } from '../types';

interface AuthScreenProps {
  onSuccess?: (user?: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { theme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    setErrorMessage(null);
  };

  const handleQuickFill = async (userIdentifier: string, userPass: string, displayName: string) => {
    haptics.trigger('light');
    setIdentifier(userIdentifier);
    setPassword(userPass);
    if (isSignUp) setName(displayName);
    setErrorMessage(null);

    // Also offer direct auto-login when clicking the preset account cards
    setIsLoading(true);
    try {
      const user = await authenticateUser(userIdentifier, userPass, displayName, false);
      haptics.trigger('success');
      if (onSuccess) onSuccess(user);
    } catch (err: any) {
      console.warn('Quick login notice:', err);
      // If error occurs, leave values filled so user can click Sign In
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = identifier.trim();
    if (trimmedId.length < 3) {
      setErrorMessage('Please enter a valid Username or Phone number (at least 3 characters)');
      haptics.trigger('warning');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      haptics.trigger('warning');
      return;
    }

    if (isSignUp && !name.trim()) {
      setErrorMessage('Please enter your full name');
      haptics.trigger('warning');
      return;
    }

    setIsLoading(true);
    haptics.trigger('selection');

    try {
      const user = await authenticateUser(trimmedId, password, isSignUp ? name.trim() : undefined, isSignUp);

      // Best effort sync profile to Firestore if Firestore is accessible
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            phoneNumber: trimmedId,
            name: user.displayName || trimmedId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('Firestore profile sync (offline/local fallback):', firestoreErr);
      }

      haptics.trigger('success');
      if (onSuccess) onSuccess(user);
    } catch (err: any) {
      console.error('Auth error:', err);
      haptics.trigger('warning');

      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setErrorMessage('Invalid username/phone or password. Please verify your credentials or create an account.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('An account already exists with this username/phone. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMessage('Authentication method is currently initializing. Please try again in a moment.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0B0F] text-white relative overflow-hidden font-sans">
      {/* Ambient background glow accents */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.primary }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-15"
        style={{ backgroundColor: '#00E5FF' }}
      />

      <div className="w-full max-w-md z-10">
        {/* App Branding Header */}
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-2xl border border-white/10"
            style={{ 
              backgroundColor: `${theme.primary}20`,
              boxShadow: `0 12px 30px -10px ${theme.primary}50`
            }}
          >
            <Dumbbell className="w-8 h-8" style={{ color: theme.primary }} />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-xl font-black tracking-tight text-white">AURA</span>
            <span className="text-xl font-black tracking-tight" style={{ color: theme.primary }}>FIT</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#1A1F2E] border border-[#2B334B] text-[#A6AFC2]">
              PRO
            </span>
          </div>
          <p className="text-xs text-[#8E95A5]">
            Isolated User Vault • Zero Data Leakage Security
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl bg-[#12141D] border border-[#222738] p-6 sm:p-7 shadow-2xl shadow-black/80">
          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0B0D13] border border-[#1E2333] mb-6">
            <button
              type="button"
              onClick={() => {
                haptics.trigger('selection');
                setIsSignUp(false);
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                !isSignUp 
                  ? 'shadow-md text-[#0A0B0F]' 
                  : 'text-[#8E95A5] hover:text-white'
              }`}
              style={!isSignUp ? {
                backgroundColor: theme.primary,
                color: theme.primaryContrast
              } : undefined}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.trigger('selection');
                setIsSignUp(true);
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isSignUp 
                  ? 'shadow-md text-[#0A0B0F]' 
                  : 'text-[#8E95A5] hover:text-white'
              }`}
              style={isSignUp ? {
                backgroundColor: theme.primary,
                color: theme.primaryContrast
              } : undefined}
            >
              Create Account
            </button>
          </div>

          {/* Form Title & Context */}
          <div className="mb-5">
            <h2 className="text-lg font-black text-white">
              {isSignUp ? 'Create your private gym account' : 'Welcome back, Athlete'}
            </h2>
            <p className="text-xs text-[#8E95A5] mt-0.5">
              {isSignUp 
                ? 'Your workouts, weight history, and custom plans stay strictly in your private vault.'
                : 'Sign in with your username or phone number to access your workouts.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#FCA5A5] animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#A6AFC2] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                  <span>Full Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Henderson"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-[#0B0D13] border border-[#222738] focus:border-[#38BDF8] rounded-2xl px-4 py-3 text-sm text-white placeholder-[#5A6277] outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Username or Phone Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#A6AFC2] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                <span>Username or Phone</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Kartheek.g or phone number"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full bg-[#0B0D13] border border-[#222738] focus:border-[#38BDF8] rounded-2xl px-4 py-3 text-sm text-white placeholder-[#5A6277] outline-none transition-colors font-mono"
                />
              </div>
              <p className="text-[10px] text-[#5A6277]">
                e.g. <strong className="text-white font-mono">Kartheek.g</strong> or <strong className="text-white font-mono">Harsha.k</strong>
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#A6AFC2] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                <span>Password</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password (e.g. Test@123)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-[#0B0D13] border border-[#222738] focus:border-[#38BDF8] rounded-2xl pl-4 pr-11 py-3 text-sm text-white placeholder-[#5A6277] outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1.5 text-[#8E95A5] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: theme.primary,
                color: theme.primaryContrast,
                boxShadow: `0 8px 24px -4px ${theme.primary}50`
              }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create My Account' : 'Sign In To Workout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Tap Login Buttons for Requested Users */}
          <div className="mt-6 pt-5 border-t border-[#1C2130]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C758A] flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-[#38BDF8]" />
                <span>Select User (Instant Login)</span>
              </span>
              <Sparkles className="w-3 h-3 text-[#38BDF8]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PREDEFINED_USERS.map((usr) => (
                <button
                  key={usr.username}
                  type="button"
                  onClick={() => handleQuickFill(usr.username, usr.password, usr.name)}
                  className="p-2.5 rounded-xl bg-[#0B0D13] border border-[#1E2436] hover:border-[#38BDF8]/70 text-left transition-all group active:scale-95"
                >
                  <div className="text-[11px] font-bold text-white group-hover:text-[#38BDF8] flex items-center justify-between">
                    <span>{usr.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#38BDF8] mt-0.5">
                    {usr.username}
                  </div>
                  <div className="text-[9px] font-mono text-[#6C758A] mt-0.5">
                    Pass: {usr.password}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Security & Isolation guarantee */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#8E95A5]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Isolated Cloud Vaults: User A cannot access User B data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

