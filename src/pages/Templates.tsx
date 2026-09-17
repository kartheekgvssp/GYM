import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { Template, TemplateExercise } from '../types';
import { Dumbbell, Plus, Trash2, Edit3, X, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { haptics } from '../lib/haptics';

export const Templates: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{
    id: string | null;
    name: string;
    exercises: { id?: string; name: string; target_sets: number; target_reps: number }[];
  } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('id, name, template_exercises(id, name, target_sets, target_reps, order_index)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const sorted = data.map((t: any) => ({
          ...t,
          template_exercises: (t.template_exercises || []).sort(
            (a: TemplateExercise, b: TemplateExercise) => a.order_index - b.order_index
          ),
        }));
        setTemplates(sorted);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    haptics.warning();
    if (!window.confirm('Delete this template? Existing historical session logs will not be affected.')) return;
    try {
      await supabase.from('templates').delete().eq('id', id);
      haptics.success();
      loadTemplates();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete template');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#22252C] pb-3 mb-4 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#E8B347] font-semibold">
            Routines & Workouts
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDEEF0] uppercase tracking-wide">
            Workout Templates
          </h1>
        </div>

        {!editing && (
          <button
            id="new-template-btn"
            className="btn-primary inline-flex items-center gap-1.5 py-1.5 px-3 text-xs self-start sm:self-auto"
            onClick={() => {
              haptics.tap();
              setEditing({
                id: null,
                name: '',
                exercises: [{ name: '', target_sets: 3, target_reps: 10 }],
              });
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Routine</span>
          </button>
        )}
      </div>

      {loading && <p className="text-[#8B8F98] text-xs py-4 text-center font-mono">Loading routines...</p>}

      {!loading && templates.length === 0 && !editing && (
        <div className="card p-6 text-center border border-[#22252C] bg-[#15171C]">
          <Dumbbell className="w-8 h-8 text-[#E8B347] mx-auto mb-2 opacity-80" />
          <h3 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide mb-1">
            No Routines Created
          </h3>
          <p className="text-[#8B8F98] text-xs max-w-sm mx-auto mb-4 font-sans">
            Build your first routine (e.g. Push, Pull, Legs, Upper, Lower) to log sets systematically.
          </p>
          <button
            id="empty-create-template-btn"
            className="btn-primary text-xs py-1.5 px-3"
            onClick={() => {
              haptics.tap();
              setEditing({
                id: null,
                name: '',
                exercises: [{ name: '', target_sets: 3, target_reps: 10 }],
              });
            }}
          >
            Create First Routine
          </button>
        </div>
      )}

      {/* Templates List */}
      {!editing && templates.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="card p-3.5 border border-[#22252C] bg-[#15171C] flex flex-col justify-between hover:border-[#2D313A] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-display text-lg text-[#EDEEF0] uppercase tracking-wide truncate">
                    {t.name}
                  </h2>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`edit-tpl-${t.id}`}
                      className="p-1 text-[#8B8F98] hover:text-[#EDEEF0] hover:bg-white/[0.04] rounded-[2px]"
                      title="Edit template"
                      onClick={() => {
                        haptics.tap();
                        setEditing({
                          id: t.id,
                          name: t.name,
                          exercises: t.template_exercises.map((e) => ({ ...e })),
                        });
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      id={`delete-tpl-${t.id}`}
                      className="p-1 text-[#8B8F98] hover:text-[#E36565] hover:bg-[#E36565]/10 rounded-[2px]"
                      title="Delete template"
                      onClick={() => deleteTemplate(t.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {t.template_exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="text-xs flex items-center justify-between text-[#8B8F98] py-0.5 border-b border-[#22252C]/60 font-mono"
                    >
                      <span className="text-[#EDEEF0] truncate pr-2">
                        {idx + 1}. {ex.name}
                      </span>
                      <span className="text-[#E8B347] font-semibold text-[11px] shrink-0">
                        {ex.target_sets} × {ex.target_reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#22252C] flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-[#8B8F98]">
                  {t.template_exercises.length} {t.template_exercises.length === 1 ? 'Exercise' : 'Exercises'}
                </span>
                <Link
                  id={`start-tpl-${t.id}`}
                  to={`/log/${t.id}`}
                  onClick={() => haptics.tap()}
                  className="btn-primary text-[11px] py-1 px-2.5 uppercase tracking-wider font-bold"
                >
                  Start Workout
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Editor Form */}
      {editing && (
        <TemplateEditor
          template={editing}
          userId={user?.id || 'usr_demo_athlete'}
          onCancel={() => {
            haptics.tap();
            setEditing(null);
          }}
          onSaved={() => {
            setEditing(null);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
};

function TemplateEditor({
  template,
  userId,
  onCancel,
  onSaved,
}: {
  template: {
    id: string | null;
    name: string;
    exercises: { id?: string; name: string; target_sets: number; target_reps: number }[];
  };
  userId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template.name);
  const [exercises, setExercises] = useState(template.exercises);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExercise(idx: number, field: string, value: any) {
    setExercises((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );
  }

  function addExercise() {
    haptics.step();
    setExercises((prev) => [...prev, { name: '', target_sets: 3, target_reps: 10 }]);
  }

  function removeExercise(idx: number) {
    haptics.warning();
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    setError(null);
    if (!name.trim()) {
      setError('Please provide a name for this routine.');
      return;
    }
    const cleanExercises = exercises.filter((e) => e.name.trim());
    if (cleanExercises.length === 0) {
      setError('Add at least one exercise to the routine.');
      return;
    }

    setSaving(true);
    try {
      let templateId = template.id;

      if (templateId) {
        const { error: upErr } = await supabase
          .from('templates')
          .update({ name })
          .eq('id', templateId);
        if (upErr) throw upErr;

        await supabase.from('template_exercises').delete().eq('template_id', templateId);
      } else {
        const { data: newTpl, error: crErr } = await supabase
          .from('templates')
          .insert({
            name,
            user_id: userId,
          })
          .select()
          .single();

        if (crErr) throw crErr;
        templateId = newTpl.id;
      }

      const exerciseRows = cleanExercises.map((ex, idx) => ({
        template_id: templateId,
        name: ex.name.trim(),
        target_sets: Number(ex.target_sets) || 3,
        target_reps: Number(ex.target_reps) || 10,
        order_index: idx,
      }));

      const { error: insErr } = await supabase
        .from('template_exercises')
        .insert(exerciseRows);

      if (insErr) throw insErr;

      haptics.success();
      onSaved();
    } catch (e: any) {
      setError(e?.message || 'Failed to save workout routine.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-4 border border-[#22252C] bg-[#15171C]">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#22252C]">
        <h2 className="font-display text-lg uppercase tracking-wider text-[#EDEEF0]">
          {template.id ? 'Edit Routine' : 'Create Routine'}
        </h2>
        <button
          onClick={onCancel}
          className="text-[#8B8F98] hover:text-[#EDEEF0] p-1 text-xs"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-2 mb-3 bg-[#E36565]/10 border border-[#E36565]/40 text-[#E36565] text-xs font-mono rounded-[2px]">
          {error}
        </div>
      )}

      {/* Routine Name */}
      <div className="mb-3">
        <label className="block text-[10px] uppercase tracking-wider font-mono text-[#8B8F98] mb-1">
          Routine Name
        </label>
        <input
          id="template-name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Hypertrophy (Chest & Shoulders)"
          className="input-field text-sm"
        />
      </div>

      {/* Exercises list */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] uppercase tracking-wider font-mono text-[#8B8F98]">
            Exercises in Sequence
          </label>
          <button
            id="add-exercise-btn"
            type="button"
            onClick={addExercise}
            className="text-[10px] uppercase tracking-wider font-bold text-[#E8B347] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Exercise
          </button>
        </div>

        <div className="space-y-1.5">
          {exercises.map((ex, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 p-2 bg-[#0E1013] border border-[#22252C] rounded-[2px]"
            >
              <span className="text-[10px] font-mono text-[#8B8F98] w-5 shrink-0 text-center">
                #{idx + 1}
              </span>

              <input
                type="text"
                placeholder="Exercise Name (e.g. Barbell Bench Press)"
                value={ex.name}
                onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                className="input-field flex-1 py-1 text-xs"
              />

              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={ex.target_sets}
                  onChange={(e) => updateExercise(idx, 'target_sets', e.target.value)}
                  className="input-field w-12 py-1 text-center font-mono text-xs"
                  placeholder="Sets"
                  title="Target Sets"
                />
                <span className="text-[10px] text-[#8B8F98] font-mono">s</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={ex.target_reps}
                  onChange={(e) => updateExercise(idx, 'target_reps', e.target.value)}
                  className="input-field w-12 py-1 text-center font-mono text-xs"
                  placeholder="Reps"
                  title="Target Reps"
                />
                <span className="text-[10px] text-[#8B8F98] font-mono">r</span>
              </div>

              {exercises.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExercise(idx)}
                  className="p-1 text-[#8B8F98] hover:text-[#E36565] shrink-0"
                  title="Remove exercise"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#22252C]">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost text-xs py-1 px-3"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          id="save-template-btn"
          type="button"
          onClick={save}
          className="btn-primary text-xs py-1 px-4 flex items-center gap-1"
          disabled={saving}
        >
          <Check className="w-3 h-3" />
          <span>{saving ? 'Saving...' : 'Save Routine'}</span>
        </button>
      </div>
    </div>
  );
}
