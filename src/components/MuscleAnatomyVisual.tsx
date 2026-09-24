import React from 'react';
import { MuscleGroup } from '../types';

interface MuscleAnatomyVisualProps {
  muscleGroup: MuscleGroup;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MuscleAnatomyVisual: React.FC<MuscleAnatomyVisualProps> = ({
  muscleGroup,
  className = '',
  size = 'md',
}) => {
  const isBack = muscleGroup === 'Back';

  const glowRed = '#FF2A42';
  const glowOrange = '#FF5E1E';
  const bodyBase = '#181C28';
  const bodyStroke = '#323A4E';
  const lineStroke = '#414C66';

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0D0F17] border border-[#212638] shadow-inner ${className}`}>
      {/* Top Header Badge styled like the video: [ ARMS ], [ BACK ], [ CHEST ] */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-0.5 bg-gradient-to-r from-transparent to-[#FF334B]" />
        <span className="text-sm font-black tracking-widest uppercase text-white font-mono px-3 py-0.5 rounded-full bg-[#1A1F2E] border border-[#2D364D] shadow-sm">
          {muscleGroup}
        </span>
        <span className="w-6 h-0.5 bg-gradient-to-l from-transparent to-[#FF334B]" />
      </div>

      {/* SVG Canvas for Muscular Anatomy */}
      <div className={`relative ${size === 'lg' ? 'w-56 h-64' : size === 'sm' ? 'w-36 h-40' : 'w-48 h-56'}`}>
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Glowing muscle gradients */}
            <linearGradient id="activeMuscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={glowRed} />
              <stop offset="100%" stopColor={glowOrange} />
            </linearGradient>
            <filter id="muscleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FF334B" floodOpacity="0.8" />
            </filter>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#252C3D" />
              <stop offset="100%" stopColor="#121622" />
            </linearGradient>
          </defs>

          {isBack ? (
            /* BACK ANATOMY VIEW (Used when muscle is Back) */
            <g id="back-anatomy">
              {/* Head & Neck Base */}
              <ellipse cx="100" cy="30" rx="16" ry="20" fill="url(#bodyGrad)" stroke={bodyStroke} strokeWidth="1.5" />
              <path d="M88 46 Q100 50 112 46 L116 62 Q100 66 84 62 Z" fill="url(#bodyGrad)" stroke={bodyStroke} strokeWidth="1.5" />

              {/* Upper Trapezius / Neck */}
              <path
                d="M84 56 Q100 62 116 56 L130 76 Q100 86 70 76 Z"
                fill="url(#activeMuscleGrad)"
                filter="url(#muscleGlow)"
                stroke="#FFE0E0"
                strokeWidth="1"
              />

              {/* Shoulders / Rear Delts */}
              <path
                d="M58 84 Q48 95 44 116 Q52 122 62 118 Q68 98 70 82 Z"
                fill="url(#bodyGrad)"
                stroke={bodyStroke}
                strokeWidth="1.5"
              />
              <path
                d="M142 84 Q152 95 156 116 Q148 122 138 118 Q132 98 130 82 Z"
                fill="url(#bodyGrad)"
                stroke={bodyStroke}
                strokeWidth="1.5"
              />

              {/* Arms: Triceps / Forearms (Back View) */}
              <path
                d="M44 116 Q36 140 38 165 Q46 168 52 162 Q52 138 60 120 Z"
                fill="url(#bodyGrad)"
                stroke={bodyStroke}
                strokeWidth="1.5"
              />
              <path
                d="M156 116 Q164 140 162 165 Q154 168 148 162 Q148 138 140 120 Z"
                fill="url(#bodyGrad)"
                stroke={bodyStroke}
                strokeWidth="1.5"
              />

              {/* LATISSIMUS DORSI & MID BACK (Glowing Active) */}
              <path
                d="M70 78 Q100 86 130 78 L142 125 Q125 150 114 165 Q100 168 86 165 Q75 150 58 125 Z"
                fill="url(#activeMuscleGrad)"
                filter="url(#muscleGlow)"
                stroke="#FFD5D8"
                strokeWidth="1.5"
              />

              {/* Spine Line & Scapular Contour Lines */}
              <line x1="100" y1="75" x2="100" y2="165" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 2" />
              <path d="M85 95 Q95 110 88 125" stroke="#FFA3A8" strokeWidth="1.5" fill="none" opacity="0.8" />
              <path d="M115 95 Q105 110 112 125" stroke="#FFA3A8" strokeWidth="1.5" fill="none" opacity="0.8" />

              {/* Lower Back & Waist */}
              <path d="M86 165 Q100 168 114 165 L120 188 Q100 192 80 188 Z" fill="url(#bodyGrad)" stroke={bodyStroke} strokeWidth="1.5" />

              {/* Glutes / Upper Thighs */}
              <path d="M78 188 Q98 220 100 224 Q102 220 122 188" stroke={bodyStroke} strokeWidth="1.5" fill="none" />
            </g>
          ) : (
            /* FRONT ANATOMY VIEW (Used for Chest, Arms, Shoulders, Legs, Core) */
            <g id="front-anatomy">
              {/* Head & Neck Base */}
              <ellipse cx="100" cy="28" rx="15" ry="18" fill="url(#bodyGrad)" stroke={bodyStroke} strokeWidth="1.5" />
              {/* Trapezius slope */}
              <path d="M88 44 Q100 48 112 44 L126 56 Q100 64 74 56 Z" fill="url(#bodyGrad)" stroke={bodyStroke} strokeWidth="1.5" />

              {/* DELTOIDS / SHOULDERS */}
              <path
                d="M54 74 Q44 88 42 110 Q50 118 60 112 Q64 92 68 76 Z"
                fill={muscleGroup === 'Shoulders' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Shoulders' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Shoulders' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />
              <path
                d="M146 74 Q156 88 158 110 Q150 118 140 112 Q136 92 132 76 Z"
                fill={muscleGroup === 'Shoulders' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Shoulders' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Shoulders' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />

              {/* BICEPS / ARMS */}
              <path
                d="M42 110 Q32 135 34 162 Q44 166 50 158 Q54 135 60 114 Z"
                fill={muscleGroup === 'Arms' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Arms' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Arms' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />
              <path
                d="M158 110 Q168 135 166 162 Q156 166 150 158 Q146 135 140 114 Z"
                fill={muscleGroup === 'Arms' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Arms' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Arms' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />
              {/* Forearms */}
              <path
                d="M34 162 Q30 188 32 208 Q40 210 46 202 Q48 185 50 158 Z"
                fill={muscleGroup === 'Arms' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Arms' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Arms' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />
              <path
                d="M166 162 Q170 188 168 208 Q160 210 154 202 Q152 185 150 158 Z"
                fill={muscleGroup === 'Arms' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Arms' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Arms' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />

              {/* CHEST / PECTORALS */}
              <path
                d="M68 64 Q84 66 98 70 L98 108 Q80 110 64 96 Q60 80 68 64 Z"
                fill={muscleGroup === 'Chest' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Chest' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Chest' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />
              <path
                d="M132 64 Q116 66 102 70 L102 108 Q120 110 136 96 Q140 80 132 64 Z"
                fill={muscleGroup === 'Chest' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Chest' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Chest' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />

              {/* Clavicle & Sternal Line */}
              <line x1="100" y1="64" x2="100" y2="108" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.5" />

              {/* ABDOMINALS / CORE */}
              <g
                fill={muscleGroup === 'Core' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Core' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Core' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              >
                {/* Upper abs */}
                <rect x="85" y="112" width="13" height="12" rx="3" />
                <rect x="102" y="112" width="13" height="12" rx="3" />
                {/* Mid abs */}
                <rect x="85" y="128" width="13" height="12" rx="3" />
                <rect x="102" y="128" width="13" height="12" rx="3" />
                {/* Lower abs */}
                <rect x="87" y="144" width="11" height="14" rx="3" />
                <rect x="102" y="144" width="11" height="14" rx="3" />
              </g>

              {/* Obliques & Torso Border */}
              <path d="M64 96 Q70 135 78 160 L122 160 Q130 135 136 96" stroke={bodyStroke} strokeWidth="1.5" fill="none" />

              {/* LEGS / QUADS & HAMSTRINGS */}
              <path
                d="M74 165 Q62 195 66 230 Q78 232 86 215 Q92 188 96 166 Z"
                fill={muscleGroup === 'Legs' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Legs' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Legs' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />
              <path
                d="M126 165 Q138 195 134 230 Q122 232 114 215 Q108 188 104 166 Z"
                fill={muscleGroup === 'Legs' ? 'url(#activeMuscleGrad)' : 'url(#bodyGrad)'}
                filter={muscleGroup === 'Legs' ? 'url(#muscleGlow)' : undefined}
                stroke={muscleGroup === 'Legs' ? '#FFE0E0' : bodyStroke}
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Anatomical Pointer Label */}
        <div className="absolute bottom-1 right-1 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 border border-[#2B3448] text-[9px] font-mono text-[#BAC4D9]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF334B] animate-pulse" />
          <span>Active Target</span>
        </div>
      </div>
    </div>
  );
};
