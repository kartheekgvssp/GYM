import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Flame, 
  Check, 
  Plus, 
  Minus, 
  RotateCcw, 
  Award, 
  ChevronRight, 
  Play, 
  Pause,
  AlertCircle,
  X
} from 'lucide-react';
import { WorkoutSession, Exercise } from '../types';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';

interface ActiveWorkoutScreenProps {
  workout: WorkoutSession;
  onClose: () => void;
}

interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  workout,
  onClose,
}) => {
  const { theme, burnedColor } = useTheme();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const currentExercise = workout.exercises[currentExerciseIndex] || workout.exercises[0];

  // Set records for the current exercise
  const [sets, setSets] = useState<SetLog[]>([
    { setNumber: 1, weight: 30, reps: 10, completed: true },
    { setNumber: 2, weight: 32.5, reps: 10, completed: false },
    { setNumber: 3, weight: 35, reps: 8, completed: false },
    { setNumber: 4, weight: 35, reps: 8, completed: false },
  ]);

  // Active workout timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest countdown timer
  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) return;
    const timer = setInterval(() => {
      setRestSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [restSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const toggleSetComplete = (index: number) => {
    setSets((prev) =>
      prev.map((s, idx) => {
        if (idx === index) {
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            // Tactile success response for finishing a set
            haptics.trigger('success');
            // Trigger 90 second rest timer
            setRestSeconds(90);
          } else {
            haptics.trigger('light');
          }
          return { ...s, completed: nextCompleted };
        }
        return s;
      })
    );
  };

  const updateSetWeight = (index: number, delta: number) => {
    haptics.trigger('selection');
    setSets((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, weight: Math.max(0, s.weight + delta) } : s))
    );
  };

  const updateSetReps = (index: number, delta: number) => {
    haptics.trigger('selection');
    setSets((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, reps: Math.max(1, s.reps + delta) } : s))
    );
  };

  const addSet = () => {
    haptics.trigger('medium');
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        weight: lastSet ? lastSet.weight : 30,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0F] text-white flex flex-col max-w-md mx-auto overflow-y-auto animate-in fade-in duration-200">
      
      {/* 1. ACTIVE WORKOUT TOP BAR */}
      <header className="sticky top-0 z-30 bg-[#0A0B0F]/95 backdrop-blur-md border-b border-[#1E2332] px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#151824] text-[#8E95A5] hover:text-white transition"
          aria-label="Exit Workout"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-[10px] uppercase font-bold tracking-widest font-mono" style={{ color: theme.primary }}>
            Active Session
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-tight">
            {workout.title}
          </h2>
        </div>

        {/* Live workout duration clock */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151824] border border-[#262D3E]">
          <Clock className="w-3.5 h-3.5" style={{ color: theme.primary }} />
          <span className="font-mono text-xs font-bold text-white">
            {formatTime(secondsElapsed)}
          </span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-[#8E95A5] hover:text-white ml-1"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 pb-32">
        
        {/* Exercise Progress Header & Navigation */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold" style={{ color: theme.primary }}>
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </span>
          <div className="flex items-center gap-1">
            {workout.exercises.map((_, i) => (
              <span
                key={i}
                className="w-4 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === currentExerciseIndex ? theme.primary : i < currentExerciseIndex ? theme.secondary : '#222738',
                  width: i === currentExerciseIndex ? '24px' : '16px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Current Exercise Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#12141D] border border-[#222738] p-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <img
              src={currentExercise.image}
              alt={currentExercise.name}
              className="w-20 h-20 rounded-2xl object-cover border border-[#2B3144] bg-[#1A1E2B]"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest font-mono" style={{ color: theme.primary }}>
                {currentExercise.muscleGroup} Focus
              </span>
              <h3 className="text-lg font-black text-white leading-snug">
                {currentExercise.name}
              </h3>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                {currentExercise.equipment}
              </p>
            </div>
          </div>

          {/* Form Cue Pill */}
          <div className="mt-3 p-2.5 rounded-2xl bg-[#0B0D13] border border-[#1E2333] flex items-center gap-2 text-xs text-[#CBD3E3]">
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
            <span className="text-[11px] italic truncate">{currentExercise.tips[0]}</span>
          </div>
        </div>

        {/* REST TIMER HUD (Floating when active) */}
        {restSeconds !== null && restSeconds > 0 && (
          <div 
            className="p-3.5 rounded-2xl bg-[#161A26] border-2 flex items-center justify-between shadow-2xl"
            style={{ borderColor: theme.primary }}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black"
                style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono font-bold" style={{ color: theme.primary }}>
                  Rest Interval
                </div>
                <div className="text-lg font-mono font-black text-white">
                  {restSeconds}s Remaining
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRestSeconds((prev) => (prev ? prev + 15 : 15))}
                className="px-2 py-1 rounded-lg bg-[#222838] text-[11px] font-mono font-bold text-[#CBD3E3] hover:text-white"
              >
                +15s
              </button>
              <button
                onClick={() => setRestSeconds(null)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase"
                style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* SET LOGGING TABLE */}
        <div className="rounded-3xl bg-[#12141D] border border-[#222738] p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2333] text-[11px] font-extrabold uppercase tracking-wider text-[#8E95A5]">
            <span className="w-8 text-center">Set</span>
            <span className="flex-1 text-center">Weight (kg)</span>
            <span className="flex-1 text-center">Reps</span>
            <span className="w-12 text-center">Done</span>
          </div>

          <div className="divide-y divide-[#1C2130]">
            {sets.map((set, idx) => (
              <div
                key={idx}
                className={`py-3 flex items-center justify-between transition-colors ${
                  set.completed ? 'opacity-80' : ''
                }`}
                style={set.completed ? { backgroundColor: `${theme.primary}0D` } : undefined}
              >
                {/* Set Index */}
                <div className="w-8 text-center font-mono font-bold text-xs text-white">
                  #{set.setNumber}
                </div>

                {/* Weight Stepper */}
                <div className="flex-1 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => updateSetWeight(idx, -2.5)}
                    className="w-6 h-6 rounded-lg bg-[#1B2030] text-[#CBD3E3] hover:text-white flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center font-mono font-extrabold text-sm text-white">
                    {set.weight}
                  </span>
                  <button
                    onClick={() => updateSetWeight(idx, 2.5)}
                    className="w-6 h-6 rounded-lg bg-[#1B2030] text-[#CBD3E3] hover:text-white flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Reps Stepper */}
                <div className="flex-1 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => updateSetReps(idx, -1)}
                    className="w-6 h-6 rounded-lg bg-[#1B2030] text-[#CBD3E3] hover:text-white flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-mono font-extrabold text-sm text-white">
                    {set.reps}
                  </span>
                  <button
                    onClick={() => updateSetReps(idx, 1)}
                    className="w-6 h-6 rounded-lg bg-[#1B2030] text-[#CBD3E3] hover:text-white flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Complete Checkbox */}
                <div className="w-12 flex justify-center">
                  <button
                    onClick={() => toggleSetComplete(idx)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={set.completed ? {
                      backgroundColor: theme.primary,
                      color: theme.primaryContrast,
                      boxShadow: `0 4px 12px ${theme.primary}30`
                    } : {
                      backgroundColor: '#1A1F2D',
                      border: '1px solid #2B3144',
                      color: 'transparent'
                    }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" style={{ color: set.completed ? theme.primaryContrast : 'transparent' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Set Button */}
          <button
            onClick={addSet}
            className="w-full mt-3 py-2.5 rounded-2xl bg-[#171B26] border border-[#262D3E] text-xs font-bold hover:bg-[#1E2333] transition flex items-center justify-center gap-1.5"
            style={{ color: theme.primary }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Additional Set</span>
          </button>
        </div>

        {/* Exercise Navigation Footer */}
        <div className="flex items-center gap-3 pt-2">
          {currentExerciseIndex > 0 && (
            <button
              onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
              className="py-3 px-4 rounded-2xl bg-[#151824] border border-[#222738] text-xs font-bold text-white hover:bg-[#1E2333]"
            >
              Previous
            </button>
          )}

          {currentExerciseIndex < workout.exercises.length - 1 ? (
            <button
              onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
              className="flex-1 py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg"
              style={{
                backgroundColor: theme.primary,
                color: theme.primaryContrast,
                boxShadow: `0 4px 14px ${theme.primary}25`
              }}
            >
              <span>Next Exercise</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                haptics.workoutComplete();
                setShowFinishModal(true);
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg"
              style={{
                backgroundColor: theme.primary,
                color: theme.primaryContrast,
                boxShadow: `0 4px 14px ${theme.primary}25`
              }}
            >
              <Award className="w-4 h-4" />
              <span>Complete Workout</span>
            </button>
          )}
        </div>

      </div>

      {/* FINISH WORKOUT SUMMARY MODAL */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#141620] border border-[#2B3144] p-6 text-center space-y-4 shadow-2xl">
            <div 
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-xl"
              style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
            >
              <Award className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs uppercase font-mono font-bold" style={{ color: theme.primary }}>
                Workout Conquered
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                Session Complete!
              </h3>
              <p className="text-xs text-[#8E95A5] mt-1">
                Upper body hypertrophy volume logged to your personal cloud profile.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#202534] text-center">
              <div className="p-2 rounded-xl bg-[#0B0D13]">
                <div className="text-sm font-black text-white">{formatTime(secondsElapsed)}</div>
                <div className="text-[9px] uppercase font-mono text-[#8E95A5]">Duration</div>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0D13]">
                <div className="text-sm font-black" style={{ color: burnedColor }}>480 kcal</div>
                <div className="text-[9px] uppercase font-mono text-[#8E95A5]">Burned</div>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0D13]">
                <div className="text-sm font-black" style={{ color: theme.primary }}>3,840 kg</div>
                <div className="text-[9px] uppercase font-mono text-[#8E95A5]">Volume</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
              style={{
                backgroundColor: theme.primary,
                color: theme.primaryContrast,
                boxShadow: `0 4px 14px ${theme.primary}25`
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
