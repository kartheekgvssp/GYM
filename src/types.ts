export type MuscleGroup = 'All' | 'Chest' | 'Back' | 'Legs' | 'Core' | 'Arms' | 'Shoulders';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  defaultSets: number;
  defaultReps: number;
  difficulty: DifficultyLevel;
  image: string;
  caloriesBurn: number;
  tips: string[];
}

export interface WorkoutSession {
  id: string;
  title: string;
  focus: string;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  calories: number;
  bannerImage: string;
  exercises: Exercise[];
}

export interface DailyStats {
  weeklyConsistency: boolean[]; // Mon to Sun [true, true, true, false, true, false, false]
  caloriesBurned: number;
  targetCalories: number;
  activeMinutes: number;
  targetMinutes: number;
  streakDays: number;
  consistencyPercentage: number;
}

export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface DayWorkoutPlan {
  day: Weekday;
  dayShort: string;
  focus: string;
  workoutTitle: string;
  isRestDay: boolean;
  estimatedMinutes: number;
  exercisesCount: number;
  targetMuscle: MuscleGroup;
  presetWorkoutId?: string;
  exerciseIds?: string[];
  customExercises?: Exercise[];
  notes?: string;
  isCustom?: boolean;
}

export type TabType = 'home' | 'exercises' | 'camera' | 'me';

export interface AuthUser {
  uid: string;
  phoneNumber: string;
  displayName: string;
}
