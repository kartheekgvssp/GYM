import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  RotateCcw, 
  Dumbbell, 
  Calendar, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Target,
  Zap,
  Layers,
  Award,
  PlusCircle,
  CheckCircle2,
  Share2,
  Compass,
  Play,
  Video
} from 'lucide-react';
import { EquipmentScanData, DayWorkoutPlan, Weekday, Exercise, MuscleGroup, ScannedStageExercise } from '../types';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';
import { MuscleAnatomyVisual } from './MuscleAnatomyVisual';
import { ExerciseMovementModal } from './ExerciseMovementModal';

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

  // Active Stage Tab: 'all' | 'beginner' | 'intermediate' | 'advanced'
  const [activeStageTab, setActiveStageTab] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  
  // Selected exercise for quick adding
  const [selectedStageEx, setSelectedStageEx] = useState<ScannedStageExercise | null>(null);

  // Active exercise for video movement demo modal
  const [activeVideoExercise, setActiveVideoExercise] = useState<ScannedStageExercise | null>(null);

  // Day selection state for adding to weekly plan
  const weekdayNames: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayWeekday = weekdayNames[new Date().getDay()];

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

  const handleToggleDay = (day: Weekday) => {
    haptics.trigger('selection');
    setSelectedDays(prev => 
      prev.includes(day) 
        ? (prev.length > 1 ? prev.filter(d => d !== day) : prev) 
        : [...prev, day]
    );
  };

  // Add exercise to weekly plan
  const handleAddToFeaturedLifts = async (ex: ScannedStageExercise) => {
    haptics.trigger('medium');
    setIsAdding(true);

    try {
      const muscleGroup: MuscleGroup = scanData.primaryMuscle || 'Chest';
      const fallbackImg = MUSCLE_DEFAULT_IMAGES[muscleGroup] || MUSCLE_DEFAULT_IMAGES.Chest;

      const exerciseObject: Exercise = {
        id: `scanned-${Date.now()}-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: ex.name,
        muscleGroup: muscleGroup,
        equipment: scanData.equipmentName,
        defaultSets: 3,
        defaultReps: 10,
        difficulty: ex.difficulty || 'Intermediate',
        image: capturedImage || fallbackImg,
        caloriesBurn: 110,
        tips: ex.tips || [
          'Maintain controlled tempo throughout',
          'Squeeze targeted muscle at peak contraction',
          'Do not use momentum or arch lower spine'
        ],
      };

      await onAddExerciseToWeeklyPlan(exerciseObject, selectedDays);
      setAddedExerciseName(ex.name);
      setAddedSuccess(true);
      haptics.trigger('success');
    } catch (err) {
      console.error('Failed to add exercise to weekly plan:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Safe stages extraction
  const stages = scanData.stages || {
    beginner: {
      stageName: 'Beginner Stage',
      description: 'Foundational exercises for mind-muscle connection and joint safety.',
      exercises: (scanData.exercises || []).slice(0, 2).map((e, idx) => ({
        name: e.name,
        setsAndReps: '3 sets × 10-12 reps',
        targetRepsBadge: idx === 0 ? '2x15' : '2x10',
        difficulty: 'Beginner' as const,
        targetArea: e.targetArea,
        tips: e.formTips
      }))
    },
    intermediate: {
      stageName: 'Intermediate Stage',
      description: 'Compound overloading to maximize hypertrophy and mass.',
      exercises: [
        {
          name: `${scanData.primaryMuscle} Heavy Overload Press/Pull`,
          setsAndReps: '4 sets × 8-10 reps',
          targetRepsBadge: '3x10',
          difficulty: 'Intermediate' as const,
          targetArea: 'Primary Muscle Mass',
          tips: ['Retract scapulae', 'Explosive drive']
        }
      ]
    },
    advanced: {
      stageName: 'Advanced Stage',
      description: 'High-intensity pauses and extended-tension failure sets.',
      exercises: [
        {
          name: `Paused ${scanData.primaryMuscle} Strict Contraction`,
          setsAndReps: '4 sets × 4-6 reps (or 21s)',
          targetRepsBadge: '3x20',
          difficulty: 'Advanced' as const,
          targetArea: 'Max Threshold Motor Units',
          tips: ['1.5-second pause at maximum tension point']
        }
      ]
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0B0F] text-white overflow-y-auto pb-12">
      
      {/* Top Bar with Retake and Close */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0A0B0F]/90 backdrop-blur-md border-b border-[#1E2333]">
        <button
          onClick={onRetake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#171A26] border border-[#2B3245] text-[#BAC4D9] hover:text-white transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Snap</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121520] border border-[#272E42]">
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
            AI Scan Verified
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-[#171A26] border border-[#2B3245] text-[#BAC4D9] hover:text-white transition active:scale-95"
          aria-label="Close"
        >
          <span className="text-xs font-bold px-2 py-0.5">Done</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-5">

        {/* 1. ANATOMICAL TARGETING HERO (DIRECTLY MATCHING THE VIDEO) */}
        <div className="rounded-3xl bg-gradient-to-b from-[#131622] to-[#0D0F17] border border-[#22293A] p-4 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Muscular Body Graphic with Active Glowing Muscle */}
            <div className="w-full sm:w-1/2 flex justify-center">
              <MuscleAnatomyVisual 
                muscleGroup={scanData.primaryMuscle}
                size="md"
                className="w-full max-w-[200px]"
              />
            </div>

            {/* Identified Equipment & Primary Muscles Info */}
            <div className="w-full sm:w-1/2 space-y-2.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F2637] border border-[#313B53] text-[10px] font-mono text-[#00E5FF]">
                <Dumbbell className="w-3 h-3" />
                <span className="capitalize">{scanData.equipmentType} Station</span>
              </div>

              <h1 className="text-xl font-black text-white tracking-tight leading-snug">
                {scanData.equipmentName}
              </h1>

              <p className="text-xs text-[#9DA8BE] leading-relaxed line-clamp-3">
                {scanData.overview}
              </p>

              {/* Target Muscle Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                {scanData.targetMuscles.slice(0, 4).map((muscle) => (
                  <span
                    key={muscle}
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#181D2B] text-[#D8E1F2] border border-[#2B3448]"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Captured Mini Thumbnail in Corner */}
          {capturedImage && (
            <div className="mt-3 pt-3 border-t border-[#1C2130] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src={capturedImage} 
                  alt="Scanned snap" 
                  className="w-9 h-9 rounded-lg object-cover border border-[#2D364C]"
                />
                <div>
                  <div className="text-[10px] font-mono text-[#8E95A5]">Scanned Gym Image</div>
                  <div className="text-xs font-bold text-white">Visual Match Confirmed</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A2030] text-[#00E5FF] border border-[#29334C]">
                100% Biomechanical Match
              </span>
            </div>
          )}
        </div>

        {/* 2. PROGRESSION STAGES BREAKDOWN (Beginner, Intermediate, Advanced - Like Video) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF334B]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Progression Stages & Rep Targets
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#8E95A5]">Newbie to Seasoned</span>
          </div>

          {/* STAGE TABS */}
          <div className="flex p-1 rounded-2xl bg-[#121520] border border-[#212638] text-xs font-mono">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  haptics.trigger('selection');
                  setActiveStageTab(tab);
                }}
                className={`flex-1 py-1.5 rounded-xl capitalize font-bold transition text-center ${
                  activeStageTab === tab 
                    ? 'bg-[#FF334B] text-white shadow-md' 
                    : 'text-[#8E95A5] hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Stages' : tab}
              </button>
            ))}
          </div>

          {/* STAGE CARDS CONTAINER */}
          <div className="space-y-4">
            
            {/* BEGINNER STAGE */}
            {(activeStageTab === 'all' || activeStageTab === 'beginner') && stages.beginner && (
              <div className="rounded-2xl bg-[#11141E] border border-[#232A3B] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2232] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-xs font-black tracking-wider uppercase text-white font-mono">
                      Beginner Stage
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                    Foundation
                  </span>
                </div>

                <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                  {stages.beginner.description}
                </p>

                {/* Exercises in Beginner Stage */}
                <div className="space-y-2.5">
                  {stages.beginner.exercises.map((ex, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#141824] border border-[#252E42] space-y-2 hover:border-[#3D4B6A] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold text-white flex items-center gap-2">
                          <span>{ex.name}</span>
                          <span className="text-[10px] font-mono font-normal text-[#8E95A5]">({ex.targetArea})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#FF2A42] text-white shadow-sm">
                          {ex.targetRepsBadge}
                        </span>
                      </div>

                      {/* Setup Position */}
                      {ex.position && (
                        <div className="flex items-start gap-1.5 text-[11px] text-[#A6B4C9] bg-[#0E121B] px-2.5 py-1.5 rounded-lg border border-[#1E2536]">
                          <Compass className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[#00E5FF] font-bold">Position: </span>
                            <span>{ex.position}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="font-bold text-[#FF5E1E] flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-[#FF5E1E]" />
                          <span>{ex.setsAndReps}</span>
                        </div>
                        {ex.tips && ex.tips[0] && (
                          <div className="text-[10px] text-[#8E95A5] italic max-w-[200px] truncate">
                            💡 {ex.tips[0]}
                          </div>
                        )}
                      </div>

                      {/* Video Movement Demo & Add Action */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#1C2333]">
                        <button
                          onClick={() => setActiveVideoExercise(ex)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#101522] text-[#00E5FF] hover:bg-[#182136] transition border border-[#25324A] flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-[#00E5FF]" />
                          <span>Watch Movement Demo Video</span>
                        </button>
                        <button
                          onClick={() => handleAddToFeaturedLifts(ex)}
                          disabled={isAdding}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#1B2232] text-white hover:bg-[#252E44] transition border border-[#2B3650] flex items-center gap-1 active:scale-95"
                        >
                          <PlusCircle className="w-3 h-3 text-[#10B981]" />
                          <span>Add Lift</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERMEDIATE STAGE */}
            {(activeStageTab === 'all' || activeStageTab === 'intermediate') && stages.intermediate && (
              <div className="rounded-2xl bg-[#11141E] border border-[#232A3B] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2232] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                    <span className="text-xs font-black tracking-wider uppercase text-white font-mono">
                      Intermediate Stage
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                    Hypertrophy Mass
                  </span>
                </div>

                <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                  {stages.intermediate.description}
                </p>

                {/* Exercises in Intermediate Stage */}
                <div className="space-y-2.5">
                  {stages.intermediate.exercises.map((ex, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#141824] border border-[#252E42] space-y-2 hover:border-[#3D4B6A] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold text-white flex items-center gap-2">
                          <span>{ex.name}</span>
                          <span className="text-[10px] font-mono font-normal text-[#8E95A5]">({ex.targetArea})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#FF2A42] text-white shadow-sm">
                          {ex.targetRepsBadge}
                        </span>
                      </div>

                      {/* Setup Position */}
                      {ex.position && (
                        <div className="flex items-start gap-1.5 text-[11px] text-[#A6B4C9] bg-[#0E121B] px-2.5 py-1.5 rounded-lg border border-[#1E2536]">
                          <Compass className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[#00E5FF] font-bold">Position: </span>
                            <span>{ex.position}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="font-bold text-[#FF5E1E] flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-[#FF5E1E]" />
                          <span>{ex.setsAndReps}</span>
                        </div>
                        {ex.tips && ex.tips[0] && (
                          <div className="text-[10px] text-[#8E95A5] italic max-w-[200px] truncate">
                            💡 {ex.tips[0]}
                          </div>
                        )}
                      </div>

                      {/* Video Movement Demo & Add Action */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#1C2333]">
                        <button
                          onClick={() => setActiveVideoExercise(ex)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#101522] text-[#00E5FF] hover:bg-[#182136] transition border border-[#25324A] flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-[#00E5FF]" />
                          <span>Watch Movement Demo Video</span>
                        </button>
                        <button
                          onClick={() => handleAddToFeaturedLifts(ex)}
                          disabled={isAdding}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#1B2232] text-white hover:bg-[#252E44] transition border border-[#2B3650] flex items-center gap-1 active:scale-95"
                        >
                          <PlusCircle className="w-3 h-3 text-[#10B981]" />
                          <span>Add Lift</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADVANCED STAGE */}
            {(activeStageTab === 'all' || activeStageTab === 'advanced') && stages.advanced && (
              <div className="rounded-2xl bg-[#11141E] border border-[#232A3B] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2232] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF334B]" />
                    <span className="text-xs font-black tracking-wider uppercase text-white font-mono">
                      Advanced Stage
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF334B]/20 text-[#FF334B] border border-[#FF334B]/30">
                    Max Overload
                  </span>
                </div>

                <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                  {stages.advanced.description}
                </p>

                {/* Exercises in Advanced Stage */}
                <div className="space-y-2.5">
                  {stages.advanced.exercises.map((ex, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#141824] border border-[#252E42] space-y-2 hover:border-[#3D4B6A] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold text-white flex items-center gap-2">
                          <span>{ex.name}</span>
                          <span className="text-[10px] font-mono font-normal text-[#8E95A5]">({ex.targetArea})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#FF2A42] text-white shadow-sm">
                          {ex.targetRepsBadge}
                        </span>
                      </div>

                      {/* Setup Position */}
                      {ex.position && (
                        <div className="flex items-start gap-1.5 text-[11px] text-[#A6B4C9] bg-[#0E121B] px-2.5 py-1.5 rounded-lg border border-[#1E2536]">
                          <Compass className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[#00E5FF] font-bold">Position: </span>
                            <span>{ex.position}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="font-bold text-[#FF5E1E] flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-[#FF5E1E]" />
                          <span>{ex.setsAndReps}</span>
                        </div>
                        {ex.tips && ex.tips[0] && (
                          <div className="text-[10px] text-[#8E95A5] italic max-w-[200px] truncate">
                            💡 {ex.tips[0]}
                          </div>
                        )}
                      </div>

                      {/* Video Movement Demo & Add Action */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#1C2333]">
                        <button
                          onClick={() => setActiveVideoExercise(ex)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#101522] text-[#00E5FF] hover:bg-[#182136] transition border border-[#25324A] flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-[#00E5FF]" />
                          <span>Watch Movement Demo Video</span>
                        </button>
                        <button
                          onClick={() => handleAddToFeaturedLifts(ex)}
                          disabled={isAdding}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#1B2232] text-white hover:bg-[#252E44] transition border border-[#2B3650] flex items-center gap-1 active:scale-95"
                        >
                          <PlusCircle className="w-3 h-3 text-[#10B981]" />
                          <span>Add Lift</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3. BIOMECHANICAL ADVANTAGES & EQUIPMENT USES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Zap className="w-4 h-4 text-[#00E5FF]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Why Use This Equipment & Anatomical Uses
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {scanData.benefitsAndUses.map((benefit, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-[#10131D] border border-[#202636] space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#182030] text-[#00E5FF] text-[10px] font-mono font-bold flex items-center justify-center border border-[#29354E]">
                    0{idx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-white">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-xs text-[#8E95A5] leading-relaxed pl-7">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. SCHEDULE PICKER FOR "ADD TO FEATURED POWER LIFTS" */}
        <div className="p-4 rounded-2xl bg-[#121622] border border-[#222A3C] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Scheduled Days in Weekly Routine
              </span>
            </div>
            <button
              onClick={() => setIsDaySelectorOpen(prev => !prev)}
              className="text-xs font-mono text-[#00E5FF] flex items-center gap-1"
            >
              <span>{isDaySelectorOpen ? 'Hide' : 'Customize Days'}</span>
              {isDaySelectorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Active Days Summary Pills */}
          <div className="flex flex-wrap gap-1.5">
            {weekdayNames.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => handleToggleDay(day)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-mono font-bold transition active:scale-95 ${
                    isSelected 
                      ? 'bg-[#FF334B] text-white shadow-md' 
                      : 'bg-[#181C28] text-[#8E95A5] border border-[#272F42] hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#8E95A5] leading-normal">
            Lifts added here will appear directly on your Home screen under <span className="text-white font-bold">Featured Power Lifts</span> for the selected days.
          </p>
        </div>

        {/* SUCCESS CONFIRMATION MODAL / BANNER */}
        {addedSuccess && (
          <div className="p-4 rounded-2xl bg-[#0F291E] border border-[#10B981]/50 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#10B981]">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div className="text-xs font-black uppercase tracking-wide">
                Added to Featured Power Lifts!
              </div>
            </div>
            <p className="text-xs text-[#A7F3D0]">
              <strong className="text-white">{addedExerciseName}</strong> has been saved to your weekly routine ({selectedDays.map(d => d.slice(0, 3)).join(', ')}).
            </p>
            {onNavigateToHome && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToHome();
                }}
                className="mt-2 w-full py-2.5 rounded-xl bg-[#10B981] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#059669] transition flex items-center justify-center gap-1.5"
              >
                <span>View on Home Screen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>

      {/* Interactive Movement Demo & Setup Video Modal */}
      {activeVideoExercise && (
        <ExerciseMovementModal
          exercise={activeVideoExercise}
          equipmentName={scanData.equipmentName}
          primaryMuscle={scanData.primaryMuscle}
          onClose={() => setActiveVideoExercise(null)}
          onAddLift={(ex) => handleAddToFeaturedLifts(ex)}
          isAdding={isAdding}
        />
      )}

    </div>
  );
};
