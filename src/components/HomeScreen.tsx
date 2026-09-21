import React, { useState } from 'react';
import { 
  Bell, 
  Flame, 
  Play, 
  Clock, 
  Zap, 
  ChevronRight, 
  Dumbbell, 
  ShieldCheck, 
  Download,
  Award,
  Sparkles,
  Calendar,
  Palette
} from 'lucide-react';
import { MuscleGroup, Exercise, WorkoutSession, DailyStats, DayWorkoutPlan } from '../types';
import { EXERCISE_DATABASE, PRELOADED_WORKOUT_OPTIONS } from '../data/mockData';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';

interface HomeScreenProps {
  stats: DailyStats;
  weeklyPlan: DayWorkoutPlan[];
  todayPlan: DayWorkoutPlan;
  onOpenWeeklySetup: () => void;
  onOpenThemeSelector: () => void;
  onStartWorkout: (workout: WorkoutSession) => void;
  onSelectExercise: (exercise: Exercise) => void;
  onOpenInstallModal: () => void;
  onOpenSpecs: () => void;
}

const MUSCLE_PILLS: { name: MuscleGroup; label: string; icon: string }[] = [
  { name: 'All', label: 'All Targets', icon: '⚡' },
  { name: 'Chest', label: 'Chest', icon: '🛡️' },
  { name: 'Back', label: 'Back', icon: '🦅' },
  { name: 'Legs', label: 'Legs', icon: '🦵' },
  { name: 'Core', label: 'Core', icon: '🎯' },
  { name: 'Arms', label: 'Arms', icon: '💪' },
  { name: 'Shoulders', label: 'Shoulders', icon: '👑' },
];

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  weeklyPlan,
  todayPlan,
  onOpenWeeklySetup,
  onOpenThemeSelector,
  onStartWorkout,
  onSelectExercise,
  onOpenInstallModal,
  onOpenSpecs,
}) => {
  const { theme, setupColor, menuHighlightColor, burnedColor } = useTheme();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const filteredExercises = selectedMuscle === 'All'
    ? EXERCISE_DATABASE.slice(0, 4)
    : EXERCISE_DATABASE.filter(ex => ex.muscleGroup === selectedMuscle);

  // Find workout option details or custom exercises matching today's plan
  const matchedPreset = PRELOADED_WORKOUT_OPTIONS.find(
    opt => opt.id === todayPlan.presetWorkoutId || opt.title === todayPlan.workoutTitle
  ) || PRELOADED_WORKOUT_OPTIONS[0];

  let resolvedExercises: Exercise[] = [];
  if (todayPlan.customExercises && todayPlan.customExercises.length > 0) {
    resolvedExercises = todayPlan.customExercises;
  } else if (todayPlan.exerciseIds && todayPlan.exerciseIds.length > 0) {
    resolvedExercises = EXERCISE_DATABASE.filter(e => todayPlan.exerciseIds!.includes(e.id));
  } else if (matchedPreset.exerciseIds.length > 0) {
    resolvedExercises = EXERCISE_DATABASE.filter(e => matchedPreset.exerciseIds.includes(e.id));
  } else {
    resolvedExercises = EXERCISE_DATABASE.slice(0, 4);
  }

  const currentWorkoutSession: WorkoutSession = {
    id: `workout-${todayPlan.day.toLowerCase()}`,
    title: todayPlan.workoutTitle,
    focus: todayPlan.focus,
    estimatedMinutes: todayPlan.estimatedMinutes,
    difficulty: matchedPreset.difficulty,
    calories: matchedPreset.calories,
    bannerImage: matchedPreset.bannerImage,
    exercises: resolvedExercises,
  };

  return (
    <div className="min-h-screen pb-28 pt-3 px-4 max-w-md mx-auto text-white">
      
      {/* 1. TOP BAR */}
      {/* Profile on left, week streaks in middle, Theme & Notification controls on right */}
      <header className="flex items-center justify-between py-2 mb-5">
        {/* Left: Profile Image only (no text/badges) */}
        <div className="flex items-center">
          <div className="relative cursor-pointer group">
            <div 
              className="w-11 h-11 rounded-full p-[2px] shadow-md transition-all"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
                boxShadow: `0 4px 14px ${theme.primary}30`
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Alex profile"
                className="w-full h-full object-cover rounded-full bg-[#181B26]"
              />
            </div>
            <span 
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#0A0B0F]" 
              style={{ backgroundColor: theme.primary }}
            />
          </div>
        </div>

        {/* Middle: Streak Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151722] border border-[#2B3144] shadow-inner">
          <Flame className="w-4 h-4" style={{ color: theme.secondary }} />
          <span className="font-extrabold text-xs tracking-wider text-white">
            {stats.streakDays} Days
          </span>
          <span className="text-[10px] font-mono font-bold" style={{ color: theme.primary }}>STREAK</span>
        </div>

        {/* Right: Theme Palette Switcher & Notification Bell */}
        <div className="flex items-center gap-2">
          {/* Palette Color Switch Button */}
          <button
            id="theme-switcher-btn"
            onClick={onOpenThemeSelector}
            className="w-10 h-10 rounded-full bg-[#151722] border border-[#2B3144] flex items-center justify-center text-[#8E95A5] hover:text-white transition-colors"
            title="Change Design Color System"
          >
            <Palette className="w-4 h-4" style={{ color: theme.primary }} />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadCount(0);
              }}
              className="w-10 h-10 rounded-full bg-[#151722] border border-[#2B3144] flex items-center justify-center text-[#8E95A5] hover:text-white transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5500] animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5500]" />
              )}
            </button>

            {/* Dropdown Drawer for notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#141620] border border-[#262C3D] p-3 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#212636] mb-2 font-bold text-white">
                  <span>Alerts & Reminders</span>
                  <span className="text-[10px] font-bold" style={{ color: theme.primary }}>Mark all read</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-[#0D0F16] border border-[#1E2333]">
                    <div className="font-semibold" style={{ color: theme.primary }}>🔥 {stats.streakDays}-Day Streak Active!</div>
                    <div className="text-[#8E95A5] text-[11px] mt-0.5">Complete today's {todayPlan.focus} session to keep your streak burning.</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0D0F16] border border-[#1E2333]">
                    <div className="font-semibold text-white">📅 Weekly Schedule Updated</div>
                    <div className="text-[#8E95A5] text-[11px] mt-0.5">Custom weekly splits are synced for all 7 weekdays.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. DAILY GREETING & STATUS */}
      {/* Clean Greeting with Today's Focus along with Set Up button */}
      <section className="mb-5 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase font-sans">
          Welcome back, <span className="text-white">Alex</span>
        </h1>

        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#131622] border border-[#23293D] shadow-md">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span 
              className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0" 
              style={{ backgroundColor: setupColor }}
            />
            <div className="truncate">
              <div className="text-[10px] uppercase font-bold text-[#8E95A5] tracking-wider">
                Today’s Focus ({todayPlan.day.slice(0, 3)})
              </div>
              <p className="text-xs font-bold text-white truncate">
                {todayPlan.focus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="open-weekly-setup-btn"
              onClick={() => {
                haptics.trigger('medium');
                onOpenWeeklySetup();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md"
              style={{
                backgroundColor: setupColor,
                color: '#0A0B0F',
                boxShadow: `0 4px 14px ${setupColor}35`
              }}
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Set Up</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. TODAY'S WORKOUT BANNER */}
      <section className="mb-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#262D3F] shadow-2xl bg-[#12141D] group">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentWorkoutSession.bannerImage}
              alt="Intense workout banner"
              className="w-full h-full object-cover object-center brightness-75 contrast-125 group-hover:scale-105 transition-transform duration-700"
            />
            {/* Dark moody overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0F] via-[#0A0B0F]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B0F]/90 via-transparent to-[#0A0B0F]/40" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 p-5 flex flex-col justify-between min-h-[260px]">
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-2">
              <span 
                className="px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-widest shadow-md"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryContrast,
                  boxShadow: `0 4px 14px ${theme.primary}40`
                }}
              >
                {todayPlan.isRestDay ? "TODAY'S RECOVERY" : "TODAY'S BLAST"}
              </span>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" style={{ color: theme.primary }} /> {currentWorkoutSession.estimatedMinutes} Mins
                </span>
                <span 
                  className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[11px] font-bold"
                  style={{ color: theme.secondary }}
                >
                  {currentWorkoutSession.difficulty}
                </span>
              </div>
            </div>

            {/* Bottom Title & Action Button */}
            <div className="space-y-3 pt-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-tight font-sans drop-shadow-md">
                  {currentWorkoutSession.title}
                </h2>
                <p className="text-xs text-[#CBD3E3] font-medium mt-1">
                  {todayPlan.focus} • {currentWorkoutSession.exercises.length} key targeted movements.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  id="start-workout-main-btn"
                  onClick={() => {
                    haptics.trigger('heavy');
                    onStartWorkout(currentWorkoutSession);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.primaryContrast,
                    boxShadow: `0 8px 24px -4px ${theme.primary}40`
                  }}
                >
                  <Play className="w-4 h-4 fill-current stroke-none" />
                  <span>{todayPlan.isRestDay ? 'Start Recovery' : 'Start Workout'}</span>
                </button>
                
                <button
                  onClick={() => {
                    haptics.trigger('light');
                    onOpenWeeklySetup();
                  }}
                  className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-[#8E95A5] hover:text-white transition"
                  title="Edit Week Schedule"
                >
                  <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUICK CATEGORIES / MUSCLE GROUPS */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Target Muscle Groups
          </h3>
          <span className="text-[11px] font-mono font-bold" style={{ color: theme.primary }}>
            {selectedMuscle} Focus
          </span>
        </div>

        {/* Scrollable Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {MUSCLE_PILLS.map((pill) => {
            const isSelected = selectedMuscle === pill.name;
            return (
              <button
                key={pill.name}
                onClick={() => setSelectedMuscle(pill.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'shadow-lg scale-105 font-black'
                    : 'bg-[#12151F] border border-[#222738] text-[#8E95A5] hover:text-white hover:border-[#2F364C]'
                }`}
                style={isSelected ? {
                  backgroundColor: theme.primary,
                  color: theme.primaryContrast,
                  boxShadow: `0 4px 14px ${theme.primary}35`
                } : undefined}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick Exercise Library Hits for Target Muscle */}
      <section className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold uppercase tracking-wider text-[#8E95A5]">
            Featured {selectedMuscle !== 'All' ? selectedMuscle : 'Power'} Lifts
          </span>
          <span className="text-[10px] font-mono" style={{ color: theme.primary }}>Tap for form tips</span>
        </div>

        <div className="grid gap-2.5">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => onSelectExercise(exercise)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#12141D] border border-[#202534] transition-all cursor-pointer group hover:border-[#353F57]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="w-12 h-12 rounded-xl object-cover bg-[#1B1F2C] border border-[#262C3C] group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 
                    className="text-sm font-bold text-white transition-colors leading-snug"
                  >
                    {exercise.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8E95A5]">
                    <span className="font-mono font-semibold" style={{ color: theme.primary }}>
                      {exercise.defaultSets} sets × {exercise.defaultReps}
                    </span>
                    <span>•</span>
                    <span>{exercise.equipment}</span>
                  </div>
                </div>
              </div>

              <div 
                className="w-8 h-8 rounded-full bg-[#181C28] flex items-center justify-center text-[#8E95A5] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Mobile App Install Bar */}
      <section className="p-3.5 rounded-2xl bg-gradient-to-r from-[#141824] to-[#12141D] border border-[#252B3B] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
            style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
          >
            ⚡
          </div>
          <div>
            <div className="text-xs font-bold text-white">Install as Mobile App</div>
            <div className="text-[10px] text-[#8E95A5]">Add to iOS / Android home screen</div>
          </div>
        </div>
        <button
          onClick={onOpenInstallModal}
          className="px-3 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition shadow-md"
          style={{
            backgroundColor: theme.primary,
            color: theme.primaryContrast,
            boxShadow: `0 4px 10px ${theme.primary}25`
          }}
        >
          Install
        </button>
      </section>

    </div>
  );
};
