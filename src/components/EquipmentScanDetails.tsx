import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  RotateCcw, 
  Dumbbell, 
  ShieldCheck, 
  Calendar, 
  Flame, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { EquipmentScanData, ScannedExercise, DayWorkoutPlan, Weekday, Exercise, MuscleGroup } from '../types';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';

interface EquipmentScanDetailsProps {
  scanData: EquipmentScanData;
  capturedImage: string | null;
  weeklyPlan: DayWorkoutPlan[];
  onAddExerciseToWeeklyPlan: (exercise: Exercise, targetDays: Weekday[]) => Promise<void>;
  onRetake: () => void;
  onClose: () => void;
  onNavigateToHome?: () => void;
}

const MUSCLE_DEFAULT_IMAGES: Record<string, string> = {
  Chest: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
  Back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80',
  Legs: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',
  Shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
  Arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  Core: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
};

export const EquipmentScanDetails: React.FC<EquipmentScanDetailsProps> = ({
  scanData,
  capturedImage,
  weeklyPlan,
  onAddExerciseToWeeklyPlan,
  onRetake,
  onClose,
  onNavigateToHome,
}) => {
  const { theme } = useTheme();

  // Selected exercise to add
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(0);
  
  // Day selection state for adding to weekly plan
  const weekdayNames: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayWeekday = weekdayNames[new Date().getDay()];
  
  // Default to today and days that match the primary muscle
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(() => {
    const matchingDays = weeklyPlan
      .filter(p => !p.isRestDay && p.targetMuscle === scanData.primaryMuscle)
      .map(p => p.day);
    if (matchingDays.length > 0) return matchingDays;
    return [todayWeekday];
  });

  const [isDaySelectorOpen, setIsDaySelectorOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [addedExerciseName, setAddedExerciseName] = useState<string>('');

  const currentExercise = scanData.exercises[selectedExerciseIndex] || scanData.exercises[0];

  const handleToggleDay = (day: Weekday) => {
    haptics.trigger('selection');
    setSelectedDays(prev => 
      prev.includes(day) 
        ? (prev.length > 1 ? prev.filter(d => d !== day) : prev) 
        : [...prev, day]
    );
  };

  const handleAddToFeaturedLifts = async (exerciseToSchedule?: ScannedExercise) => {
    const targetEx = exerciseToSchedule || currentExercise;
    if (!targetEx) return;

    haptics.trigger('medium');
    setIsAdding(true);

    try {
      const muscleGroup: MuscleGroup = scanData.primaryMuscle || 'Chest';
      const fallbackImg = MUSCLE_DEFAULT_IMAGES[muscleGroup] || MUSCLE_DEFAULT_IMAGES.Chest;

      const exerciseObject: Exercise = {
        id: `scanned-${Date.now()}-${targetEx.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: targetEx.name,
        muscleGroup: muscleGroup,
        equipment: scanData.equipmentName,
        defaultSets: parseInt(targetEx.recommendedSets) || 4,
        defaultReps: 10,
        difficulty: targetEx.difficulty,
        image: capturedImage || fallbackImg,
        caloriesBurn: 115,
        tips: targetEx.formTips || [
          'Maintain core engagement throughout movement',
          'Avoid jerking the weight during the transition point',
          'Control the eccentric lengthening phase for 2 seconds'
        ],
      };

      await onAddExerciseToWeeklyPlan(exerciseObject, selectedDays);
      setAddedExerciseName(targetEx.name);
      setAddedSuccess(true);
      haptics.trigger('success');
    } catch (err) {
      console.error('Failed to add exercise to weekly plan:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0B0F] text-white overflow-y-auto pb-10">
      
      {/* Top Banner / Snap Preview */}
      <div className="relative w-full h-56 bg-[#12141D] flex-shrink-0">
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt={scanData.equipmentName} 
            className="w-full h-full object-cover brightness-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#151824]">
            <Dumbbell className="w-12 h-12 text-[#8E95A5]" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0F] via-[#0A0B0F]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-lg"
            style={{ backgroundColor: `${theme.primary}E6`, color: theme.primaryContrast }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Equipment Verified</span>
          </div>

          <button
            onClick={onRetake}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition flex items-center gap-1 text-xs px-3 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
        </div>

        {/* Equipment Name & Primary Tags */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-extrabold"
              style={{ backgroundColor: `${theme.primary}25`, color: theme.primary }}
            >
              {scanData.equipmentType}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-extrabold bg-[#202636] text-[#A4ADC2]">
              Target: {scanData.primaryMuscle}
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight leading-snug">
            {scanData.equipmentName}
          </h2>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-4 pt-3 space-y-5 flex-1">
        
        {/* Success Alert if added */}
        {addedSuccess && (
          <div 
            className="p-4 rounded-2xl border flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300"
            style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}50` }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  Added to Featured Power Lifts!
                </h4>
                <p className="text-[11px] text-[#CBD3E3]">
                  Scheduled for <span className="font-bold text-white">{selectedDays.map(d => d.slice(0, 3)).join(', ')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {onNavigateToHome && (
                <button
                  onClick={() => {
                    haptics.trigger('selection');
                    onNavigateToHome();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                  style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
                >
                  <span>View in Featured Lifts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onRetake}
                className="py-2 px-3 rounded-xl bg-[#1A1F2D] text-xs font-bold text-[#CBD3E3] hover:text-white transition"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}

        {/* Overview text */}
        <div className="p-3.5 rounded-2xl bg-[#12141D] border border-[#202534] text-xs text-[#CBD3E3] leading-relaxed">
          <p>{scanData.overview}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-[#202534]">
            <span className="text-[10px] font-mono text-[#8E95A5] uppercase font-bold mr-1 self-center">
              Engages:
            </span>
            {scanData.targetMuscles.map((muscle) => (
              <span 
                key={muscle}
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#181C28] text-[#BAC4D9] border border-[#262C3C]"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 1: Uses & Biomechanical Benefits */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" style={{ color: theme.primary }} />
              <span>Uses & Advantages of this Equipment</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8E95A5]">Why It Works</span>
          </div>

          <div className="grid gap-2">
            {scanData.benefitsAndUses.map((benefit, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-[#12141D] border border-[#202534] flex items-start gap-2.5"
              >
                <div 
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                >
                  {idx === 0 ? <Flame className="w-3.5 h-3.5" /> : idx === 1 ? <Target className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    {benefit.title}
                  </h4>
                  <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: What We Can Do With It (Exercises & Reps) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" style={{ color: theme.primary }} />
              <span>What You Can Do (Exercises & Reps)</span>
            </h3>
            <span className="text-[10px] font-mono" style={{ color: theme.primary }}>
              {scanData.exercises.length} Movements Found
            </span>
          </div>

          <div className="space-y-3">
            {scanData.exercises.map((exercise, idx) => {
              const isExpanded = expandedExerciseIndex === idx;
              const isSelected = selectedExerciseIndex === idx;

              return (
                <div 
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isSelected ? 'bg-[#141824] border-[#3B4660]' : 'bg-[#12141D] border-[#202534]'
                  }`}
                >
                  {/* Header row */}
                  <div 
                    onClick={() => {
                      haptics.trigger('light');
                      setSelectedExerciseIndex(idx);
                      setExpandedExerciseIndex(isExpanded ? null : idx);
                    }}
                    className="p-3.5 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-black"
                        style={{ 
                          backgroundColor: isSelected ? theme.primary : '#1F2433', 
                          color: isSelected ? theme.primaryContrast : '#CBD3E3' 
                        }}
                      >
                        0{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {exercise.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8E95A5] font-mono">
                          <span className="text-[#00E5FF] font-semibold">{exercise.targetArea}</span>
                          <span>•</span>
                          <span>{exercise.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#1C2130] text-[#CBD3E3]"
                      >
                        {exercise.recommendedReps.hypertrophy}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#8E95A5]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8E95A5]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-[#1F2536] space-y-3 animate-in fade-in duration-200">
                      
                      {/* Reps Breakdown Box */}
                      <div>
                        <div className="text-[10px] font-mono uppercase font-bold text-[#8E95A5] mb-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#00E5FF]" />
                          <span>Recommended Sets & Rep Ranges</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-2 rounded-xl bg-[#0D0F17] border border-[#1E2333]">
                            <div className="text-[9px] font-mono uppercase text-[#8E95A5] font-bold">
                              Hypertrophy
                            </div>
                            <div className="text-xs font-black text-white mt-0.5">
                              {exercise.recommendedReps.hypertrophy}
                            </div>
                            <div className="text-[9px] text-[#5D667A]">Muscle Growth</div>
                          </div>
                          <div className="p-2 rounded-xl bg-[#0D0F17] border border-[#1E2333]">
                            <div className="text-[9px] font-mono uppercase text-[#8E95A5] font-bold">
                              Strength
                            </div>
                            <div className="text-xs font-black text-[#00E5FF] mt-0.5">
                              {exercise.recommendedReps.strength}
                            </div>
                            <div className="text-[9px] text-[#5D667A]">Max Force</div>
                          </div>
                          <div className="p-2 rounded-xl bg-[#0D0F17] border border-[#1E2333]">
                            <div className="text-[9px] font-mono uppercase text-[#8E95A5] font-bold">
                              Endurance
                            </div>
                            <div className="text-xs font-black text-white mt-0.5">
                              {exercise.recommendedReps.endurance}
                            </div>
                            <div className="text-[9px] text-[#5D667A]">Conditioning</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8E95A5] mt-1.5 px-1">
                          <span>Sets: <b className="text-white">{exercise.recommendedSets}</b></span>
                          <span>Rest: <b className="text-white">{exercise.restPeriod}</b></span>
                        </div>
                      </div>

                      {/* Step by step execution */}
                      <div>
                        <div className="text-[10px] font-mono uppercase font-bold text-[#8E95A5] mb-1">
                          How to Perform
                        </div>
                        <ol className="space-y-1 text-xs text-[#CBD3E3]">
                          {exercise.howToPerform.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="text-[10px] font-mono font-bold text-[#8E95A5] mt-0.5">
                                {sIdx + 1}.
                              </span>
                              <span className="leading-snug">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Form & safety tips */}
                      {exercise.formTips && exercise.formTips.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-[#171B26] border border-[#242C3E] text-[11px] text-[#A4ADC2] space-y-1">
                          <span className="font-bold text-white flex items-center gap-1 text-[10px] uppercase font-mono">
                            <Info className="w-3 h-3 text-[#00E5FF]" /> Key Form Tips:
                          </span>
                          {exercise.formTips.map((tip, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-[#00E5FF]" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: ADD TO FEATURED POWER LIFTS ACTION */}
        <section className="p-4 rounded-2xl bg-[#12141D] border border-[#252C3E] space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black"
                style={{ backgroundColor: `${theme.primary}25`, color: theme.primary }}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Add to Featured Power Lifts
                </h4>
                <p className="text-[11px] text-[#8E95A5]">
                  Schedules this exercise in your weekly plan activities
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDaySelectorOpen(!isDaySelectorOpen)}
              className="text-[11px] font-mono font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#1A1F2D] text-[#CBD3E3] hover:text-white"
            >
              <span>{selectedDays.length} Days</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Day selection pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[#8E95A5] uppercase font-bold">
              Scheduled Days:
            </span>
            <div className="grid grid-cols-7 gap-1">
              {weekdayNames.map((day) => {
                const isSelected = selectedDays.includes(day);
                const isToday = day === todayWeekday;
                const short = day.slice(0, 3);

                return (
                  <button
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold flex flex-col items-center justify-center transition ${
                      isSelected 
                        ? 'shadow-md scale-105' 
                        : 'bg-[#181C28] text-[#8E95A5] hover:text-white border border-[#232838]'
                    }`}
                    style={isSelected ? {
                      backgroundColor: theme.primary,
                      color: theme.primaryContrast
                    } : undefined}
                  >
                    <span>{short}</span>
                    {isToday && (
                      <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            id="btn-add-to-featured-lifts"
            disabled={isAdding || selectedDays.length === 0}
            onClick={() => handleAddToFeaturedLifts()}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Dumbbell className="w-4 h-4 stroke-[2.5]" />
                <span>Add &quot;{currentExercise.name}&quot; to Featured Power Lifts</span>
              </>
            )}
          </button>
        </section>

      </div>

      {/* Bottom Dismiss */}
      <div className="p-4 pt-2">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#141722] text-xs font-bold text-[#8E95A5] hover:text-white transition"
        >
          Close Scanner
        </button>
      </div>

    </div>
  );
};
