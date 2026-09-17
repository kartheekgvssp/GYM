import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { RestTimer } from '../components/RestTimer';
import { PlateCalculator } from '../components/PlateCalculator';
import { Template, TemplateExercise, LoggedSetState } from '../types';
import { Check, Plus, Dumbbell, Flag, Sparkles, Trash2, Calculator, Trophy } from 'lucide-react';
import { haptics } from '../lib/haptics';

export const LogSession: React.FC = () => {
  const { templateId } = useParams<{ templateId?: string }>();
  const navigate = useNavigate();
  const { user, unit } = useAuth();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loggedSets, setLoggedSets] = useState<Record<string, LoggedSetState[]>>({});
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, { weight: number; reps: number } | null>>({});
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [saveAllStatus, setSaveAllStatus] = useState<string | null>(null);

  // Plate Calculator Modal state
  const [calcModal, setCalcModal] = useState<{
    open: boolean;
    exerciseName: string;
    setIndex: number;
    initialWeight: number;
  }>({
    open: false,
    exerciseName: '',
    setIndex: 0,
    initialWeight: 0,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('templates')
        .select('id, name, template_exercises(id, name, target_sets, target_reps, order_index)')
        .order('created_at', { ascending: false });

      if (data) {
        const parsed = data.map((t: any) => ({
          ...t,
          template_exercises: (t.template_exercises || []).sort(
            (a: TemplateExercise, b: TemplateExercise) => a.order_index - b.order_index
          ),
        }));
        setTemplates(parsed);

        if (templateId) {
          const found = parsed.find((t: Template) => t.id === templateId);
          if (found) {
            selectTemplate(found);
          }
        }
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }

  async function selectTemplate(t: Template) {
    haptics.tap();
    setSelectedTemplate(t);
    const initial: Record<string, LoggedSetState[]> = {};
    t.template_exercises.forEach((ex) => {
      initial[ex.name] = Array.from({ length: ex.target_sets }, () => ({
        reps: ex.target_reps,
        weight: '',
        saved: false,
      }));
    });
    setLoggedSets(initial);

    loadPastSetsForExercises(t.template_exercises.map((e) => e.name));

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user?.id || 'usr_demo_athlete',
          template_id: t.id,
        })
        .select()
        .single();

      if (!error && data) {
        setSessionId(data.id);
      }
    } catch {
      setSessionId('ses_active_' + Date.now());
    }
  }

  async function loadPastSetsForExercises(names: string[]) {
    try {
      const historyMap: Record<string, { weight: number; reps: number } | null> = {};
      await Promise.all(
        names.map(async (name) => {
          const { data } = await supabase
            .from('session_sets')
            .select('weight, reps')
            .eq('exercise_name', name)
            .order('weight', { ascending: false })
            .limit(1);
          historyMap[name] = data && data[0] ? { weight: data[0].weight, reps: data[0].reps } : null;
        })
      );
      setExerciseHistory(historyMap);
    } catch {
      // Handled
    }
  }

  function updateSet(exerciseName: string, idx: number, field: keyof LoggedSetState, value: any) {
    setLoggedSets((prev) => ({
      ...prev,
      [exerciseName]: (prev[exerciseName] || []).map((s, i) =>
        i === idx ? { ...s, [field]: value, saved: false } : s
      ),
    }));
  }

  function stepWeight(exerciseName: string, idx: number, delta: number) {
    haptics.step();
    setLoggedSets((prev) => {
      const currentVal = Number(prev[exerciseName]?.[idx]?.weight) || 0;
      const step = Math.max(0, Math.round((currentVal + delta) * 10) / 10);
      return {
        ...prev,
        [exerciseName]: (prev[exerciseName] || []).map((s, i) =>
          i === idx ? { ...s, weight: step === 0 ? '' : step, saved: false } : s
        ),
      };
    });
  }

  function addSet(exerciseName: string) {
    haptics.step();
    setLoggedSets((prev) => {
      const existing = prev[exerciseName] || [];
      const last = existing[existing.length - 1];
      return {
        ...prev,
        [exerciseName]: [
          ...existing,
          {
            reps: last?.reps || 10,
            weight: last?.weight || '',
            saved: false,
          },
        ],
      };
    });
  }

  function removeSet(exerciseName: string, idx: number) {
    haptics.warning();
    setLoggedSets((prev) => ({
      ...prev,
      [exerciseName]: (prev[exerciseName] || []).filter((_, i) => i !== idx),
    }));
  }

  async function saveSet(exerciseName: string, idx: number) {
    const set = loggedSets[exerciseName]?.[idx];
    if (!set || set.reps === '' || set.weight === '') return;

    const numWeight = Number(set.weight);
    const pastBest = exerciseHistory[exerciseName];
    const isNewPR = pastBest ? numWeight > pastBest.weight : numWeight > 0;

    if (isNewPR) {
      haptics.prCelebration();
    } else {
      haptics.success();
    }

    try {
      await supabase.from('session_sets').insert({
        session_id: sessionId,
        exercise_name: exerciseName,
        set_number: idx + 1,
        reps: Number(set.reps),
        weight: numWeight,
      });

      setLoggedSets((prev) => ({
        ...prev,
        [exerciseName]: prev[exerciseName].map((s, i) => (i === idx ? { ...s, saved: true } : s)),
      }));

      // Update past best in state if higher
      if (!pastBest || numWeight > pastBest.weight) {
        setExerciseHistory((prev) => ({
          ...prev,
          [exerciseName]: { weight: numWeight, reps: Number(set.reps) },
        }));
      }
    } catch {
      setLoggedSets((prev) => ({
        ...prev,
        [exerciseName]: prev[exerciseName].map((s, i) => (i === idx ? { ...s, saved: true } : s)),
      }));
    }
  }

  async function saveAllSets() {
    haptics.tap();
    if (!sessionId || !selectedTemplate) return;
    setSaveAllStatus('Saving all entered sets...');
    let count = 0;

    for (const [exName, sets] of Object.entries(loggedSets)) {
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        if (!s.saved && s.weight !== '' && s.reps !== '') {
          await saveSet(exName, i);
          count++;
        }
      }
    }
    setSaveAllStatus(count > 0 ? `Saved ${count} sets!` : 'All active sets saved.');
    setTimeout(() => setSaveAllStatus(null), 2500);
  }

  async function finishSession() {
    haptics.sessionFinished();
    setFinishing(true);

    for (const [exName, sets] of Object.entries(loggedSets)) {
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        if (!s.saved && s.weight !== '' && s.reps !== '') {
          await saveSet(exName, i);
        }
      }
    }

    try {
      if (sessionId) {
        await supabase
          .from('sessions')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    } catch {
      // Handled
    } finally {
      navigate('/progress');
    }
  }

  function openPlateCalc(exerciseName: string, idx: number) {
    haptics.tap();
    const current = Number(loggedSets[exerciseName]?.[idx]?.weight) || 0;
    setCalcModal({
      open: true,
      exerciseName,
      setIndex: idx,
      initialWeight: current,
    });
  }

  function applyPlateCalcWeight(weight: number) {
    if (!calcModal.exerciseName) return;
    updateSet(calcModal.exerciseName, calcModal.setIndex, 'weight', weight);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-10 text-center text-[#8B8F98] text-xs font-mono">
        Loading workout session...
      </div>
    );
  }

  // --- Template Selection View (Trimmed down, low profile) ---
  if (!selectedTemplate) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between border-b border-[#22252C] pb-3 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#E8B347] font-semibold">
              Live Session
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#EDEEF0] uppercase tracking-wide">
              Select Workout
            </h1>
          </div>
          <Link
            to="/templates"
            onClick={() => haptics.tap()}
            className="btn-ghost text-xs py-1 px-2.5 text-[#E8B347] border-[#E8B347]/30 hover:border-[#E8B347]"
          >
            + New Routine
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="card p-6 text-center border border-[#22252C] bg-[#15171C]">
            <Dumbbell className="w-7 h-7 text-[#E8B347] mx-auto mb-2 opacity-80" />
            <h3 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide mb-1">
              No Routines Configured
            </h3>
            <p className="text-[#8B8F98] text-xs max-w-sm mx-auto mb-4 font-sans">
              Create a workout template to start logging exercises with instant haptics and rest timers.
            </p>
            <Link to="/templates" onClick={() => haptics.tap()} className="btn-primary text-xs py-1.5 px-3">
              Build a Routine
            </Link>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {templates.map((t) => (
              <button
                key={t.id}
                id={`select-tpl-${t.id}`}
                className="card p-3.5 text-left border border-[#22252C] bg-[#15171C] hover:border-[#E8B347]/70 transition-all group flex flex-col justify-between"
                onClick={() => selectTemplate(t)}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h2 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide group-hover:text-[#E8B347] transition-colors truncate">
                      {t.name}
                    </h2>
                    <span className="text-[10px] font-mono text-[#E8B347] bg-[#E8B347]/10 px-1.5 py-0.5 border border-[#E8B347]/30 rounded-[1px] shrink-0">
                      {t.template_exercises.length} Ex
                    </span>
                  </div>

                  <div className="text-[11px] text-[#8B8F98] space-y-0.5 mb-3 font-sans">
                    {t.template_exercises.slice(0, 3).map((ex, i) => (
                      <div key={i} className="truncate text-[#8B8F98]">
                        • {ex.name} ({ex.target_sets} sets)
                      </div>
                    ))}
                    {t.template_exercises.length > 3 && (
                      <div className="text-[#8B8F98]/70 italic text-[10px]">
                        +{t.template_exercises.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8B347] flex items-center justify-between border-t border-[#22252C] pt-2">
                  <span>Start Workout</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Active Workout Screen (Low-profile, trimmed athletic layout) ---
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
      {/* Sleek Session Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#22252C] pb-3 mb-3.5 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6FCF97] animate-ping shrink-0" />
          <h1 className="font-display text-xl sm:text-2xl text-[#EDEEF0] uppercase tracking-wide truncate">
            {selectedTemplate.name}
          </h1>
          <span className="text-[10px] font-mono uppercase bg-[#0E1013] border border-[#22252C] px-1.5 py-0.5 text-[#8B8F98]">
            {unit}
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            id="save-all-sets-btn"
            type="button"
            onClick={saveAllSets}
            className="btn-ghost text-[11px] py-1 px-2 border-[#22252C] uppercase tracking-wider text-[#8B8F98] hover:text-[#EDEEF0]"
            title="Save all sets with entered weights"
          >
            Save All
          </button>
          <button
            id="finish-session-btn"
            type="button"
            className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
            onClick={finishSession}
            disabled={finishing}
          >
            <Flag className="w-3 h-3 fill-current" />
            <span>{finishing ? 'Finishing...' : 'Finish Workout'}</span>
          </button>
        </div>
      </div>

      {saveAllStatus && (
        <div className="p-2 bg-[#6FCF97]/10 border border-[#6FCF97]/40 text-[#6FCF97] text-[11px] font-mono mb-3 rounded-[2px]">
          {saveAllStatus}
        </div>
      )}

      {/* Equipment-style Low-Profile Rest Timer */}
      <div className="mb-4">
        <RestTimer />
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
        {selectedTemplate.template_exercises.map((ex, exIdx) => {
          const pastBest = exerciseHistory[ex.name];
          const sets = loggedSets[ex.name] || [];

          return (
            <div
              key={ex.id || exIdx}
              className="card p-3 sm:p-3.5 border border-[#22252C] bg-[#15171C]"
            >
              {/* Exercise Header Strip */}
              <div className="flex items-center justify-between border-b border-[#22252C] pb-2 mb-2.5 gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[10px] text-[#E8B347] font-bold shrink-0">
                    #{exIdx + 1}
                  </span>
                  <h2 className="font-display text-base sm:text-lg text-[#EDEEF0] tracking-wide uppercase truncate">
                    {ex.name}
                  </h2>
                  <span className="text-[10px] text-[#8B8F98] font-mono shrink-0 hidden xs:inline">
                    ({ex.target_sets}×{ex.target_reps})
                  </span>
                </div>

                {pastBest && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#8B8F98] bg-[#0E1013] px-2 py-0.5 border border-[#22252C] rounded-[2px] shrink-0">
                    <Trophy className="w-2.5 h-2.5 text-[#E8B347]" />
                    <span>
                      PR: <strong className="text-[#EDEEF0]">{pastBest.weight} {unit}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* High-Efficiency Set Rows */}
              <div className="space-y-1.5 mb-2.5">
                {sets.map((set, idx) => {
                  const numWeight = Number(set.weight) || 0;
                  const isPRCandidate = pastBest ? numWeight > pastBest.weight : numWeight > 0;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 p-1.5 rounded-[2px] border transition-all ${
                        set.saved
                          ? 'bg-[#0E1013] border-[#6FCF97]/40'
                          : 'bg-[#0E1013] border-[#22252C] hover:border-[#2D313A]'
                      }`}
                    >
                      {/* Set Index Pill */}
                      <span className="text-[10px] font-mono uppercase text-[#8B8F98] w-7 shrink-0 text-center font-bold">
                        S{idx + 1}
                      </span>

                      {/* Reps input */}
                      <div className="flex items-center gap-1">
                        <input
                          id={`reps-${exIdx}-${idx}`}
                          type="number"
                          min="1"
                          placeholder="reps"
                          className="input-field w-12 py-1 px-1 text-center font-mono text-xs"
                          value={set.reps}
                          onChange={(e) => updateSet(ex.name, idx, 'reps', e.target.value)}
                        />
                        <span className="text-[10px] text-[#8B8F98] font-mono hidden sm:inline">r</span>
                      </div>

                      <span className="text-[#8B8F98] text-[10px]">×</span>

                      {/* Weight input */}
                      <div className="flex items-center gap-1">
                        <input
                          id={`weight-${exIdx}-${idx}`}
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder={unit}
                          className="input-field w-16 py-1 px-1 text-center font-mono text-xs"
                          value={set.weight}
                          onChange={(e) => updateSet(ex.name, idx, 'weight', e.target.value)}
                        />
                        <span className="text-[10px] text-[#8B8F98] font-mono uppercase hidden sm:inline">{unit}</span>
                      </div>

                      {/* Quick Stepper Notch Buttons (-2.5, +2.5 or -5, +5) */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => stepWeight(ex.name, idx, unit === 'kg' ? -2.5 : -5)}
                          className="w-6 h-6 flex items-center justify-center text-[10px] font-mono text-[#8B8F98] hover:text-[#EDEEF0] bg-[#15171C] border border-[#22252C] rounded-[1px] active:scale-95"
                          title={`Subtract ${unit === 'kg' ? '2.5kg' : '5lb'}`}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => stepWeight(ex.name, idx, unit === 'kg' ? 2.5 : 5)}
                          className="w-6 h-6 flex items-center justify-center text-[10px] font-mono text-[#E8B347] hover:text-[#EDEEF0] bg-[#15171C] border border-[#22252C] rounded-[1px] active:scale-95"
                          title={`Add ${unit === 'kg' ? '2.5kg' : '5lb'}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Plate Calculator Icon Trigger */}
                      <button
                        type="button"
                        onClick={() => openPlateCalc(ex.name, idx)}
                        className="p-1 text-[#8B8F98] hover:text-[#E8B347] border border-[#22252C] rounded-[1px] hover:border-[#E8B347]/50"
                        title="Barbell Plate Math Calculator"
                      >
                        <Calculator className="w-3 h-3" />
                      </button>

                      {/* New PR Badge Indicator */}
                      {isPRCandidate && numWeight > 0 && (
                        <span className="hidden md:inline-flex items-center gap-0.5 text-[9px] font-mono text-[#E8B347] font-bold uppercase bg-[#E8B347]/10 px-1 py-0.5 border border-[#E8B347]/30">
                          <Sparkles className="w-2.5 h-2.5" /> PR
                        </span>
                      )}

                      {/* Actions */}
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          id={`save-set-${exIdx}-${idx}`}
                          type="button"
                          className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-[1px] transition-all flex items-center gap-1 ${
                            set.saved
                              ? 'border border-[#6FCF97] text-[#6FCF97] bg-[#6FCF97]/15'
                              : 'border border-[#22252C] text-[#EDEEF0] bg-[#15171C] hover:border-[#E8B347]'
                          }`}
                          onClick={() => saveSet(ex.name, idx)}
                        >
                          {set.saved ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Done</span>
                            </>
                          ) : (
                            'Save'
                          )}
                        </button>

                        {sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(ex.name, idx)}
                            className="p-1 text-[#8B8F98] hover:text-[#E36565] transition-colors"
                            title="Remove set"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Set Row */}
              <button
                id={`add-set-${exIdx}`}
                type="button"
                className="btn-ghost text-[10px] uppercase tracking-wider py-1 px-2 flex items-center gap-1 text-[#E8B347] border-[#E8B347]/30 hover:border-[#E8B347]"
                onClick={() => addSet(ex.name)}
              >
                <Plus className="w-3 h-3" />
                <span>Add Set</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Plate Math Modal */}
      {calcModal.open && (
        <PlateCalculator
          initialWeight={calcModal.initialWeight}
          unit={unit}
          onClose={() => setCalcModal((prev) => ({ ...prev, open: false }))}
          onApply={applyPlateCalcWeight}
        />
      )}

      {/* Bottom Sticky-friendly Finish Button */}
      <div className="mt-6 pt-4 border-t border-[#22252C] flex justify-end">
        <button
          id="finish-session-bottom-btn"
          type="button"
          className="btn-primary px-5 py-2 text-sm flex items-center gap-1.5"
          onClick={finishSession}
          disabled={finishing}
        >
          <Flag className="w-3.5 h-3.5 fill-current" />
          <span>{finishing ? 'Completing Session...' : 'Complete Workout'}</span>
        </button>
      </div>
    </div>
  );
};
