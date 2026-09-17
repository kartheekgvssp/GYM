import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Play, Dumbbell, LineChart, Flame, Calendar, ArrowRight, Database, Sparkles, Trophy } from 'lucide-react';
import { haptics } from '../lib/haptics';

interface DashboardStats {
  sessionCount: number;
  templateCount: number;
  streakDays: number;
  lastSession: any | null;
}

export const Dashboard: React.FC = () => {
  const { user, isCloudConnected, unit } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    sessionCount: 0,
    templateCount: 0,
    streakDays: 0,
    lastSession: null,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // 1. Templates
      const { data: tplData } = await supabase
        .from('templates')
        .select('id, name, template_exercises(id, name, target_sets, target_reps)')
        .order('created_at', { ascending: false });

      const templateCount = tplData?.length || 0;
      setTemplates(tplData || []);

      // 2. Sessions
      const { data: sesData } = await supabase
        .from('sessions')
        .select('id, started_at, completed_at, templates(name)')
        .order('started_at', { ascending: false });

      const sessions = sesData || [];
      const sessionCount = sessions.length;
      const lastSession = sessions[0] || null;

      // Calculate streak
      let streak = 0;
      if (sessions.length > 0) {
        const uniqueDates: string[] = Array.from(
          new Set<string>(
            sessions.map((s: any) => new Date(s.started_at).toISOString().split('T')[0])
          )
        ).sort().reverse();

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          streak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1]).getTime();
            const curr = new Date(uniqueDates[i]).getTime();
            const diffDays = Math.round((prev - curr) / (1000 * 3600 * 24));
            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }

      setStats({
        sessionCount,
        templateCount,
        streakDays: streak,
        lastSession,
      });

      setRecentSessions(sessions.slice(0, 4));
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }

  const firstName = user?.email?.split('@')[0] || 'Athlete';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Sleek Athlete Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#22252C] pb-3.5 mb-4 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#E8B347] font-semibold">
            Dashboard
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDEEF0] uppercase tracking-wide">
            Welcome back, <span className="text-[#E8B347]">{firstName}</span>
          </h1>
          <p className="text-[#8B8F98] text-xs mt-0.5">
            Unit: <strong className="text-[#EDEEF0] uppercase">{unit}</strong> • Ready to train today.
          </p>
        </div>

        <Link
          id="dashboard-start-workout-btn"
          to="/log"
          onClick={() => haptics.tap()}
          className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs shadow-xs self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Workout</span>
        </Link>
      </div>

      {/* Cloud Status banner - low profile */}
      {!isCloudConnected && (
        <div className="p-2.5 bg-[#15171C] border border-[#22252C] mb-4 flex items-center justify-between text-xs rounded-[2px]">
          <div className="flex items-center gap-2 text-[#8B8F98]">
            <Database className="w-3.5 h-3.5 text-[#E8B347] shrink-0" />
            <span>Local offline storage active. PWA ready for offline gym floors.</span>
          </div>
          <span className="text-[10px] font-mono text-[#6FCF97] bg-[#6FCF97]/10 px-1.5 py-0.5 border border-[#6FCF97]/30">
            Instant
          </span>
        </div>
      )}

      {/* Stat Grid - Low-profile, tight padding */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <StatCard
          id="stat-sessions"
          label="Sessions"
          value={loading ? '—' : stats.sessionCount}
          subtext="Completed"
        />
        <StatCard
          id="stat-streak"
          label="Streak"
          value={loading ? '—' : `${stats.streakDays}d`}
          icon={<Flame className="w-3.5 h-3.5 text-[#E8B347]" />}
          subtext="Active run"
        />
        <StatCard
          id="stat-templates"
          label="Routines"
          value={loading ? '—' : stats.templateCount}
          subtext="Configured"
        />
        <StatCard
          id="stat-last-workout"
          label="Last Session"
          value={
            loading
              ? '—'
              : stats.lastSession?.started_at
              ? new Date(stats.lastSession.started_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              : 'None'
          }
          icon={<Calendar className="w-3.5 h-3.5 text-[#8B8F98]" />}
          subtext={stats.lastSession?.templates?.name || 'Tap Start'}
        />
      </div>

      {/* Quick Routine Launchers if templates exist */}
      {templates.length > 0 && (
        <div className="card p-3 mb-4 border border-[#22252C] bg-[#15171C]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#22252C]">
            <span className="text-xs uppercase tracking-wider font-display text-[#EDEEF0]">
              Quick Start Workout
            </span>
            <Link
              to="/templates"
              onClick={() => haptics.tap()}
              className="text-[11px] text-[#E8B347] hover:underline font-mono"
            >
              All routines →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {templates.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                to={`/log/${t.id}`}
                onClick={() => haptics.tap()}
                className="p-2.5 bg-[#0E1013] border border-[#22252C] hover:border-[#E8B347] transition-all rounded-[2px] flex items-center justify-between group"
              >
                <div className="truncate pr-2">
                  <div className="font-display text-sm uppercase text-[#EDEEF0] group-hover:text-[#E8B347] transition-colors truncate">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-[#8B8F98] font-mono">
                    {t.template_exercises?.length || 0} exercises
                  </div>
                </div>
                <Play className="w-3 h-3 text-[#8B8F98] group-hover:text-[#E8B347] shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Bento Grid */}
      <div className="grid sm:grid-cols-3 gap-2.5 mb-4">
        <Link
          id="dash-action-log"
          to="/log"
          onClick={() => haptics.tap()}
          className="card p-3.5 hover:border-[#E8B347]/70 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-7 h-7 bg-[#0E1013] border border-[#22252C] flex items-center justify-center text-[#E8B347] mb-2 group-hover:border-[#E8B347]">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <h2 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide">
              Log Session
            </h2>
            <p className="text-[11px] text-[#8B8F98] mt-0.5 leading-normal">
              Track sets, barbell plate math, haptic clicks, and rest countdowns.
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8B347] inline-flex items-center gap-1 mt-3 group-hover:translate-x-0.5 transition-transform">
            Start session <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          id="dash-action-templates"
          to="/templates"
          onClick={() => haptics.tap()}
          className="card p-3.5 hover:border-[#E8B347]/70 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-7 h-7 bg-[#0E1013] border border-[#22252C] flex items-center justify-center text-[#E8B347] mb-2 group-hover:border-[#E8B347]">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide">
              Templates
            </h2>
            <p className="text-[11px] text-[#8B8F98] mt-0.5 leading-normal">
              Organize target sets, rep ranges, and custom exercise routines.
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8B347] inline-flex items-center gap-1 mt-3 group-hover:translate-x-0.5 transition-transform">
            Manage routines <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          id="dash-action-progress"
          to="/progress"
          onClick={() => haptics.tap()}
          className="card p-3.5 hover:border-[#E8B347]/70 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-7 h-7 bg-[#0E1013] border border-[#22252C] flex items-center justify-center text-[#E8B347] mb-2 group-hover:border-[#E8B347]">
              <LineChart className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide">
              Progress
            </h2>
            <p className="text-[11px] text-[#8B8F98] mt-0.5 leading-normal">
              Review personal records (PRs), volume trends, and lift histories.
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8B347] inline-flex items-center gap-1 mt-3 group-hover:translate-x-0.5 transition-transform">
            View charts <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="card p-3.5 border border-[#22252C]">
        <div className="flex items-center justify-between border-b border-[#22252C] pb-2 mb-2.5">
          <h2 className="font-display text-base uppercase tracking-wide text-[#EDEEF0]">
            Recent History
          </h2>
          <Link
            to="/progress"
            onClick={() => haptics.tap()}
            className="text-[10px] text-[#E8B347] hover:underline font-mono uppercase tracking-wider"
          >
            All logs →
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-[#8B8F98] py-3 text-center">Loading workout log...</p>
        ) : recentSessions.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-xs text-[#8B8F98] mb-2">No recorded workout sessions yet.</p>
            <Link to="/log" onClick={() => haptics.tap()} className="btn-primary text-xs py-1.5 px-3 inline-block">
              Log your first workout
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#22252C]">
            {recentSessions.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-display text-sm text-[#EDEEF0] tracking-wide">
                    {s.templates?.name || 'Workout Session'}
                  </div>
                  <div className="text-[10px] text-[#8B8F98] font-mono">
                    {new Date(s.started_at).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[#6FCF97]/10 text-[#6FCF97] border border-[#6FCF97]/30">
                  Completed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({
  id,
  label,
  value,
  icon,
  subtext,
}: {
  id?: string;
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subtext?: string;
}) {
  return (
    <div id={id} className="card p-2.5 border border-[#22252C] bg-[#15171C]">
      <div className="flex items-center justify-between text-[10px] text-[#8B8F98] uppercase tracking-wider font-mono mb-0.5">
        <span>{label}</span>
        {icon}
      </div>
      <div className="font-display text-2xl text-[#E8B347] font-bold tabular-nums tracking-tight">
        {value}
      </div>
      {subtext && <div className="text-[10px] text-[#8B8F98] font-mono truncate">{subtext}</div>}
    </div>
  );
}
