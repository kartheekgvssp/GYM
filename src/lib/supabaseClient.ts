import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getLocalUser,
  setLocalUser,
  getLocalTemplates,
  saveLocalTemplates,
  getLocalSessions,
  saveLocalSessions,
  getLocalSets,
  saveLocalSets,
} from './localStore';
import { Template, Session, SessionSet } from '../types';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  envUrl.startsWith('http') &&
  !envUrl.includes('your-project-url-here') &&
  !envAnonKey.includes('your-anon-key-here')
);

export const realSupabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(envUrl, envAnonKey)
  : null;

// Mock query builder for offline / instant dev experience
class MockQueryBuilder {
  private table: string;
  private filters: Record<string, unknown> = {};
  private orders: { column: string; ascending: boolean }[] = [];
  private limitCount: number | null = null;
  private countMode: boolean = false;
  private isNotCompleted: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns = '*', options?: { count?: string; head?: boolean }) {
    if (options?.count === 'exact') {
      this.countMode = true;
    }
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    if (column === 'completed_at' && operator === 'is' && value === null) {
      this.isNotCompleted = true;
    }
    return this;
  }

  order(column: string, options: { ascending: boolean } = { ascending: true }) {
    this.orders.push({ column, ascending: options.ascending });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async single() {
    const res = await this.execute();
    const data = Array.isArray(res.data) ? res.data[0] || null : res.data;
    return { data, error: res.error };
  }

  // Thenable for await
  async then(resolve: (value: { data: any; error: any; count?: number }) => any) {
    const result = await this.execute();
    return resolve(result);
  }

  private async execute(): Promise<{ data: any; error: any; count?: number }> {
    if (this.table === 'templates') {
      let data = [...getLocalTemplates()];
      if (this.filters['id']) {
        data = data.filter((t) => t.id === this.filters['id']);
      }
      return { data, error: null, count: data.length };
    }

    if (this.table === 'sessions') {
      let data = [...getLocalSessions()];
      if (this.isNotCompleted) {
        data = data.filter((s) => s.completed_at !== null && s.completed_at !== undefined);
      }
      if (this.orders.length > 0) {
        const o = this.orders[0];
        data.sort((a, b) => {
          const valA = new Date(a.started_at).getTime();
          const valB = new Date(b.started_at).getTime();
          return o.ascending ? valA - valB : valB - valA;
        });
      }
      if (this.limitCount) {
        data = data.slice(0, this.limitCount);
      }
      return { data, error: null, count: data.length };
    }

    if (this.table === 'session_sets') {
      let data = [...getLocalSets()];
      if (this.filters['exercise_name']) {
        data = data.filter((s) => s.exercise_name === this.filters['exercise_name']);
      }
      if (this.orders.length > 0) {
        data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
      return { data, error: null, count: data.length };
    }

    return { data: [], error: null, count: 0 };
  }

  async insert(values: any) {
    const rows = Array.isArray(values) ? values : [values];

    if (this.table === 'templates') {
      const all = getLocalTemplates();
      const newItems: Template[] = rows.map((r) => ({
        id: r.id || 'tpl-' + Math.random().toString(36).substring(2, 9),
        user_id: r.user_id || 'usr_demo_athlete',
        name: r.name,
        created_at: new Date().toISOString(),
        template_exercises: [],
      }));
      saveLocalTemplates([...all, ...newItems]);
      return {
        select: () => ({
          single: async () => ({ data: newItems[0], error: null }),
        }),
        data: newItems,
        error: null,
      };
    }

    if (this.table === 'template_exercises') {
      const all = getLocalTemplates();
      const targetTemplateId = rows[0]?.template_id;
      const updated = all.map((t) => {
        if (t.id === targetTemplateId) {
          const exercises = rows.map((r, i) => ({
            id: 'te-' + Math.random().toString(36).substring(2, 9),
            template_id: targetTemplateId,
            name: r.name,
            target_sets: r.target_sets || 3,
            target_reps: r.target_reps || 10,
            order_index: r.order_index ?? i,
          }));
          return { ...t, template_exercises: exercises };
        }
        return t;
      });
      saveLocalTemplates(updated);
      return { data: rows, error: null };
    }

    if (this.table === 'sessions') {
      const all = getLocalSessions();
      const templates = getLocalTemplates();
      const t = templates.find((tpl) => tpl.id === rows[0].template_id);
      const newSession: Session = {
        id: 'ses-' + Math.random().toString(36).substring(2, 9),
        user_id: rows[0].user_id || 'usr_demo_athlete',
        template_id: rows[0].template_id,
        started_at: new Date().toISOString(),
        completed_at: null,
        templates: t ? { name: t.name } : null,
      };
      saveLocalSessions([newSession, ...all]);
      return {
        select: () => ({
          single: async () => ({ data: newSession, error: null }),
        }),
        data: [newSession],
        error: null,
      };
    }

    if (this.table === 'session_sets') {
      const all = getLocalSets();
      const newSets: SessionSet[] = rows.map((r) => ({
        id: 'set-' + Math.random().toString(36).substring(2, 9),
        session_id: r.session_id,
        exercise_name: r.exercise_name,
        set_number: r.set_number,
        reps: r.reps,
        weight: r.weight,
        created_at: new Date().toISOString(),
      }));
      saveLocalSets([...all, ...newSets]);
      return { data: newSets, error: null };
    }

    return { data: rows, error: null };
  }

  update(updates: any) {
    return {
      eq: async (_col: string, val: string) => {
        if (this.table === 'templates') {
          const all = getLocalTemplates();
          const updated = all.map((t) => (t.id === val ? { ...t, ...updates } : t));
          saveLocalTemplates(updated);
          return { data: null, error: null };
        }
        if (this.table === 'sessions') {
          const all = getLocalSessions();
          const updated = all.map((s) => (s.id === val ? { ...s, ...updates } : s));
          saveLocalSessions(updated);
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    };
  }

  delete() {
    return {
      eq: async (_col: string, val: string) => {
        if (this.table === 'templates') {
          const all = getLocalTemplates().filter((t) => t.id !== val);
          saveLocalTemplates(all);
          return { data: null, error: null };
        }
        if (this.table === 'template_exercises') {
          const all = getLocalTemplates().map((t) =>
            t.id === val ? { ...t, template_exercises: [] } : t
          );
          saveLocalTemplates(all);
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    };
  }
}

// Fallback auth object
const mockAuth = {
  async getSession() {
    const user = getLocalUser();
    if (!user) return { data: { session: null }, error: null };
    return {
      data: {
        session: {
          user,
          access_token: 'mock-token',
        },
      },
      error: null,
    };
  },
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const user = getLocalUser();
    const session = user ? { user, access_token: 'mock-token' } : null;
    callback('SIGNED_IN', session);
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
  async signUp({ email }: { email: string; password?: string }) {
    const user = { id: 'usr_' + Math.random().toString(36).substring(2, 9), email };
    setLocalUser(user);
    return {
      data: {
        user,
        session: { user, access_token: 'mock-token' },
      },
      error: null,
    };
  },
  async signInWithPassword({ email }: { email: string; password?: string }) {
    const user = { id: 'usr_' + Math.random().toString(36).substring(2, 9), email };
    setLocalUser(user);
    return {
      data: {
        user,
        session: { user, access_token: 'mock-token' },
      },
      error: null,
    };
  },
  async signOut() {
    setLocalUser(null);
    return { error: null };
  },
};

// Universal client facade
export const supabase = {
  auth: realSupabase ? realSupabase.auth : (mockAuth as any),
  from: (table: string) => {
    if (realSupabase) {
      return (realSupabase as any).from(table);
    }
    return new MockQueryBuilder(table) as any;
  },
};
