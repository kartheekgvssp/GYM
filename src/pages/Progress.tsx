import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { Trophy, TrendingUp, Search, Calendar, Sparkles } from 'lucide-react';
import { SessionSet } from '../types';
import { haptics } from '../lib/haptics';

interface ChartPoint {
  date: string;
  weight: number;
  reps: number;
  rawDate: string;
}

export const Progress: React.FC = () => {
  const { unit } = useAuth();
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawSets, setRawSets] = useState<SessionSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExerciseNames();
  }, []);

  useEffect(() => {
    if (selected) {
      loadChartData(selected);
    }
  }, [selected]);

  async function loadExerciseNames() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('session_sets').select('exercise_name');
      if (!error && data && data.length > 0) {
        const unique: string[] = Array.from(new Set<string>(data.map((d: any) => String(d.exercise_name)))).sort();
        setExerciseNames(unique);
        if (unique.length > 0) {
          setSelected(unique[0]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  async function loadChartData(exerciseName: string) {
    try {
      const { data, error } = await supabase
        .from('session_sets')
        .select('weight, reps, created_at, session_id')
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setRawSets(data as SessionSet[]);

        const byDate: Record<string, ChartPoint> = {};
        data.forEach((row: any) => {
          if (row.weight === null || row.weight === undefined) return;
          const dt = new Date(row.created_at);
          const dateStr = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const numWeight = Number(row.weight);

          if (!byDate[dateStr] || numWeight > byDate[dateStr].weight) {
            byDate[dateStr] = {
              date: dateStr,
              weight: numWeight,
              reps: Number(row.reps) || 0,
              rawDate: row.created_at,
            };
          }
        });

        const sortedPoints = Object.values(byDate).sort(
          (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
        );
        setChartData(sortedPoints);
      }
    } catch {
      // Handled
    }
  }

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exerciseNames;
    return exerciseNames.filter((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [exerciseNames, searchQuery]);

  const allTimePR = useMemo(() => {
    if (chartData.length === 0) return null;
    let max = chartData[0];
    for (const pt of chartData) {
      if (pt.weight > max.weight) {
        max = pt;
      }
    }
    return max;
  }, [chartData]);

  const latestLift = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Sleek Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#22252C] pb-3 mb-4 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#E8B347] font-semibold">
            Analytics & Progression
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDEEF0] uppercase tracking-wide">
            Progress Tracking
          </h1>
        </div>

        {allTimePR && (
          <div className="flex items-center gap-2 bg-[#15171C] border border-[#E8B347]/30 px-3 py-1.5 rounded-[2px] self-start sm:self-auto">
            <Trophy className="w-4 h-4 text-[#E8B347] shrink-0" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#8B8F98] font-mono">
                PR ({selected})
              </div>
              <div className="font-display text-lg text-[#EDEEF0] font-bold leading-tight">
                {allTimePR.weight} <span className="text-xs font-mono text-[#E8B347] uppercase">{unit}</span>{' '}
                <span className="text-[11px] font-normal text-[#8B8F98]">× {allTimePR.reps}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-[#8B8F98] text-xs py-4 text-center font-mono">Loading progression curves...</p>
      ) : exerciseNames.length === 0 ? (
        <div className="card p-6 text-center border border-[#22252C] bg-[#15171C]">
          <TrendingUp className="w-8 h-8 text-[#E8B347] mx-auto mb-2 opacity-80" />
          <h3 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide mb-1">
            No Progress Data Yet
          </h3>
          <p className="text-[#8B8F98] text-xs max-w-sm mx-auto mb-4 font-sans">
            Complete and save workout sets in the Live Session tab to populate real-time strength charts.
          </p>
        </div>
      ) : (
        <>
          {/* Exercise Search & Selection Bar */}
          <div className="mb-3.5 space-y-2">
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#8B8F98] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="exercise-search-input"
                type="text"
                placeholder="Filter lifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-8 py-1 text-xs"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1 scrollbar-none">
              {filteredExercises.map((name) => (
                <button
                  key={name}
                  id={`select-ex-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className={`text-[11px] py-1 px-2.5 uppercase tracking-wider font-semibold border rounded-[2px] transition-all ${
                    selected === name
                      ? 'border-[#E8B347] text-[#0E1013] bg-[#E8B347] font-bold'
                      : 'border-[#22252C] text-[#8B8F98] bg-[#15171C] hover:text-[#EDEEF0] hover:border-[#2D313A]'
                  }`}
                  onClick={() => {
                    haptics.tap();
                    setSelected(name);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chart Card */}
          <div className="card p-3.5 border border-[#22252C] bg-[#15171C] mb-3.5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#22252C] gap-2">
              <div>
                <h2 className="font-display text-xl text-[#EDEEF0] uppercase tracking-wide truncate">
                  {selected}
                </h2>
                <span className="text-[10px] text-[#8B8F98] font-mono">
                  Peak working weight per session ({unit})
                </span>
              </div>

              {latestLift && (
                <div className="text-[10px] font-mono text-[#8B8F98] bg-[#0E1013] px-2 py-1 border border-[#22252C] rounded-[2px]">
                  Latest: <strong className="text-[#EDEEF0]">{latestLift.weight} {unit}</strong>
                </div>
              )}
            </div>

            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-[#8B8F98] text-xs font-mono">
                No recorded weights for this exercise yet.
              </div>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#22252C" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#8B8F98"
                      tick={{ fill: '#8B8F98', fontSize: 10, fontFamily: 'Inter' }}
                      tickLine={{ stroke: '#22252C' }}
                      axisLine={{ stroke: '#22252C' }}
                    />
                    <YAxis
                      stroke="#8B8F98"
                      tick={{ fill: '#8B8F98', fontSize: 10, fontFamily: 'monospace' }}
                      tickLine={{ stroke: '#22252C' }}
                      axisLine={{ stroke: '#22252C' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ChartPoint;
                          return (
                            <div className="bg-[#15171C] border border-[#E8B347] p-2 text-xs shadow-xl rounded-[2px]">
                              <div className="text-[#8B8F98] font-mono text-[10px] mb-0.5">{label}</div>
                              <div className="font-display text-base text-[#EDEEF0] font-bold">
                                {data.weight} <span className="text-[10px] text-[#E8B347] font-mono uppercase">{unit}</span>
                              </div>
                              <div className="text-[10px] text-[#8B8F98]">
                                {data.reps} reps
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#E8B347"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#E8B347', stroke: '#0E1013', strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: '#EDEEF0', stroke: '#E8B347', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Historical Sets Table */}
          {rawSets.length > 0 && (
            <div className="card p-3.5 border border-[#22252C] bg-[#15171C]">
              <div className="flex items-center justify-between border-b border-[#22252C] pb-2 mb-2">
                <h3 className="font-display text-base text-[#EDEEF0] uppercase tracking-wide">
                  Logged Sets History
                </h3>
                <span className="text-[10px] font-mono text-[#8B8F98]">
                  {rawSets.length} sets
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-[#22252C] pr-1">
                {rawSets.slice().reverse().map((set, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B8F98] text-[10px]">
                        {new Date(set.created_at).toLocaleDateString(undefined, {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[#EDEEF0] font-bold">
                        {set.weight} {unit}
                      </span>
                      <span className="text-[#8B8F98] text-[11px]">× {set.reps} reps</span>
                    </div>
                    <span className="text-[10px] text-[#8B8F98]">
                      Set #{set.set_number || idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
