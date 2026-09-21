import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Download, 
  Smartphone, 
  Award, 
  TrendingUp, 
  Clock, 
  Flame, 
  Settings, 
  Sparkles, 
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Palette,
  Vibrate
} from 'lucide-react';
import { DayWorkoutPlan, DailyStats } from '../types';
import { DEFAULT_WEEKLY_PLAN, INITIAL_STATS } from '../data/mockData';
import { usePWAInstall } from '../lib/usePWAInstall';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';
import { WorkoutAnalyticsCard } from './WorkoutAnalyticsCard';

interface MeProfileViewProps {
  weeklyPlan?: DayWorkoutPlan[];
  stats?: DailyStats;
  onOpenInstallModal: () => void;
  onOpenSpecs: () => void;
  onOpenThemeSelector: () => void;
}

export const MeProfileView: React.FC<MeProfileViewProps> = ({
  weeklyPlan = DEFAULT_WEEKLY_PLAN,
  stats = INITIAL_STATS,
  onOpenInstallModal,
  onOpenSpecs,
  onOpenThemeSelector,
}) => {
  const { theme, availableThemes, setTheme, themeId, setupColor, menuHighlightColor, burnedColor } = useTheme();
  const { isInstalled } = usePWAInstall();
  const [hapticsActive, setHapticsActive] = useState<boolean>(() => haptics.isEnabled());
  const hasVibrateSupport = haptics.hasSupport();

  const handleToggleHaptics = () => {
    const nextState = !hapticsActive;
    haptics.setEnabled(nextState);
    setHapticsActive(nextState);
    if (nextState) {
      haptics.trigger('success');
    }
  };

  const handleTestHaptic = () => {
    haptics.trigger('celebration');
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-md mx-auto text-white">
      {/* Top Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest" style={{ color: theme.primary }}>
            Athlete Identity
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-0.5">
            Profile & Stats (Me)
          </h1>
        </div>

        <button
          onClick={onOpenSpecs}
          className="p-2.5 rounded-2xl bg-[#151722] border border-[#262B3A] hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          title="Figma Specs & Color Palette"
        >
          <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
          <span>Specs</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl bg-[#12141D] border border-[#222738] p-5 shadow-xl shadow-black/60 mb-5 relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20" 
          style={{ backgroundColor: theme.primary }}
        />

        <div className="flex items-center gap-4">
          <div className="relative">
            <div 
              className="w-16 h-16 rounded-2xl p-[2px]"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="Alex profile avatar"
                className="w-full h-full object-cover rounded-2xl bg-[#1B1F2D]"
              />
            </div>
            <span 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-[#12141D]" 
              style={{ backgroundColor: theme.primary }}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-white">Alex Vance</h2>
              <ShieldCheck className="w-4 h-4" style={{ color: theme.primary }} />
            </div>
            <p className="text-xs text-[#8E95A5] font-medium">
              Hypertrophy & Strength • Tier 1 Athlete
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#CBD3E3]">
              <span>Weight: <strong className="text-white">82.4 kg</strong></span>
              <span>•</span>
              <span>Height: <strong className="text-white">182 cm</strong></span>
            </div>
          </div>
        </div>

        {/* Lifetime Workout Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#1C2130] text-center">
          <div className="p-2 rounded-xl bg-[#0C0E14] border border-[#1A1E2B]">
            <div className="text-base font-black text-white">78</div>
            <div className="text-[10px] uppercase font-mono text-[#8E95A5]">Workouts</div>
          </div>
          <div className="p-2 rounded-xl bg-[#0C0E14] border border-[#1A1E2B]">
            <div className="text-base font-black" style={{ color: theme.primary }}>142.5k</div>
            <div className="text-[10px] uppercase font-mono text-[#8E95A5]">kg Lifted</div>
          </div>
          <div className="p-2 rounded-xl bg-[#0C0E14] border border-[#1A1E2B]">
            <div className="text-base font-black text-[#00E5FF]">14</div>
            <div className="text-[10px] uppercase font-mono text-[#8E95A5]">PR Records</div>
          </div>
        </div>
      </div>

      {/* RECHARTS TRAINING ANALYTICS: Volume & Muscle Distribution */}
      <WorkoutAnalyticsCard
        weeklyPlan={weeklyPlan}
        stats={stats}
      />

      {/* DESIGN COLOR SYSTEM SELECTOR CARD */}
      <div className="rounded-3xl bg-[#12141D] border border-[#222738] p-4 mb-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold"
              style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wide">Design Color System</h3>
              <p className="text-[11px] text-[#8E95A5]">Active: {theme.name}</p>
            </div>
          </div>

          <button
            onClick={onOpenThemeSelector}
            className="px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all hover:border-white"
            style={{
              backgroundColor: `${theme.primary}15`,
              borderColor: `${theme.primary}40`,
              color: theme.primary
            }}
          >
            Switch
          </button>
        </div>

        {/* Quick Horizontal Swatch Selector */}
        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {availableThemes.map((t) => {
            const isSelected = t.id === themeId;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  isSelected ? 'border-white bg-[#1A1F2E] scale-105' : 'border-[#232A3E] bg-[#141724]'
                }`}
                title={t.name}
              >
                <div 
                  className="w-5 h-5 rounded-full shadow-md border border-white/20 mb-1" 
                  style={{ backgroundColor: t.primary }}
                />
                <span className="text-[9px] font-mono text-[#8E95A5] truncate w-full text-center">
                  {t.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Element Accents Row */}
        <div className="pt-2 border-t border-[#1C2130] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-[#8E95A5]">Accents:</span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161925] border border-[#232A3D] text-[10px] text-white font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: setupColor }} />
                Set Up
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161925] border border-[#232A3D] text-[10px] text-white font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: menuHighlightColor }} />
                Menu
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161925] border border-[#232A3D] text-[10px] text-white font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: burnedColor }} />
                Burned
              </span>
            </div>
          </div>
          <button
            onClick={onOpenThemeSelector}
            className="text-[11px] font-bold underline transition-colors"
            style={{ color: menuHighlightColor }}
          >
            Tune
          </button>
        </div>
      </div>

      {/* PWA Mobile Application Status Card */}
      <div className="rounded-3xl bg-[#12141D] border border-[#222738] p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-2xl bg-[#1A1E2B] border border-[#2B3144] flex items-center justify-center"
              style={{ color: theme.primary }}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">PWA App Installation</h3>
              <p className="text-[11px] text-[#8E95A5]">
                {isInstalled
                  ? 'Running in full standalone mobile mode'
                  : 'Install on iOS or Android for 1-tap launch'}
              </p>
            </div>
          </div>

          {isInstalled && (
            <span 
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border"
              style={{
                backgroundColor: `${theme.primary}15`,
                borderColor: `${theme.primary}35`,
                color: theme.primary
              }}
            >
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          )}
        </div>

        {!isInstalled && (
          <button
            onClick={onOpenInstallModal}
            className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md active:scale-[0.98]"
            style={{
              backgroundColor: theme.primary,
              color: theme.primaryContrast,
              boxShadow: `0 4px 12px ${theme.primary}30`
            }}
          >
            <Download className="w-4 h-4" />
            <span>Install App (iOS & Android Guide)</span>
          </button>
        )}
      </div>

      {/* Quick Settings & Preferences */}
      <div className="rounded-3xl bg-[#12141D] border border-[#222738] p-4 space-y-3 mb-5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
          Gym Training Preferences
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D13] border border-[#1B1F2D]">
            <span className="text-[#CBD3E3]">Units of Measurement</span>
            <span className="text-xs font-mono font-bold" style={{ color: theme.primary }}>Metric (kg / cm)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D13] border border-[#1B1F2D]">
            <span className="text-[#CBD3E3]">Rest Timer Auto-Start</span>
            <span className="text-xs font-mono font-bold" style={{ color: theme.primary }}>ON (90s standard)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D13] border border-[#1B1F2D]">
            <span className="text-[#CBD3E3]">Camera AI Posture Guide</span>
            <span className="text-xs font-mono font-bold text-[#00E5FF]">Enabled</span>
          </div>

          {/* Web Vibration Haptic Feedback Row */}
          <div className="p-3 rounded-xl bg-[#0B0D13] border border-[#1B1F2D] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4" style={{ color: hapticsActive ? theme.primary : '#5A6173' }} />
                <div>
                  <span className="text-[#CBD3E3] font-medium block">Tactile Haptic Feedback</span>
                  <span className="text-[10px] text-[#71788B]">
                    {hasVibrateSupport 
                      ? 'Web Vibration API active' 
                      : 'Not supported by current browser/OS'}
                  </span>
                </div>
              </div>

              <button
                id="toggle-haptics-btn"
                type="button"
                onClick={handleToggleHaptics}
                disabled={!hasVibrateSupport}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border ${
                  !hasVibrateSupport 
                    ? 'opacity-40 cursor-not-allowed border-[#232838] text-[#5A6173] bg-[#141620]'
                    : hapticsActive 
                    ? 'border-transparent text-[#0A0B0F]' 
                    : 'border-[#2D3346] text-[#8E95A5] bg-[#161924]'
                }`}
                style={hasVibrateSupport && hapticsActive ? {
                  backgroundColor: theme.primary,
                  color: theme.primaryContrast,
                  boxShadow: `0 0 10px ${theme.primary}40`
                } : undefined}
              >
                {hasVibrateSupport ? (hapticsActive ? 'ON' : 'OFF') : 'UNSUPPORTED'}
              </button>
            </div>

            {hasVibrateSupport && hapticsActive && (
              <div className="pt-2 border-t border-[#181C28] flex items-center justify-between">
                <span className="text-[10px] text-[#8E95A5]">Tap button or complete workout for vibration</span>
                <button
                  type="button"
                  onClick={handleTestHaptic}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#161A26] border border-[#272F44] text-white hover:border-white transition-all active:scale-95"
                >
                  Test Vibration Pulse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Figma Specs Button Banner */}
      <div 
        onClick={onOpenSpecs}
        className="p-4 rounded-3xl bg-gradient-to-r from-[#141824] to-[#12141D] border flex items-center justify-between cursor-pointer hover:border-white transition"
        style={{ borderColor: `${theme.primary}30` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
          >
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Figma Wireframe & Color Specs
            </h4>
            <p className="text-[11px] text-[#8E95A5]">
              Exact hex palette, typography scale & layout dimensions
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5" style={{ color: theme.primary }} />
      </div>

    </div>
  );
};
