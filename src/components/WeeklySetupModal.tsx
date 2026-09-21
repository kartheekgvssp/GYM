import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Dumbbell, 
  Sparkles, 
  Clock, 
  Flame, 
  Plus, 
  Check, 
  Edit3, 
  Coffee, 
  Zap, 
  Sliders, 
  Search, 
  RotateCcw
} from 'lucide-react';
import { DayWorkoutPlan, Weekday, MuscleGroup, Exercise } from '../types';
import { PRELOADED_WORKOUT_OPTIONS, EXERCISE_DATABASE } from '../data/mockData';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';

interface WeeklySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyPlan: DayWorkoutPlan[];
  onSavePlan: (updatedPlan: DayWorkoutPlan[]) => void;
  initialSelectedDay?: Weekday;
}

type TabMode = 'custom' | 'presets';

const MUSCLE_OPTIONS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'All'];
const DURATION_PRESETS = [20, 30, 45, 60, 75, 90];

export const WeeklySetupModal: React.FC<WeeklySetupModalProps> = ({
  isOpen,
  onClose,
  weeklyPlan,
  onSavePlan,
  initialSelectedDay = 'Monday',
}) => {
  const { theme, setupColor } = useTheme();
  const [selectedDay, setSelectedDay] = useState<Weekday>(initialSelectedDay);
  const [currentPlan, setCurrentPlan] = useState<DayWorkoutPlan[]>(weeklyPlan);
  const [activeTab, setActiveTab] = useState<TabMode>('custom');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justSavedDay, setJustSavedDay] = useState<string | null>(null);

  // Custom Workout Form State for the selected day
  const currentDayPlan = currentPlan.find((d) => d.day === selectedDay) || currentPlan[0];

  const [customTitle, setCustomTitle] = useState(currentDayPlan.workoutTitle);
  const [customFocus, setCustomFocus] = useState(currentDayPlan.focus);
  const [customDuration, setCustomDuration] = useState(currentDayPlan.estimatedMinutes || 45);
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>(currentDayPlan.targetMuscle || 'All');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(() => {
    if (currentDayPlan.exerciseIds && currentDayPlan.exerciseIds.length > 0) {
      return currentDayPlan.exerciseIds;
    }
    const preset = PRELOADED_WORKOUT_OPTIONS.find(p => p.id === currentDayPlan.presetWorkoutId);
    return preset ? preset.exerciseIds : ['ex-1', 'ex-2'];
  });
  const [exerciseSearch, setExerciseSearch] = useState('');

  // Re-sync with weeklyPlan when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(weeklyPlan);
      const targetDay = initialSelectedDay || selectedDay;
      const dayPlan = weeklyPlan.find((d) => d.day === targetDay) || weeklyPlan[0];
      setSelectedDay(dayPlan.day);
      setCustomTitle(dayPlan.workoutTitle);
      setCustomFocus(dayPlan.focus);
      setCustomDuration(dayPlan.estimatedMinutes || 45);
      setCustomMuscle(dayPlan.targetMuscle || 'All');
      if (dayPlan.exerciseIds && dayPlan.exerciseIds.length > 0) {
        setSelectedExerciseIds(dayPlan.exerciseIds);
      } else {
        const preset = PRELOADED_WORKOUT_OPTIONS.find(p => p.id === dayPlan.presetWorkoutId);
        setSelectedExerciseIds(preset ? preset.exerciseIds : ['ex-1', 'ex-2']);
      }
    }
  }, [isOpen, weeklyPlan]);

  // Synchronize custom inputs when switching days
  const handleSelectDay = (day: Weekday) => {
    haptics.trigger('selection');
    setSelectedDay(day);
    const dayPlan = currentPlan.find((d) => d.day === day) || currentPlan[0];
    setCustomTitle(dayPlan.workoutTitle);
    setCustomFocus(dayPlan.focus);
    setCustomDuration(dayPlan.estimatedMinutes || 45);
    setCustomMuscle(dayPlan.targetMuscle || 'All');
    
    if (dayPlan.exerciseIds && dayPlan.exerciseIds.length > 0) {
      setSelectedExerciseIds(dayPlan.exerciseIds);
    } else {
      const preset = PRELOADED_WORKOUT_OPTIONS.find(p => p.id === dayPlan.presetWorkoutId);
      setSelectedExerciseIds(preset ? preset.exerciseIds : ['ex-1', 'ex-2']);
    }
  };

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Toggle Exercise in Custom Builder
  const handleToggleExercise = (exId: string) => {
    haptics.trigger('light');
    setSelectedExerciseIds((prev) => 
      prev.includes(exId) ? prev.filter(id => id !== exId) : [...prev, exId]
    );
  };

  // Save Custom Workout to Current Day
  const handleApplyCustomWorkout = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = customTitle.trim() || `${customMuscle} Routine`;
    const finalFocus = customFocus.trim() || `${customMuscle} targeted strength & hypertrophy`;
    
    const chosenExercises = EXERCISE_DATABASE.filter(ex => selectedExerciseIds.includes(ex.id));

    const updated = currentPlan.map((d) => {
      if (d.day === selectedDay) {
        return {
          ...d,
          workoutTitle: finalTitle,
          focus: finalFocus,
          isRestDay: false,
          estimatedMinutes: customDuration,
          exercisesCount: selectedExerciseIds.length,
          targetMuscle: customMuscle,
          presetWorkoutId: undefined,
          exerciseIds: selectedExerciseIds,
          customExercises: chosenExercises,
          isCustom: true,
        };
      }
      return d;
    });

    setCurrentPlan(updated);
    // Crucial: Persist immediately to global state and storage
    onSavePlan(updated);
    setJustSavedDay(selectedDay);
    setTimeout(() => setJustSavedDay(null), 3000);
    haptics.trigger('success');
    showToast(`✓ Saved custom workout for ${selectedDay}!`);
  };

  // Select a Preloaded Workout Preset
  const handleSelectWorkoutPreset = (preset: typeof PRELOADED_WORKOUT_OPTIONS[0]) => {
    haptics.trigger('medium');
    const isRest = preset.id === 'opt-rest';
    const updated = currentPlan.map((d) => {
      if (d.day === selectedDay) {
        return {
          ...d,
          focus: preset.focus,
          workoutTitle: preset.title,
          isRestDay: isRest,
          estimatedMinutes: preset.estimatedMinutes,
          exercisesCount: preset.exerciseIds.length,
          targetMuscle: preset.targetMuscle,
          presetWorkoutId: preset.id,
          exerciseIds: preset.exerciseIds,
          isCustom: false,
        };
      }
      return d;
    });

    setCurrentPlan(updated);
    onSavePlan(updated);
    // Also update form inputs for smooth editing if user wants to tweak it
    setCustomTitle(preset.title);
    setCustomFocus(preset.focus);
    setCustomDuration(preset.estimatedMinutes);
    setCustomMuscle(preset.targetMuscle);
    setSelectedExerciseIds(preset.exerciseIds);
    showToast(`Assigned ${preset.title} to ${selectedDay}!`);
  };

  // Toggle Rest Day
  const handleToggleRestDay = () => {
    haptics.trigger('warning');
    const willBeRest = !currentDayPlan.isRestDay;
    const updated = currentPlan.map((d) => {
      if (d.day === selectedDay) {
        return {
          ...d,
          isRestDay: willBeRest,
          focus: willBeRest ? 'Rest & Muscle Recovery' : customFocus || 'Full Body Conditioning',
          workoutTitle: willBeRest ? 'Active Recovery & Stretching' : customTitle || 'Full Body Conditioning & Power',
          estimatedMinutes: willBeRest ? 15 : customDuration || 45,
          exercisesCount: willBeRest ? 0 : selectedExerciseIds.length || 4,
          presetWorkoutId: willBeRest ? 'opt-rest' : undefined,
          isCustom: !willBeRest,
        };
      }
      return d;
    });
    setCurrentPlan(updated);
    onSavePlan(updated);
    showToast(willBeRest ? `${selectedDay} set to Rest Day` : `${selectedDay} set to Workout Day`);
  };

  // Save all and exit
  const handleSaveAndApply = () => {
    haptics.trigger('success');
    let finalPlan = currentPlan;
    if (activeTab === 'custom') {
      const finalTitle = customTitle.trim() || `${customMuscle} Routine`;
      const finalFocus = customFocus.trim() || `${customMuscle} targeted strength & hypertrophy`;
      const chosenExercises = EXERCISE_DATABASE.filter(ex => selectedExerciseIds.includes(ex.id));

      finalPlan = currentPlan.map((d) => {
        if (d.day === selectedDay) {
          return {
            ...d,
            workoutTitle: finalTitle,
            focus: finalFocus,
            isRestDay: false,
            estimatedMinutes: customDuration,
            exercisesCount: selectedExerciseIds.length,
            targetMuscle: customMuscle,
            presetWorkoutId: undefined,
            exerciseIds: selectedExerciseIds,
            customExercises: chosenExercises,
            isCustom: true,
          };
        }
        return d;
      });
    }
    onSavePlan(finalPlan);
    onClose();
  };

  // Filtered exercises for picker
  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || 
      ex.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="weekly-setup-modal-container"
        className="w-full max-w-lg bg-[#0F1118] border border-[#252B3E] rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white"
        style={{
          boxShadow: `0 20px 60px -15px ${theme.primary}25`
        }}
      >
        {/* Top Drag Handle */}
        <div className="w-12 h-1.5 bg-[#252B3C] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-[#1E2333]">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-colors"
              style={{ backgroundColor: `${setupColor}25`, color: setupColor, borderColor: `${setupColor}50`, borderWidth: 1 }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wide text-white">
                Weekly Workout Schedule
              </h2>
              <p className="text-[11px] text-[#8E95A5]">
                Plan daily splits, customize exercises, or toggle rest
              </p>
            </div>
          </div>
          <button
            id="close-weekly-setup-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181C28] border border-[#2B3144] flex items-center justify-center text-[#8E95A5] hover:text-white transition-colors"
            aria-label="Close setup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Selector Strip (Redesigned with balanced shape) */}
        <div className="px-3 py-2.5 bg-[#131622] border-b border-[#1C2030]">
          <div className="grid grid-cols-7 gap-1.5">
            {currentPlan.map((d) => {
              const isSelected = d.day === selectedDay;
              return (
                <button
                  key={d.day}
                  id={`day-select-${d.day.toLowerCase()}`}
                  onClick={() => handleSelectDay(d.day)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all text-center ${
                    isSelected
                      ? 'scale-[1.03] shadow-md font-black'
                      : d.isRestDay
                      ? 'bg-[#161822] text-[#697385] border-[#202534] hover:border-[#353E54]'
                      : 'bg-[#161925] text-[#CBD3E3] border-[#252C3E] hover:border-[#3D4763]'
                  }`}
                  style={isSelected ? {
                    backgroundColor: setupColor,
                    color: '#0A0B0F',
                    borderColor: setupColor,
                    boxShadow: `0 4px 14px ${setupColor}40`
                  } : undefined}
                >
                  <span className={`text-[10px] font-bold ${isSelected ? 'opacity-90 text-black' : 'text-[#7D879B]'}`}>
                    {d.dayShort}
                  </span>
                  <span className={`text-xs font-black mt-0.5 ${isSelected ? 'text-black' : ''}`}>
                    {d.day.slice(0, 3)}
                  </span>
                  
                  {/* Status Indicator Dot/Badge */}
                  <span className="mt-1 flex items-center justify-center">
                    {d.isRestDay ? (
                      <span className={`text-[8px] font-mono px-1 rounded ${isSelected ? 'bg-black/20 text-black' : 'text-[#FF7A00]'}`}>
                        REST
                      </span>
                    ) : (
                      <span 
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : ''}`}
                        style={!isSelected ? { backgroundColor: setupColor } : undefined}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
          
          {/* Active Day Banner & Rest Toggle */}
          <div className="rounded-2xl bg-gradient-to-br from-[#171B2A] to-[#11131E] border border-[#272F44] p-3.5 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] font-mono uppercase tracking-widest font-black px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                  >
                    {selectedDay} Split
                  </span>
                  {currentDayPlan.isCustom && (
                    <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-md font-bold">
                      Custom Routine
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white mt-1 leading-snug">
                  {currentDayPlan.workoutTitle}
                </h3>
                <p className="text-[11px] text-[#8E95A5] mt-0.5">
                  {currentDayPlan.focus}
                </p>
              </div>

              {/* Toggle Rest Day Action */}
              <button
                id="toggle-rest-day-btn"
                onClick={handleToggleRestDay}
                className={`px-3 py-2 rounded-xl border text-[11px] font-extrabold uppercase tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
                  currentDayPlan.isRestDay
                    ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/40 hover:bg-[#FF5500]/25'
                    : 'bg-[#1D2232] text-[#CBD3E3] border-[#2C354C] hover:border-[#4B5678]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{currentDayPlan.isRestDay ? 'Rest Active' : 'Make Rest'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[#20273B] text-[11px] text-[#A6B0C3]">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                {currentDayPlan.estimatedMinutes} Mins
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Dumbbell className="w-3.5 h-3.5 text-[#00E5FF]" />
                {currentDayPlan.isRestDay ? 'Active Recovery' : `${currentDayPlan.exercisesCount} Movements`}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#1F2538] text-[10px] font-mono font-bold" style={{ color: theme.primary }}>
                {currentDayPlan.targetMuscle}
              </span>
            </div>

            {/* Toast Feedback Animation */}
            {toastMessage && (
              <div 
                className="absolute top-2 right-2 px-3 py-1.5 rounded-xl text-black font-extrabold text-[11px] flex items-center gap-1.5 shadow-lg animate-in fade-in zoom-in-95 z-20"
                style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> {toastMessage}
              </div>
            )}
          </div>

          {/* Mode Switcher: "Add Own Workout" (Custom) vs "Curated Presets" */}
          <div className="p-1 rounded-2xl bg-[#131622] border border-[#22283A] flex gap-1">
            <button
              id="tab-mode-custom"
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'custom'
                  ? 'shadow-md'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
              style={activeTab === 'custom' ? {
                backgroundColor: theme.primary,
                color: theme.primaryContrast,
              } : undefined}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Add / Edit Own Workout</span>
            </button>

            <button
              id="tab-mode-presets"
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'presets'
                  ? 'shadow-md'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
              style={activeTab === 'presets' ? {
                backgroundColor: theme.primary,
                color: theme.primaryContrast,
              } : undefined}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Presets</span>
            </button>
          </div>

          {/* TAB 1: ADD OWN WORKOUT FORM */}
          {activeTab === 'custom' && (
            <div className="space-y-3.5 bg-[#12141F] border border-[#232A3D] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4" style={{ color: theme.primary }} />
                  Custom Routine for {selectedDay}
                </span>
                <span className="text-[10px] text-[#717A8C]">Build exactly what you train</span>
              </div>

              {/* Workout Title Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#A6B0C3] uppercase tracking-wider block">
                  Workout Name
                </label>
                <input
                  id="custom-workout-title-input"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Chest & Triceps Blast, Heavy Pull Day..."
                  className="w-full bg-[#181C2A] border border-[#2B344B] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#5C667B] focus:outline-none transition-colors"
                  style={{ borderColor: customTitle ? theme.primary : undefined }}
                />
              </div>

              {/* Target / Focus Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#A6B0C3] uppercase tracking-wider block">
                  Focus / Target Note
                </label>
                <input
                  id="custom-workout-focus-input"
                  type="text"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  placeholder="e.g. Heavy compound sets with 3-minute rests"
                  className="w-full bg-[#181C2A] border border-[#2B344B] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#5C667B] focus:outline-none transition-colors"
                />
              </div>

              {/* Muscle Group Chip Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#A6B0C3] uppercase tracking-wider block">
                  Primary Target Muscle
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MUSCLE_OPTIONS.map((m) => {
                    const isSelected = customMuscle === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMuscle(m)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'text-black font-black shadow-sm'
                            : 'bg-[#181B28] text-[#8E95A5] border-[#282F43] hover:text-white'
                        }`}
                        style={isSelected ? {
                          backgroundColor: theme.primary,
                          color: theme.primaryContrast,
                          borderColor: theme.primary,
                        } : undefined}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Duration Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#A6B0C3] uppercase tracking-wider block">
                  Target Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  {DURATION_PRESETS.map((dur) => {
                    const isSelected = customDuration === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setCustomDuration(dur)}
                        className={`flex-1 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'text-black font-black'
                            : 'bg-[#181B28] text-[#8E95A5] border-[#282F43] hover:text-white'
                        }`}
                        style={isSelected ? {
                          backgroundColor: theme.primary,
                          color: theme.primaryContrast,
                          borderColor: theme.primary,
                        } : undefined}
                      >
                        {dur}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exercise Selector with Search & Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#202638]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#A6B0C3] uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                    Select Exercises ({selectedExerciseIds.length} chosen)
                  </label>
                  <span className="text-[10px] text-[#717A8C]">Tap to toggle in workout</span>
                </div>

                {/* Quick Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6D778B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    placeholder="Filter movements (e.g. Bench, Squat, Cable)..."
                    className="w-full bg-[#181C2A] border border-[#2B344B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#5C667B] focus:outline-none"
                  />
                </div>

                {/* Exercise List */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredExercises.map((ex) => {
                    const isSelected = selectedExerciseIds.includes(ex.id);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        id={`exercise-check-${ex.id}`}
                        onClick={() => handleToggleExercise(ex.id)}
                        className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 text-left ${
                          isSelected
                            ? 'bg-[#181D2C] border-[#3B4764]'
                            : 'bg-[#141724] border-[#222738] hover:border-[#333A4E]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ex.image}
                            alt={ex.name}
                            className="w-9 h-9 rounded-lg object-cover bg-black/40 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-xs leading-snug">
                              {ex.name}
                            </div>
                            <div className="text-[10px] text-[#8E95A5] flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-[#1F2538] text-[9px] font-mono" style={{ color: theme.primary }}>
                                {ex.muscleGroup}
                              </span>
                              <span>•</span>
                              <span>{ex.defaultSets} sets × {ex.defaultReps} reps</span>
                            </div>
                          </div>
                        </div>

                        {/* Checkbox indicator */}
                        <div 
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'shadow-md' 
                              : 'bg-[#1A1F2E] border border-[#2E364A] text-transparent'
                          }`}
                          style={isSelected ? {
                            backgroundColor: theme.primary,
                            color: theme.primaryContrast,
                          } : undefined}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Apply Custom Workout Button */}
              <button
                id="apply-custom-workout-btn"
                type="button"
                onClick={handleApplyCustomWorkout}
                className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all mt-3 cursor-pointer"
                style={{
                  backgroundColor: justSavedDay === selectedDay ? '#00E5FF' : setupColor,
                  color: '#0A0B0F',
                  boxShadow: `0 8px 22px -4px ${setupColor}50`
                }}
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {justSavedDay === selectedDay 
                    ? `✓ Saved & Applied for ${selectedDay}!` 
                    : `Save Custom Workout for ${selectedDay}`}
                </span>
              </button>
            </div>
          )}

          {/* TAB 2: PRELOADED SPLITS LIST */}
          {activeTab === 'presets' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase font-extrabold tracking-wider text-[#CBD3E3] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} /> Preloaded Athlete Presets
                </span>
                <span className="text-[10px] text-[#788296]">Tap any preset to assign</span>
              </div>

              {PRELOADED_WORKOUT_OPTIONS.map((opt) => {
                const isCurrentOption = (!currentDayPlan.isCustom && currentDayPlan.presetWorkoutId === opt.id) || 
                  (!currentDayPlan.isCustom && currentDayPlan.workoutTitle === opt.title);

                return (
                  <button
                    key={opt.id}
                    id={`workout-preset-${opt.id}`}
                    onClick={() => handleSelectWorkoutPreset(opt)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                      isCurrentOption
                        ? 'bg-[#181D2C] shadow-md'
                        : 'bg-[#131520] border-[#222738] hover:border-[#38415C] hover:bg-[#161926]'
                    }`}
                    style={isCurrentOption ? {
                      borderColor: theme.primary,
                      boxShadow: `0 6px 18px -4px ${theme.primary}30`
                    } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1A1F30] relative shrink-0">
                        <img
                          src={opt.bannerImage}
                          alt={opt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-extrabold text-sm text-white transition-colors"
                            style={isCurrentOption ? { color: theme.primary } : undefined}
                          >
                            {opt.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E95A5] line-clamp-1 mt-0.5">
                          {opt.focus}
                        </p>
                        <div className="flex items-center gap-2.5 mt-1 text-[10px] text-[#A6B0C3] font-mono">
                          <span className="font-bold" style={{ color: theme.primary }}>{opt.estimatedMinutes}m</span>
                          <span>•</span>
                          <span>{opt.calories} kcal</span>
                          <span>•</span>
                          <span className="text-white/80">{opt.exerciseIds.length} movements</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCurrentOption ? (
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                          style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#1A1F2C] border border-[#2C344A] flex items-center justify-center text-[#788296] group-hover:text-white">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-[#11131E] border-t border-[#1C2030] flex gap-3">
          <button
            id="cancel-weekly-setup-btn"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#171B28] border border-[#272E42] text-xs font-extrabold uppercase tracking-wide text-[#A6B0C3] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-weekly-setup-btn"
            onClick={handleSaveAndApply}
            className="flex-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{
              backgroundColor: setupColor,
              color: '#0A0B0F',
              boxShadow: `0 8px 24px -4px ${setupColor}50`
            }}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Save & Update Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
