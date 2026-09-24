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

export interface ScannedExercise {
  name: string;
  difficulty: DifficultyLevel;
  targetArea: string;
  howToPerform: string[];
  recommendedReps: {
    hypertrophy: string;
    strength: string;
    endurance: string;
  };
  recommendedSets: string;
  restPeriod: string;
  formTips: string[];
}

export interface EquipmentBenefit {
  title: string;
  description: string;
}

export interface ScannedStageExercise {
  name: string;
  setsAndReps: string; // e.g. "3 sets × 10-12 reps"
  targetRepsBadge: string; // e.g. "2x15", "3x10", "3x20"
  difficulty: DifficultyLevel;
  targetArea: string;
  position?: string; // e.g. "Seated upright at 90°, chest against pad, feet flat"
  videoUrl?: string; // Looping exercise movement video or animation
  tips: string[];
  illustration?: string;
}

export interface TrainingStagePlan {
  stageName: string;
  description: string;
  exercises: ScannedStageExercise[];
}

export interface EquipmentScanData {
  equipmentName: string;
  equipmentType: 'machine' | 'cable' | 'barbell' | 'dumbbell' | 'bodyweight' | 'other';
  primaryMuscle: MuscleGroup;
  targetMuscles: string[];
  overview: string;
  benefitsAndUses: EquipmentBenefit[];
  stages: {
    beginner: TrainingStagePlan;
    intermediate: TrainingStagePlan;
    advanced: TrainingStagePlan;
  };
  exercises: ScannedExercise[];
}
