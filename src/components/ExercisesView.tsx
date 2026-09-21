import React, { useState } from 'react';
import { Search, Dumbbell, Filter, Flame, ChevronRight, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { MuscleGroup, Exercise, DifficultyLevel } from '../types';
import { EXERCISE_DATABASE } from '../data/mockData';
import { useTheme } from '../lib/theme';

interface ExercisesViewProps {
  onSelectExercise: (exercise: Exercise) => void;
  onQuickStart: (exercise: Exercise) => void;
}

const CATEGORIES: MuscleGroup[] = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Shoulders'];

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  onSelectExercise,
  onQuickStart,
}) => {
  const { theme, burnedColor } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');

  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;
    return matchesSearch && matchesMuscle && matchesDifficulty;
  });

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-md mx-auto text-white">
      {/* Header */}
      <div className="mb-4">
        <span className="text-[10px] uppercase font-extrabold tracking-widest" style={{ color: theme.primary }}>
          Exercise Library
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-0.5">
          Types of Exercises
        </h1>
        <p className="text-xs text-[#8E95A5]">
          Targeted compound lifts and hypertrophy movements with strict biomechanics.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by movement or equipment..."
          className="w-full bg-[#12141D] border border-[#23283A] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#60677A] focus:outline-none transition"
          style={{ borderColor: searchQuery ? theme.primary : undefined }}
        />
      </div>

      {/* Muscle Group Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 mb-3">
        {CATEGORIES.map((category) => {
          const isSelected = selectedMuscle === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedMuscle(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isSelected
                  ? 'shadow-md font-extrabold'
                  : 'bg-[#12141D] border border-[#202534] text-[#8E95A5] hover:text-white'
              }`}
              style={isSelected ? {
                backgroundColor: theme.primary,
                color: theme.primaryContrast,
                boxShadow: `0 4px 12px ${theme.primary}25`
              } : undefined}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Exercises Count */}
      <div className="flex items-center justify-between text-xs text-[#8E95A5] mb-3">
        <span>{filteredExercises.length} Movements Available</span>
        <span className="font-mono text-[11px] font-bold" style={{ color: theme.primary }}>AuraFit Pro DB</span>
      </div>

      {/* Exercises Grid List */}
      <div className="space-y-3">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="rounded-3xl bg-[#12141D] border border-[#222738] p-3.5 hover:border-[#353D52] transition-all group"
          >
            <div className="flex items-start gap-3.5">
              {/* Exercise Thumbnail */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#1A1D2B] shrink-0">
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span 
                  className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold"
                  style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                >
                  {exercise.difficulty[0]}
                </span>
              </div>

              {/* Movement Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: theme.primary }}>
                    {exercise.muscleGroup}
                  </span>
                  <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: burnedColor }}>
                    <Flame className="w-3 h-3" style={{ color: burnedColor }} /> {exercise.caloriesBurn} kcal
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight truncate transition-colors mt-0.5">
                  {exercise.name}
                </h3>

                <p className="text-[11px] text-[#8E95A5] truncate mt-0.5">
                  {exercise.equipment}
                </p>

                {/* Default Protocol Badges */}
                <div className="flex items-center gap-2 mt-2">
                  <span 
                    className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
                    style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
                  >
                    {exercise.defaultSets} Sets × {exercise.defaultReps} Reps
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1B2030] text-[#CBD3E3] text-[10px] font-medium">
                    {exercise.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips & Action Bar */}
            <div className="mt-3 pt-2.5 border-t border-[#1C2130] flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#8E95A5] truncate italic">
                Tip: {exercise.tips[0]}
              </span>
              <button
                onClick={() => onQuickStart(exercise)}
                className="px-3 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 transition shrink-0 active:scale-95 shadow-md"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryContrast,
                  boxShadow: `0 4px 10px ${theme.primary}25`
                }}
              >
                <Play className="w-3 h-3 fill-current stroke-none" />
                <span>Track Lift</span>
              </button>
            </div>
          </div>
        ))}

        {filteredExercises.length === 0 && (
          <div className="p-8 text-center bg-[#12141D] rounded-3xl border border-[#222738] space-y-2">
            <Dumbbell className="w-10 h-10 text-[#8E95A5] mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-white">No Exercises Match Filter</h4>
            <p className="text-xs text-[#8E95A5]">
              Try searching another muscle group or clearing your search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
