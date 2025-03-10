'use client';

import { 
  UserProfile, 
  Workout, 
  WorkoutPlaylist, 
  ScheduledWorkout, 
  WorkoutWeek, 
  WorkoutCycle, 
  WorkoutProgress,
  MuscleGroup,
  DayOfWeek,
  WorkoutExercise
} from './types';

// Mock exercises for different muscle groups
const exercises: Record<MuscleGroup, WorkoutExercise[]> = {
  Chest: [
    { id: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest', sets: [], color: '#FF4B4B' },
    { id: 'incline-press', name: 'Incline Press', muscleGroup: 'Chest', sets: [], color: '#FF8F7C' },
    { id: 'chest-flyes', name: 'Chest Flyes', muscleGroup: 'Chest', sets: [], color: '#FFC2B4' }
  ],
  Back: [
    { id: 'pull-ups', name: 'Pull-ups', muscleGroup: 'Back', sets: [], color: '#4B83FF' },
    { id: 'rows', name: 'Barbell Rows', muscleGroup: 'Back', sets: [], color: '#7CA6FF' },
    { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', sets: [], color: '#B4CFFF' }
  ],
  Legs: [
    { id: 'squats', name: 'Squats', muscleGroup: 'Legs', sets: [], color: '#4BFF83' },
    { id: 'deadlifts', name: 'Deadlifts', muscleGroup: 'Legs', sets: [], color: '#7CFFA6' },
    { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs', sets: [], color: '#B4FFC9' }
  ],
  Shoulders: [
    { id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'Shoulders', sets: [], color: '#FFD74B' },
    { id: 'lateral-raises', name: 'Lateral Raises', muscleGroup: 'Shoulders', sets: [], color: '#FFE47C' },
    { id: 'front-raises', name: 'Front Raises', muscleGroup: 'Shoulders', sets: [], color: '#FFF1B4' }
  ],
  Arms: [
    { id: 'bicep-curls', name: 'Bicep Curls', muscleGroup: 'Arms', sets: [], color: '#FF4BFF' },
    { id: 'tricep-extensions', name: 'Tricep Extensions', muscleGroup: 'Arms', sets: [], color: '#FF7CFF' },
    { id: 'hammer-curls', name: 'Hammer Curls', muscleGroup: 'Arms', sets: [], color: '#FFB4FF' }
  ],
  Abs: [
    { id: 'crunches', name: 'Crunches', muscleGroup: 'Abs', sets: [], color: '#4BFFFF' },
    { id: 'planks', name: 'Planks', muscleGroup: 'Abs', sets: [], color: '#7CFFFF' },
    { id: 'leg-raises', name: 'Leg Raises', muscleGroup: 'Abs', sets: [], color: '#B4FFFF' }
  ]
};

// Sample user profile
export const sampleUserProfile: UserProfile = {
  userId: 'test-user-id',
  name: 'John Doe',
  fitnessLevel: 'Intermediate',
  fitnessGoal: 'Build Muscle',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

// Sample workout playlists
export const samplePlaylists: WorkoutPlaylist[] = [
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Chest, Shoulders, and Triceps',
    exercises: [
      { ...exercises.Chest[0], sets: [
        { id: 'set1', weight: 135, reps: 10, completed: false },
        { id: 'set2', weight: 135, reps: 10, completed: false },
        { id: 'set3', weight: 135, reps: 10, completed: false }
      ]},
      { ...exercises.Shoulders[0], sets: [
        { id: 'set1', weight: 95, reps: 10, completed: false },
        { id: 'set2', weight: 95, reps: 10, completed: false },
        { id: 'set3', weight: 95, reps: 10, completed: false }
      ]},
      { ...exercises.Arms[1], sets: [
        { id: 'set1', weight: 45, reps: 12, completed: false },
        { id: 'set2', weight: 45, reps: 12, completed: false },
        { id: 'set3', weight: 45, reps: 12, completed: false }
      ]}
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    description: 'Back and Biceps',
    exercises: [
      { ...exercises.Back[0], sets: [
        { id: 'set1', weight: 0, reps: 10, completed: false },
        { id: 'set2', weight: 0, reps: 10, completed: false },
        { id: 'set3', weight: 0, reps: 10, completed: false }
      ]},
      { ...exercises.Back[1], sets: [
        { id: 'set1', weight: 135, reps: 10, completed: false },
        { id: 'set2', weight: 135, reps: 10, completed: false },
        { id: 'set3', weight: 135, reps: 10, completed: false }
      ]},
      { ...exercises.Arms[0], sets: [
        { id: 'set1', weight: 30, reps: 12, completed: false },
        { id: 'set2', weight: 30, reps: 12, completed: false },
        { id: 'set3', weight: 30, reps: 12, completed: false }
      ]}
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    description: 'Lower Body Focus',
    exercises: [
      { ...exercises.Legs[0], sets: [
        { id: 'set1', weight: 185, reps: 8, completed: false },
        { id: 'set2', weight: 185, reps: 8, completed: false },
        { id: 'set3', weight: 185, reps: 8, completed: false }
      ]},
      { ...exercises.Legs[1], sets: [
        { id: 'set1', weight: 225, reps: 6, completed: false },
        { id: 'set2', weight: 225, reps: 6, completed: false },
        { id: 'set3', weight: 225, reps: 6, completed: false }
      ]},
      { ...exercises.Legs[2], sets: [
        { id: 'set1', weight: 270, reps: 10, completed: false },
        { id: 'set2', weight: 270, reps: 10, completed: false },
        { id: 'set3', weight: 270, reps: 10, completed: false }
      ]}
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Sample workout weeks
export const sampleWorkoutWeeks: WorkoutWeek[] = [
  {
    id: 'week-1',
    name: 'Push/Pull/Legs Week',
    schedule: {
      [DayOfWeek.Monday]: 'push-day',
      [DayOfWeek.Tuesday]: '',
      [DayOfWeek.Wednesday]: 'pull-day',
      [DayOfWeek.Thursday]: '',
      [DayOfWeek.Friday]: 'leg-day',
      [DayOfWeek.Saturday]: '',
      [DayOfWeek.Sunday]: ''
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isTemplate: true
  }
];

// Sample workout cycles
export const sampleWorkoutCycles: WorkoutCycle[] = [
  {
    id: 'cycle-1',
    name: '4-Week Strength Building',
    description: 'Progressive overload focusing on compound movements',
    weeks: sampleWorkoutWeeks,
    currentWeekIndex: 0,
    autoRotate: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Sample scheduled workouts
export const sampleScheduledWorkouts: ScheduledWorkout[] = [
  {
    id: 'today-workout',
    playlistId: 'push-day',
    date: new Date(),
    completed: false,
    progress: 0
  },
  {
    id: 'tomorrow-workout',
    playlistId: 'pull-day',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false,
    progress: 0
  }
];

// Sample workouts (completed)
export const sampleWorkouts: Workout[] = [
  {
    id: 'workout-1',
    userId: 'test-user-id',
    type: 'Strength',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    exercises: [
      {
        ...exercises.Chest[0],
        sets: [
          { id: 'set1', weight: 135, reps: 10, completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          { id: 'set2', weight: 135, reps: 10, completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          { id: 'set3', weight: 135, reps: 10, completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

// Sample workout progress
export const sampleWorkoutProgress: WorkoutProgress = {
  totalWorkouts: 10,
  completedWorkouts: 8,
  streak: 3,
  muscleGroupProgress: {
    Abs: { current: 0, target: 10, percentage: 0 },
    Back: { current: 0, target: 10, percentage: 0 },
    Biceps: { current: 0, target: 6, percentage: 0 },
    Calves: { current: 0, target: 10, percentage: 0 },
    Chest: { current: 3, target: 10, percentage: 30 },
    Forearms: { current: 0, target: 6, percentage: 0 },
    Glutes: { current: 0, target: 10, percentage: 0 },
    Hamstrings: { current: 0, target: 10, percentage: 0 },
    Neck: { current: 0, target: 6, percentage: 0 },
    Quads: { current: 0, target: 10, percentage: 0 },
    Shoulders: { current: 0, target: 10, percentage: 0 },
    Triceps: { current: 0, target: 6, percentage: 0 },
    'Upper traps': { current: 0, target: 6, percentage: 0 }
  },
  lastWorkout: new Date(Date.now() - 24 * 60 * 60 * 1000)
};

// Function to get all sample data
export const getSampleData = () => ({
  userProfile: sampleUserProfile,
  playlists: samplePlaylists,
  workoutWeeks: sampleWorkoutWeeks,
  workoutCycles: sampleWorkoutCycles,
  scheduledWorkouts: sampleScheduledWorkouts,
  workouts: sampleWorkouts,
  progress: sampleWorkoutProgress
}); 