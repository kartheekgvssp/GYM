export interface TemplateExercise {
  id: string;
  template_id?: string;
  name: string;
  target_sets: number;
  target_reps: number;
  order_index: number;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
  template_exercises: TemplateExercise[];
}

export interface Session {
  id: string;
  user_id: string;
  template_id?: string | null;
  started_at: string;
  completed_at?: string | null;
  templates?: { name: string } | null;
}

export interface SessionSet {
  id: string;
  session_id: string;
  exercise_name: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface LoggedSetState {
  reps: number | string;
  weight: number | string;
  saved: boolean;
}
