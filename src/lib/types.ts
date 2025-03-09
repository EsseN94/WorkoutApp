export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type FitnessGoal = 'build_muscle' | 'lose_weight' | 'maintain' | 'improve_strength' | 'improve_endurance';

export type MuscleGroup = 
  | 'Abs' 
  | 'Back' 
  | 'Biceps' 
  | 'Calves' 
  | 'Chest' 
  | 'Forearms'
  | 'Glutes'
  | 'Hamstrings'
  | 'Neck'
  | 'Quads'
  | 'Shoulders'
  | 'Triceps'
  | 'Upper traps';

export type WorkoutType = 'Strength' | 'Hypertrophy' | 'Endurance' | 'Cardio';

export interface UserProfile {
  userId: string;
  name: string;
  weight?: number;
  height?: number;
  fitnessLevel: FitnessLevel;
  fitnessGoal: FitnessGoal;
  createdAt: Date;
  updatedAt: Date;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: Set[];
}

export interface CardioExercise {
  id: string;
  name: string;
  duration: number; // in minutes
  distance?: number; // in kilometers
  caloriesBurned?: number;
}

export interface Workout {
  id: string;
  userId: string;
  type: string;
  date: Date;
  notes?: string;
  exercises: Exercise[];
  cardioExercises?: CardioExercise[];
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight: number; // in kg
  reps: number;
  completed: boolean;
  notes?: string;
}

export interface CardioSession {
  id: string;
  type: string; // e.g., 'Running', 'Cycling', 'Swimming'
  duration: number; // in minutes
  distance?: number; // in km
  caloriesBurned?: number;
  notes?: string;
}

export interface MuscleGroupProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface WeeklyProgress {
  [key: string]: MuscleGroupProgress;
}

// Optimal sets per week based on fitness level
export const OPTIMAL_SETS_PER_WEEK: Record<FitnessLevel, Record<MuscleGroup, number>> = {
  Beginner: {
    Abs: 10,
    Back: 10,
    Biceps: 6,
    Calves: 10,
    Chest: 10,
    Forearms: 6,
    Glutes: 10,
    Hamstrings: 10,
    Neck: 6,
    Quads: 10,
    Shoulders: 10,
    Triceps: 6,
    'Upper traps': 6
  },
  Intermediate: {
    Abs: 10,
    Back: 20,
    Biceps: 10,
    Calves: 10,
    Chest: 15,
    Forearms: 8,
    Glutes: 20,
    Hamstrings: 12,
    Neck: 10,
    Quads: 15,
    Shoulders: 20,
    Triceps: 10,
    'Upper traps': 10
  },
  Advanced: {
    Abs: 15,
    Back: 30,
    Biceps: 20,
    Calves: 15,
    Chest: 20,
    Forearms: 10,
    Glutes: 30,
    Hamstrings: 15,
    Neck: 10,
    Quads: 20,
    Shoulders: 25,
    Triceps: 20,
    'Upper traps': 10
  }
};

export interface WorkoutSchedule {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  plannedWorkout: {
    type: WorkoutType;
    muscleGroups: MuscleGroup[];
  };
  reminder: boolean;
  reminderTime?: string; // HH:mm format
} 