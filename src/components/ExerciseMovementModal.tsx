import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  CheckCircle2, 
  PlusCircle, 
  Dumbbell, 
  Target, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  Compass,
  ArrowRight
} from 'lucide-react';
import { ScannedStageExercise, MuscleGroup } from '../types';
import { haptics } from '../lib/haptics';

interface ExerciseMovementModalProps {
  exercise: ScannedStageExercise;
  equipmentName: string;
  primaryMuscle: MuscleGroup;
  onClose: () => void;
  onAddLift: (exercise: ScannedStageExercise) => void;
  isAdding?: boolean;
}

export const ExerciseMovementModal: React.FC<ExerciseMovementModalProps> = ({
  exercise,
  equipmentName,
  primaryMuscle,
  onClose,
  onAddLift,
  isAdding = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [repCount, setRepCount] = useState(1);
  const [motionProgress, setMotionProgress] = useState(0); // 0 to 100
  const [motionPhase, setMotionPhase] = useState<'concentric' | 'peak' | 'eccentric'>('concentric');

  // Animation movement loop (3.5s per rep cycle)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 50;
    const cycleDuration = 3500; // 3.5 seconds per repetition
    const stepIncrement = (intervalTime / cycleDuration) * 100;

    const timer = setInterval(() => {
      setMotionProgress((prev) => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          setRepCount((r) => (r >= 12 ? 1 : r + 1));
          return 0;
        }

        // Phase determination:
        // 0% - 35%: Concentric contraction (Drive / Pull / Push)
        // 35% - 50%: Peak squeeze (Hold)
        // 50% - 100%: Eccentric lowering (Controlled 2s return)
        if (next < 35) {
          setMotionPhase('concentric');
        } else if (next < 50) {
          setMotionPhase('peak');
        } else {
          setMotionPhase('eccentric');
        }

        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Motion phase color and label
  const phaseDetails = {
    concentric: {
      label: 'PHASE 1: CONCENTRIC DRIVE (PULL / PUSH)',
      sub: 'Exhale forcefully & engage prime muscle fibers',
      color: 'text-[#FF334B]',
      bg: 'bg-[#FF334B]',
      border: 'border-[#FF334B]/40',
    },
    peak: {
      label: 'PHASE 2: ISOMETRIC PEAK SQUEEZE',
      sub: 'Hold contraction firmly for maximum fiber tension',
      color: 'text-[#00E5FF]',
      bg: 'bg-[#00E5FF]',
      border: 'border-[#00E5FF]/40',
    },
    eccentric: {
      label: 'PHASE 3: ECCENTRIC LOWERING (2s CONTROL)',
      sub: 'Inhale deeply & resist resistance smoothly',
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]',
      border: 'border-[#10B981]/40',
    },
  }[motionPhase];

  // Calculate dynamic movement offset for the biomechanical animated avatar
  // Normalize progress so concentric goes 0 -> 1, peak holds at 1, eccentric goes 1 -> 0
  let contractionFactor = 0;
  if (motionProgress < 35) {
    contractionFactor = motionProgress / 35; // 0 -> 1
  } else if (motionProgress < 50) {
    contractionFactor = 1; // Hold peak
  } else {
    contractionFactor = 1 - (motionProgress - 50) / 50; // 1 -> 0
  }

  // Determine movement type for animation:
  const isPull = exercise.name.toLowerCase().includes('pull') || exercise.name.toLowerCase().includes('row') || exercise.name.toLowerCase().includes('chin');
  const isCurl = exercise.name.toLowerCase().includes('curl');
  const isPress = exercise.name.toLowerCase().includes('press') || exercise.name.toLowerCase().includes('bench') || exercise.name.toLowerCase().includes('push');
  const isLeg = primaryMuscle === 'Legs' || exercise.name.toLowerCase().includes('squat') || exercise.name.toLowerCase().includes('leg');
  const isCore = primaryMuscle === 'Core' || exercise.name.toLowerCase().includes('raise') || exercise.name.toLowerCase().includes('crunch');

  // Animated displacement values
  const pullY = contractionFactor * 32;
  const curlAngle = contractionFactor * 75;
  const pressY = -contractionFactor * 36;
  const legY = -contractionFactor * 30;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0E111A] border-t sm:border border-[#232A3C] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-[#1E2536] flex items-center justify-between bg-[#121624]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF]">
                Exercise Movement & Position Video Demo
              </div>
              <h3 className="text-sm font-black text-white truncate max-w-[220px] sm:max-w-xs">
                {exercise.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181D2D] hover:bg-[#252C42] border border-[#2B3550] flex items-center justify-center text-[#8E95A5] hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">

          {/* 1. ANIMATED MOVEMENT VIDEO & BIOMECHANICAL VISUALIZER */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#131826] to-[#0A0D15] border border-[#232D42] overflow-hidden shadow-inner aspect-[16/10] flex flex-col items-center justify-between p-4">
            
            {/* Top Video HUD Bar */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1B2234] border border-[#2C3852] text-[10px] font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span>SIMULATION VIDEO</span>
                </span>
                <span className="text-[10px] font-mono text-[#8E95A5]">
                  {equipmentName}
                </span>
              </div>

              {/* Rep Counter Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-[#2E3A52] text-xs font-mono font-bold text-white">
                <span className="text-[#8E95A5]">REP:</span>
                <span className="text-[#00E5FF] font-black">{repCount}</span>
                <span className="text-[#8E95A5]">/ 12</span>
              </div>
            </div>

            {/* BIOMECHANICAL ANIMATION CANVAS (Vector Motion Simulation) */}
            <div className="relative w-full flex-1 flex items-center justify-center py-2">
              
              {/* Dynamic Animated Motion SVG */}
              <svg 
                viewBox="0 0 240 160" 
                className="w-full h-full max-h-[140px]"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Grid Lines */}
                <defs>
                  <linearGradient id="glowConcentric" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF334B" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FF8533" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="glowPeak" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="glowEccentric" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Machine Frame / Station Guidelines */}
                <line x1="20" y1="145" x2="220" y2="145" stroke="#252F44" strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="145" x2="60" y2="30" stroke="#20283B" strokeWidth="4" />
                <line x1="50" y1="30" x2="190" y2="30" stroke="#2A354C" strokeWidth="4" strokeLinecap="round" />

                {/* Bench / Seat Structure */}
                <rect x="85" y="105" width="70" height="12" rx="4" fill="#1C2333" stroke="#2D3952" strokeWidth="2" />
                <rect x="115" y="117" width="10" height="28" fill="#181E2C" />

                {/* Pulley / Cable Track */}
                <line 
                  x1="120" 
                  y1="30" 
                  x2="120" 
                  y2={isPull ? 35 + pullY : isPress ? 70 + pressY : 65} 
                  stroke="#00E5FF" 
                  strokeWidth="2.5" 
                  strokeDasharray="3 2"
                />

                {/* Cable Handle / Barbell Bar */}
                <rect 
                  x="95" 
                  y={isPull ? 35 + pullY : isPress ? 68 + pressY : 63} 
                  width="50" 
                  height="5" 
                  rx="2.5" 
                  fill="#E2E8F0" 
                  stroke="#00E5FF" 
                  strokeWidth="1.5"
                />

                {/* Lifter Silhouette in Setup Position */}
                {/* Torso */}
                <line 
                  x1="120" 
                  y1="65" 
                  x2="120" 
                  y2="105" 
                  stroke={motionPhase === 'peak' ? 'url(#glowPeak)' : motionPhase === 'concentric' ? 'url(#glowConcentric)' : 'url(#glowEccentric)'} 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                />

                {/* Head */}
                <circle cx="120" cy="50" r="10" fill="#2E394E" stroke="#4B5A79" strokeWidth="2" />

                {/* Active Muscular Glow Highlight */}
                <circle 
                  cx="120" 
                  cy="75" 
                  r={8 + contractionFactor * 4} 
                  fill={motionPhase === 'peak' ? '#00E5FF' : motionPhase === 'concentric' ? '#FF334B' : '#10B981'} 
                  opacity={0.35 + contractionFactor * 0.4} 
                />

                {/* Arms executing movement */}
                {isPull ? (
                  <>
                    {/* Left arm pulling down */}
                    <line x1="120" y1="65" x2="105" y2={50 + pullY * 0.7} stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                    <line x1="105" y1={50 + pullY * 0.7} x2="100" y2={35 + pullY} stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Right arm pulling down */}
                    <line x1="120" y1="65" x2="135" y2={50 + pullY * 0.7} stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                    <line x1="135" y1={50 + pullY * 0.7} x2="140" y2={35 + pullY} stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
                  </>
                ) : isPress ? (
                  <>
                    {/* Pressing up/forward */}
                    <line x1="120" y1="65" x2="105" y2={75 + pressY * 0.5} stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                    <line x1="105" y1={75 + pressY * 0.5} x2="102" y2={68 + pressY} stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="120" y1="65" x2="135" y2={75 + pressY * 0.5} stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                    <line x1="135" y1={75 + pressY * 0.5} x2="138" y2={68 + pressY} stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    {/* Curling / General arm path */}
                    <line x1="120" y1="65" x2="110" y2="85" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                    <line x1="110" y1="85" x2={100 + contractionFactor * 15} y2={85 - contractionFactor * 25} stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx={100 + contractionFactor * 15} cy={85 - contractionFactor * 25} r="6" fill="#FF5E1E" />
                  </>
                )}

                {/* Legs seated on bench */}
                <line x1="120" y1="105" x2="145" y2="115" stroke="#252F44" strokeWidth="6" strokeLinecap="round" />
                <line x1="145" y1="115" x2="150" y2="145" stroke="#252F44" strokeWidth="5" strokeLinecap="round" />
                <circle cx="150" cy="145" r="4" fill="#3D4B68" />
              </svg>

              {/* Movement Directional Arrow Overlay */}
              <div className="absolute right-4 bottom-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-[#2D364D] text-[10px] font-mono text-[#00E5FF]">
                {motionPhase === 'concentric' ? '⬆ PULL / DRIVE' : motionPhase === 'peak' ? '⏹ SQUEEZE HOLD' : '⬇ CONTROL DESCENT'}
              </div>
            </div>

            {/* Bottom HUD: Dynamic Rep Progress Timeline */}
            <div className="w-full space-y-1.5 z-10">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={`font-black ${phaseDetails.color}`}>
                  {phaseDetails.label}
                </span>
                <span className="text-[#8E95A5] font-bold">
                  {Math.round(motionProgress)}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#181D2B] overflow-hidden border border-[#28324A] relative">
                <div 
                  className={`h-full transition-all duration-75 ${phaseDetails.bg} shadow-sm`}
                  style={{ width: `${motionProgress}%` }}
                />
              </div>

              {/* Controls: Play/Pause & Reset */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    haptics.trigger('selection');
                    setIsPlaying(prev => !prev);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1B2234] hover:bg-[#252F47] border border-[#2E3952] text-[10px] font-mono text-white flex items-center gap-1.5 transition active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 text-[#FF334B]" />
                      <span>Pause Demo</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-[#00E5FF] fill-[#00E5FF]" />
                      <span>Play Movement</span>
                    </>
                  )}
                </button>

                <div className="text-[10px] font-mono text-[#8E95A5] italic">
                  {phaseDetails.sub}
                </div>
              </div>

            </div>

          </div>

          {/* 2. EXACT SETUP POSITION (USER REQUIREMENT) */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-[#232B3E] space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#00E5FF] font-mono">
                Prescribed Setup Position
              </h4>
            </div>

            <div className="p-3 rounded-xl bg-[#0D1019] border border-[#1C2333] text-xs font-semibold text-white leading-relaxed">
              {exercise.position || 'Seated upright at 90°, chest pinned firmly against pad, shoulder blades retracted, feet flat on floor.'}
            </div>

            <p className="text-[11px] text-[#8E95A5] leading-normal pl-1">
              Correct positioning locks joint levers in place to isolate the <strong className="text-white">{primaryMuscle}</strong> while preventing momentum and tendon strain.
            </p>
          </div>

          {/* 3. SETS & REPETITION TARGETS (USER REQUIREMENT) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#121622] border border-[#232B3E] space-y-1">
              <div className="text-[10px] font-mono text-[#8E95A5] uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF5E1E]" />
                <span>Working Sets & Reps</span>
              </div>
              <div className="text-sm font-black text-white">
                {exercise.setsAndReps}
              </div>
              <div className="text-[10px] font-mono text-[#10B981]">
                Hypertrophy Overload
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121622] border border-[#232B3E] space-y-1">
              <div className="text-[10px] font-mono text-[#8E95A5] uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#FF2A42]" />
                <span>Target Reps Badge</span>
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-lg text-sm font-black font-mono bg-[#FF2A42] text-white shadow-sm">
                {exercise.targetRepsBadge}
              </div>
              <div className="text-[10px] font-mono text-[#8E95A5]">
                {exercise.difficulty} Level
              </div>
            </div>
          </div>

          {/* 4. COACH FORM CUES & BIOMECHANICAL TIPS */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#101420] border border-[#1F273A] space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Form Cues & Movement Execution
                </span>
              </div>

              <div className="space-y-2">
                {exercise.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#9DA8BE] leading-relaxed">
                    <span className="text-[#00E5FF] font-bold">0{idx + 1}.</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ADD LIFT TO WORKOUT CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                onAddLift(exercise);
                onClose();
              }}
              disabled={isAdding}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF334B] to-[#FF5E1E] hover:from-[#E0243B] hover:to-[#E54D10] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF334B]/20 flex items-center justify-center gap-2 active:scale-98 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add {exercise.name} to Weekly Routine</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
