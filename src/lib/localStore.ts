import { Template, Session, SessionSet, AuthUser } from '../types';

const STORAGE_KEYS = {
  USER: 'iron_log_user',
  TEMPLATES: 'iron_log_templates',
  SESSIONS: 'iron_log_sessions',
  SESSION_SETS: 'iron_log_sets',
  UNIT: 'iron_log_unit',
};

const DEFAULT_USER: AuthUser = {
  id: 'usr_demo_athlete',
  email: 'lifter@ironlog.app',
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-push-1',
    user_id: 'usr_demo_athlete',
    name: 'Push Routine (Heavy)',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    template_exercises: [
      { id: 'te-1', template_id: 'tpl-push-1', name: 'Barbell Bench Press', target_sets: 4, target_reps: 6, order_index: 0 },
      { id: 'te-2', template_id: 'tpl-push-1', name: 'Standing Overhead Press', target_sets: 3, target_reps: 8, order_index: 1 },
      { id: 'te-3', template_id: 'tpl-push-1', name: 'Incline Dumbbell Press', target_sets: 3, target_reps: 10, order_index: 2 },
      { id: 'te-4', template_id: 'tpl-push-1', name: 'Dips (Weighted)', target_sets: 3, target_reps: 12, order_index: 3 },
    ],
  },
  {
    id: 'tpl-pull-1',
    user_id: 'usr_demo_athlete',
    name: 'Pull Routine (Hypertrophy)',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    template_exercises: [
      { id: 'te-5', template_id: 'tpl-pull-1', name: 'Barbell Deadlift', target_sets: 3, target_reps: 5, order_index: 0 },
      { id: 'te-6', template_id: 'tpl-pull-1', name: 'Barbell Bent Over Row', target_sets: 4, target_reps: 8, order_index: 1 },
      { id: 'te-7', template_id: 'tpl-pull-1', name: 'Weighted Pull-Ups', target_sets: 3, target_reps: 8, order_index: 2 },
      { id: 'te-8', template_id: 'tpl-pull-1', name: 'Barbell Bicep Curl', target_sets: 3, target_reps: 12, order_index: 3 },
    ],
  },
  {
    id: 'tpl-legs-1',
    user_id: 'usr_demo_athlete',
    name: 'Legs & Core',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    template_exercises: [
      { id: 'te-9', template_id: 'tpl-legs-1', name: 'Barbell Back Squat', target_sets: 4, target_reps: 6, order_index: 0 },
      { id: 'te-10', template_id: 'tpl-legs-1', name: 'Romanian Deadlift', target_sets: 3, target_reps: 8, order_index: 1 },
      { id: 'te-11', template_id: 'tpl-legs-1', name: 'Bulgarian Split Squat', target_sets: 3, target_reps: 10, order_index: 2 },
      { id: 'te-12', template_id: 'tpl-legs-1', name: 'Standing Calf Raise', target_sets: 4, target_reps: 15, order_index: 3 },
    ],
  },
];

const DEFAULT_SESSIONS: Session[] = [
  {
    id: 'ses-1',
    user_id: 'usr_demo_athlete',
    template_id: 'tpl-push-1',
    started_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 10 * 86400000 + 3600000).toISOString(),
    templates: { name: 'Push Routine (Heavy)' },
  },
  {
    id: 'ses-2',
    user_id: 'usr_demo_athlete',
    template_id: 'tpl-push-1',
    started_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 86400000 + 4000000).toISOString(),
    templates: { name: 'Push Routine (Heavy)' },
  },
  {
    id: 'ses-3',
    user_id: 'usr_demo_athlete',
    template_id: 'tpl-push-1',
    started_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000 + 4200000).toISOString(),
    templates: { name: 'Push Routine (Heavy)' },
  },
];

const DEFAULT_SETS: SessionSet[] = [
  // Session 1 Bench
  { id: 'set-1', session_id: 'ses-1', exercise_name: 'Barbell Bench Press', set_number: 1, reps: 6, weight: 80, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'set-2', session_id: 'ses-1', exercise_name: 'Barbell Bench Press', set_number: 2, reps: 6, weight: 82.5, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'set-3', session_id: 'ses-1', exercise_name: 'Barbell Bench Press', set_number: 3, reps: 5, weight: 85, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  // Session 2 Bench
  { id: 'set-4', session_id: 'ses-2', exercise_name: 'Barbell Bench Press', set_number: 1, reps: 6, weight: 82.5, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'set-5', session_id: 'ses-2', exercise_name: 'Barbell Bench Press', set_number: 2, reps: 6, weight: 85, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'set-6', session_id: 'ses-2', exercise_name: 'Barbell Bench Press', set_number: 3, reps: 6, weight: 87.5, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  // Session 3 Bench
  { id: 'set-7', session_id: 'ses-3', exercise_name: 'Barbell Bench Press', set_number: 1, reps: 6, weight: 85, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'set-8', session_id: 'ses-3', exercise_name: 'Barbell Bench Press', set_number: 2, reps: 6, weight: 87.5, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'set-9', session_id: 'ses-3', exercise_name: 'Barbell Bench Press', set_number: 3, reps: 5, weight: 90, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },

  // Squats
  { id: 'set-10', session_id: 'ses-1', exercise_name: 'Barbell Back Squat', set_number: 1, reps: 6, weight: 100, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'set-11', session_id: 'ses-2', exercise_name: 'Barbell Back Squat', set_number: 1, reps: 6, weight: 105, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'set-12', session_id: 'ses-3', exercise_name: 'Barbell Back Squat', set_number: 1, reps: 6, weight: 110, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },

  // Deadlift
  { id: 'set-13', session_id: 'ses-1', exercise_name: 'Barbell Deadlift', set_number: 1, reps: 5, weight: 130, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'set-14', session_id: 'ses-2', exercise_name: 'Barbell Deadlift', set_number: 1, reps: 5, weight: 135, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'set-15', session_id: 'ses-3', exercise_name: 'Barbell Deadlift', set_number: 1, reps: 5, weight: 140, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export function getLocalUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function setLocalUser(user: AuthUser | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export function getLocalTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveLocalTemplates(templates: Template[]): void {
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

export function getLocalSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
      return DEFAULT_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SESSIONS;
  }
}

export function saveLocalSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getLocalSets(): SessionSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION_SETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify(DEFAULT_SETS));
      return DEFAULT_SETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETS;
  }
}

export function saveLocalSets(sets: SessionSet[]): void {
  localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify(sets));
}

export function getPreferredUnit(): 'kg' | 'lb' {
  try {
    return (localStorage.getItem(STORAGE_KEYS.UNIT) as 'kg' | 'lb') || 'kg';
  } catch {
    return 'kg';
  }
}

export function setPreferredUnit(unit: 'kg' | 'lb'): void {
  localStorage.setItem(STORAGE_KEYS.UNIT, unit);
}
