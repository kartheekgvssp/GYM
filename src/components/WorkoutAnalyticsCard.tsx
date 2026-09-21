import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { Activity, Dumbbell, PieChart as PieIcon, Flame, Clock, Layers } from 'lucide-react';
import { DayWorkoutPlan, DailyStats, MuscleGroup } from '../types';
import { EXERCISE_DATABASE, PRELOADED_WORKOUT_OPTIONS } from '../data/mockData';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';

interface WorkoutAnalyticsCardProps {
  weeklyPlan: DayWorkoutPlan[];
  stats?: DailyStats;
}

type AnalyticsTab = 'volume' | 'muscles';
type VolumeMetric = 'minutes' | 'sets';

export const WorkoutAnalyticsCard: React.FC<WorkoutAnalyticsCardProps> = ({
  weeklyPlan,
  stats,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('volume');
  const [volumeMetric, setVolumeMetric] = useState<VolumeMetric>('minutes');

  // --- 1. Compute Weekly Volume Chart Data ---
  const volumeData = useMemo(() => {
    return weeklyPlan.map((dayPlan, index) => {
      const isCompleted = stats?.weeklyConsistency?.[index] ?? false;
      const count = dayPlan.isRestDay 
        ? 0 
        : (dayPlan.exerciseIds?.length ?? dayPlan.exercisesCount ?? 3);
      const sets = count * 4; // Average 4 sets per exercise
      const minutes = dayPlan.isRestDay ? 0 : (dayPlan.estimatedMinutes || 40);

      // Estimated calories burned
      let calories = 0;
      if (!dayPlan.isRestDay) {
        if (dayPlan.exerciseIds && dayPlan.exerciseIds.length > 0) {
          calories = dayPlan.exerciseIds.reduce((acc, id) => {
            const ex = EXERCISE_DATABASE.find(e => e.id === id);
            return acc + (ex?.caloriesBurn || 110);
          }, 0);
        } else {
          const preset = PRELOADED_WORKOUT_OPTIONS.find(p => p.id === dayPlan.presetWorkoutId);
          calories = preset?.calories || minutes * 10;
        }
      }

      return {
        day: dayPlan.dayShort,
        fullDay: dayPlan.day,
        minutes,
        sets,
        calories,
        isRestDay: dayPlan.isRestDay,
        isCompleted,
        workoutTitle: dayPlan.workoutTitle,
        targetMuscle: dayPlan.targetMuscle,
      };
    });
  }, [weeklyPlan, stats]);

  // Aggregate totals
  const totalMinutes = useMemo(() => volumeData.reduce((sum, d) => sum + d.minutes, 0), [volumeData]);
  const totalSets = useMemo(() => volumeData.reduce((sum, d) => sum + d.sets, 0), [volumeData]);
  const activeWorkoutDays = useMemo(() => volumeData.filter(d => !d.isRestDay).length, [volumeData]);

  // --- 2. Compute Muscle Group Distribution Data ---
  const muscleDistributionData = useMemo(() => {
    const counts: Record<string, number> = {
      Chest: 0,
      Back: 0,
      Legs: 0,
      Shoulders: 0,
      Arms: 0,
      Core: 0,
    };

    weeklyPlan.forEach(day => {
      if (day.isRestDay) return;

      if (day.exerciseIds && day.exerciseIds.length > 0) {
        day.exerciseIds.forEach(id => {
          const ex = EXERCISE_DATABASE.find(e => e.id === id);
          if (ex && counts[ex.muscleGroup] !== undefined) {
            counts[ex.muscleGroup] += 1;
          }
        });
      } else if (day.targetMuscle && day.targetMuscle !== 'All' && counts[day.targetMuscle] !== undefined) {
        counts[day.targetMuscle] += (day.exercisesCount || 4);
      } else {
        // Compound / full body fallback
        counts.Chest += 1;
        counts.Back += 1;
        counts.Legs += 1;
        counts.Shoulders += 1;
      }
    });

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    // Muscle colors: First one uses theme.primary
    const muscleColorMap: Record<string, string> = {
      Chest: theme.primary,
      Back: '#00E5FF',       // Neon Cyan
      Legs: '#10B981',       // Emerald
      Shoulders: '#A855F7',  // Purple
      Arms: '#F59E0B',       // Amber
      Core: '#F43F5E',       // Rose / Crimson
    };

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
        color: muscleColorMap[name] || '#8E95A5',
      }))
      .filter(item => item.value > 0);
  }, [weeklyPlan, theme.primary]);

  const totalMuscleExercises = useMemo(() => {
    return muscleDistributionData.reduce((sum, item) => sum + item.value, 0);
  }, [muscleDistributionData]);

  // Tab switcher
  const handleTabChange = (tab: AnalyticsTab) => {
    haptics.trigger('selection');
    setActiveTab(tab);
  };

  // Metric switcher
  const handleMetricToggle = (metric: VolumeMetric) => {
    haptics.trigger('light');
    setVolumeMetric(metric);
  };

  return (
    <div className="rounded-3xl bg-[#12141D] border border-[#222738] p-4 shadow-xl shadow-black/50 mb-5 relative overflow-hidden">
      {/* Glow highlight */}
      <div 
        className="absolute top-0 right-1/4 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ backgroundColor: theme.primary }}
      />

      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
            style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
          >
            {activeTab === 'volume' ? <Activity className="w-4 h-4" /> : <PieIcon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Training Analytics
            </h3>
            <p className="text-[10px] text-[#8E95A5]">
              {activeTab === 'volume' ? 'Weekly Volume Load & Duration' : 'Target Muscle Distribution'}
            </p>
          </div>
        </div>

        {/* Segmented control */}
        <div className="flex items-center bg-[#0B0D13] p-0.5 rounded-xl border border-[#1E2333]">
          <button
            type="button"
            onClick={() => handleTabChange('volume')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
              activeTab === 'volume'
                ? 'shadow-sm text-[#0A0B0F]'
                : 'text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'volume' ? {
              backgroundColor: theme.primary,
              color: theme.primaryContrast
            } : undefined}
          >
            Volume
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('muscles')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
              activeTab === 'muscles'
                ? 'shadow-sm text-[#0A0B0F]'
                : 'text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'muscles' ? {
              backgroundColor: theme.primary,
              color: theme.primaryContrast
            } : undefined}
          >
            Split
          </button>
        </div>
      </div>

      {/* TAB 1: WEEKLY WORKOUT VOLUME CHART */}
      {activeTab === 'volume' && (
        <div className="space-y-3">
          {/* Sub-Metric selector & Quick stat */}
          <div className="flex items-center justify-between text-[11px] pt-1 pb-1">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[#8E95A5]">Total:</span>
              <strong className="text-white">
                {volumeMetric === 'minutes' ? `${totalMinutes} mins` : `${totalSets} sets`}
              </strong>
              <span className="text-[#5A6173]">({activeWorkoutDays} days)</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMetricToggle('minutes')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all ${
                  volumeMetric === 'minutes'
                    ? 'bg-[#1D2232] text-white font-bold border border-[#313A52]'
                    : 'text-[#6C7489] hover:text-[#CBD3E3]'
                }`}
              >
                Minutes
              </button>
              <button
                type="button"
                onClick={() => handleMetricToggle('sets')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all ${
                  volumeMetric === 'sets'
                    ? 'bg-[#1D2232] text-white font-bold border border-[#313A52]'
                    : 'text-[#6C7489] hover:text-[#CBD3E3]'
                }`}
              >
                Sets
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart Container */}
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeData}
                margin={{ top: 8, right: 4, left: -26, bottom: 0 }}
              >
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E95A5', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#5A6173', fontSize: 9 }}
                  width={34}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-[#0E111A] border border-[#252C3E] p-2.5 shadow-2xl text-xs space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-extrabold text-white">{data.fullDay}</span>
                            {data.isRestDay ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1C202F] text-[#8E95A5]">
                                Rest Day
                              </span>
                            ) : (
                              <span 
                                className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                                style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                              >
                                {data.targetMuscle}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#A6AFC2] truncate max-w-[170px]">
                            {data.workoutTitle}
                          </div>
                          {!data.isRestDay && (
                            <div className="flex items-center gap-3 pt-1 border-t border-[#1C2130] text-[10px] font-mono text-[#CBD3E3]">
                              <span>⏱ <strong>{data.minutes}m</strong></span>
                              <span>🏋️ <strong>{data.sets} sets</strong></span>
                              <span>🔥 <strong>{data.calories} kcal</strong></span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={volumeMetric}
                  radius={[6, 6, 2, 2]}
                  maxBarSize={28}
                >
                  {volumeData.map((entry, index) => {
                    // Rest day vs active day vs completed day
                    if (entry.isRestDay) {
                      return <Cell key={`cell-${index}`} fill="#181C28" />;
                    }
                    if (entry.isCompleted) {
                      return <Cell key={`cell-${index}`} fill={theme.primary} />;
                    }
                    return <Cell key={`cell-${index}`} fill={`${theme.primary}99`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend / Key indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1C2130] text-[10px] text-[#8E95A5]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                Scheduled Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#181C28] border border-[#2B3144]" />
                Rest / Recovery
              </span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: theme.primary }}>
              Goal: 4-5d/wk
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: MUSCLE GROUP DISTRIBUTION DONUT */}
      {activeTab === 'muscles' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-[#8E95A5] font-medium">Weekly Exercise Ratio</span>
            <span className="font-mono text-white text-xs font-bold">
              {totalMuscleExercises} Total Movements
            </span>
          </div>

          {/* Donut Chart & Legend Split */}
          <div className="flex items-center gap-2">
            {/* Donut Container */}
            <div className="h-44 w-44 shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-[#0E111A] border border-[#252C3E] p-2 shadow-2xl text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-white">
                              <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: data.color }} 
                              />
                              <span>{data.name}</span>
                            </div>
                            <div className="text-[11px] font-mono text-[#A6AFC2] mt-0.5">
                              {data.value} exercises • <strong className="text-white">{data.percentage}%</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={muscleDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    stroke="#12141D"
                    strokeWidth={2}
                  >
                    {muscleDistributionData.map((entry, index) => (
                      <Cell key={`muscle-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Stat Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-white leading-tight">
                  {muscleDistributionData.length}
                </span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-[#8E95A5]">
                  Splits
                </span>
              </div>
            </div>

            {/* Muscle Group Percentages Breakdown */}
            <div className="flex-1 space-y-1.5 pr-1">
              {muscleDistributionData.map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-[#0B0D13] border border-[#1A1F2D]"
                >
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-[11px] font-semibold text-white truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="text-[#8E95A5]">{item.value}ex</span>
                    <span className="font-bold text-white">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanatory summary */}
          <div className="pt-2 border-t border-[#1C2130] flex items-center justify-between text-[10px] text-[#8E95A5]">
            <span>Driven by active weekly setup schedule</span>
            <span className="font-mono text-[#00E5FF]">Balanced Push/Pull/Legs</span>
          </div>
        </div>
      )}
    </div>
  );
};
