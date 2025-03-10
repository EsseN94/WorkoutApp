'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  addDocument, 
  updateDocument, 
  getDocuments, 
  deleteDocument 
} from '@/lib/firebase/firebaseUtils';
import { 
  UserProfile, 
  Workout, 
  MuscleGroup, 
  MuscleGroupProgress,
  OPTIMAL_SETS_PER_WEEK,
  WorkoutPlaylist,
  WorkoutExercise,
  WorkoutSet,
  ScheduledWorkout,
  WorkoutWeek,
  WorkoutCycle,
  WorkoutProgress,
  DayOfWeek 
} from '@/lib/types';
import { getSampleData } from '../tempDatabase';

interface WorkoutContextType {
  userProfile: UserProfile | null;
  workouts: Workout[];
  loading: boolean;
  error: string | null;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addWorkout: (workout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkout: (workoutId: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getWeeklyProgress: (muscleGroup: MuscleGroup) => MuscleGroupProgress;
  refreshData: () => Promise<void>;
  
  // Playlists
  playlists: WorkoutPlaylist[];
  createPlaylist: (name: string, description?: string, exercises?: WorkoutExercise[]) => Promise<WorkoutPlaylist>;
  updatePlaylist: (playlist: WorkoutPlaylist) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  
  // Scheduling
  scheduledWorkouts: ScheduledWorkout[];
  scheduleWorkout: (playlistId: string, date: Date) => Promise<ScheduledWorkout>;
  updateScheduledWorkout: (workout: ScheduledWorkout) => Promise<void>;
  deleteScheduledWorkout: (workoutId: string) => Promise<void>;
  
  // Week Templates
  workoutWeeks: WorkoutWeek[];
  createWorkoutWeek: (name: string, schedule: Record<DayOfWeek, string>) => Promise<WorkoutWeek>;
  updateWorkoutWeek: (week: WorkoutWeek) => Promise<void>;
  deleteWorkoutWeek: (weekId: string) => Promise<void>;
  
  // Cycles
  workoutCycles: WorkoutCycle[];
  createWorkoutCycle: (name: string, weeks: WorkoutWeek[]) => Promise<WorkoutCycle>;
  updateWorkoutCycle: (cycle: WorkoutCycle) => Promise<void>;
  deleteWorkoutCycle: (cycleId: string) => Promise<void>;
  
  // Progress
  progress: WorkoutProgress;
  updateProgress: (progress: WorkoutProgress) => Promise<void>;
  
  // Today's Workout
  getTodaysWorkout: () => ScheduledWorkout | null;
  completeSet: (workoutId: string, exerciseId: string, setId: string) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<WorkoutPlaylist[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [workoutWeeks, setWorkoutWeeks] = useState<WorkoutWeek[]>([]);
  const [workoutCycles, setWorkoutCycles] = useState<WorkoutCycle[]>([]);
  const [progress, setProgress] = useState<WorkoutProgress>({
    totalWorkouts: 0,
    completedWorkouts: 0,
    streak: 0,
    muscleGroupProgress: {}
  });

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setUserProfile(null);
      setWorkouts([]);
      setLoading(false);
      setPlaylists([]);
      setScheduledWorkouts([]);
      setWorkoutWeeks([]);
      setWorkoutCycles([]);
      setProgress({
        totalWorkouts: 0,
        completedWorkouts: 0,
        streak: 0,
        muscleGroupProgress: {}
      });
    }
  }, [user]);

  // Type guards
  const isUserProfile = (data: any): data is UserProfile => {
    return data && 
      typeof data.userId === 'string' &&
      typeof data.name === 'string' &&
      typeof data.fitnessLevel === 'string' &&
      typeof data.fitnessGoal === 'string';
  };

  const isWorkout = (data: any): data is Workout => {
    return data &&
      typeof data.id === 'string' &&
      typeof data.userId === 'string' &&
      typeof data.type === 'string' &&
      Array.isArray(data.exercises);
  };

  const isWorkoutPlaylist = (data: any): data is WorkoutPlaylist => {
    return data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      Array.isArray(data.exercises);
  };

  const isScheduledWorkout = (data: any): data is ScheduledWorkout => {
    return data &&
      typeof data.id === 'string' &&
      typeof data.playlistId === 'string' &&
      data.date instanceof Date &&
      typeof data.completed === 'boolean';
  };

  const isWorkoutWeek = (data: any): data is WorkoutWeek => {
    return data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.schedule === 'object';
  };

  const isWorkoutCycle = (data: any): data is WorkoutCycle => {
    return data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      Array.isArray(data.weeks);
  };

  const isWorkoutProgress = (data: any): data is WorkoutProgress => {
    return data &&
      typeof data.totalWorkouts === 'number' &&
      typeof data.completedWorkouts === 'number' &&
      typeof data.streak === 'number' &&
      typeof data.muscleGroupProgress === 'object';
  };

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use sample data instead of fetching from Firebase
      const sampleData = getSampleData();
      
      setUserProfile(sampleData.userProfile);
      setWorkouts(sampleData.workouts);
      setPlaylists(sampleData.playlists);
      setScheduledWorkouts(sampleData.scheduledWorkouts);
      setWorkoutWeeks(sampleData.workoutWeeks);
      setWorkoutCycles(sampleData.workoutCycles);
      setProgress(sampleData.progress);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;

    try {
      if (userProfile) {
        await updateDocument('userProfiles', userProfile.userId, {
          ...profile,
          updatedAt: new Date(),
        });
      } else {
        await addDocument('userProfiles', {
          ...profile,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await refreshData();
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const addWorkout = async (workout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await addDocument('workouts', {
        ...workout,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await refreshData();
    } catch (err) {
      setError('Failed to add workout');
      console.error('Error adding workout:', err);
    }
  };

  const updateWorkout = async (workoutId: string, workout: Partial<Workout>) => {
    try {
      await updateDocument('workouts', workoutId, {
        ...workout,
        updatedAt: new Date(),
      });
      await refreshData();
    } catch (err) {
      setError('Failed to update workout');
      console.error('Error updating workout:', err);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      await deleteDocument('workouts', workoutId);
      await refreshData();
    } catch (err) {
      setError('Failed to delete workout');
      console.error('Error deleting workout:', err);
    }
  };

  const getWeeklyProgress = (muscleGroup: MuscleGroup): MuscleGroupProgress => {
    if (!userProfile) {
      return { current: 0, target: OPTIMAL_SETS_PER_WEEK['Beginner'][muscleGroup], percentage: 0 };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekSets = workouts
      .filter(workout => new Date(workout.date) >= oneWeekAgo)
      .reduce((total, workout) => {
        const muscleGroupSets = workout.exercises
          .filter(exercise => exercise.muscleGroup === muscleGroup)
          .reduce((sets, exercise) => sets + exercise.sets.length, 0);
        return total + muscleGroupSets;
      }, 0);

    const target = OPTIMAL_SETS_PER_WEEK['Beginner'][muscleGroup];
    const percentage = (weekSets / target) * 100;

    return {
      current: weekSets,
      target,
      percentage,
    };
  };

  const createPlaylist = async (name: string, description?: string, exercises?: WorkoutExercise[]): Promise<WorkoutPlaylist> => {
    const newPlaylist: WorkoutPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      exercises: (exercises ?? []).map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          completed: false,
          completedAt: undefined
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setPlaylists([...playlists, newPlaylist]);
    // TODO: Save to Firebase
    return newPlaylist;
  };

  const updatePlaylist = async (playlist: WorkoutPlaylist): Promise<void> => {
    const updatedPlaylists = playlists.map(p => 
      p.id === playlist.id ? { ...playlist, updatedAt: new Date() } : p
    );
    setPlaylists(updatedPlaylists);
    // TODO: Save to Firebase
  };

  const deletePlaylist = async (playlistId: string): Promise<void> => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
    // TODO: Delete from Firebase
  };

  const scheduleWorkout = async (playlistId: string, date: Date): Promise<ScheduledWorkout> => {
    const newWorkout: ScheduledWorkout = {
      id: Date.now().toString(),
      playlistId,
      date,
      completed: false,
      progress: 0
    };
    
    setScheduledWorkouts([...scheduledWorkouts, newWorkout]);
    // TODO: Save to Firebase
    return newWorkout;
  };

  const updateScheduledWorkout = async (workout: ScheduledWorkout): Promise<void> => {
    const updatedWorkouts = scheduledWorkouts.map(w => 
      w.id === workout.id ? workout : w
    );
    setScheduledWorkouts(updatedWorkouts);
    // TODO: Save to Firebase
  };

  const deleteScheduledWorkout = async (workoutId: string): Promise<void> => {
    setScheduledWorkouts(scheduledWorkouts.filter(w => w.id !== workoutId));
    // TODO: Delete from Firebase
  };

  const createWorkoutWeek = async (name: string, schedule: Record<DayOfWeek, string>): Promise<WorkoutWeek> => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const newWeek: WorkoutWeek = {
      id: Date.now().toString(),
      name,
      schedule,
      startDate,
      endDate,
      isTemplate: false
    };

    setWorkoutWeeks([...workoutWeeks, newWeek]);
    // TODO: Save to Firebase
    return newWeek;
  };

  const updateWorkoutWeek = async (week: WorkoutWeek): Promise<void> => {
    const updatedWeeks = workoutWeeks.map(w => 
      w.id === week.id ? week : w
    );
    setWorkoutWeeks(updatedWeeks);
    // TODO: Save to Firebase
  };

  const deleteWorkoutWeek = async (weekId: string): Promise<void> => {
    setWorkoutWeeks(workoutWeeks.filter(w => w.id !== weekId));
    // TODO: Delete from Firebase
  };

  const createWorkoutCycle = async (name: string, weeks: WorkoutWeek[]): Promise<WorkoutCycle> => {
    const newCycle: WorkoutCycle = {
      id: Date.now().toString(),
      name,
      description: '',
      weeks,
      currentWeekIndex: 0,
      autoRotate: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setWorkoutCycles([...workoutCycles, newCycle]);
    // TODO: Save to Firebase
    return newCycle;
  };

  const updateWorkoutCycle = async (cycle: WorkoutCycle): Promise<void> => {
    const updatedCycles = workoutCycles.map(c => 
      c.id === cycle.id ? { ...cycle, updatedAt: new Date() } : c
    );
    setWorkoutCycles(updatedCycles);
    // TODO: Save to Firebase
  };

  const deleteWorkoutCycle = async (cycleId: string): Promise<void> => {
    setWorkoutCycles(workoutCycles.filter(c => c.id !== cycleId));
    // TODO: Delete from Firebase
  };

  const getTodaysWorkout = (): ScheduledWorkout | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return scheduledWorkouts.find(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime() && !workout.completed;
    }) || null;
  };

  const completeSet = async (workoutId: string, exerciseId: string, setId: string): Promise<void> => {
    const workout = scheduledWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    const playlist = playlists.find(p => p.id === workout.playlistId);
    if (!playlist) return;

    const updatedPlaylist = {
      ...playlist,
      exercises: playlist.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map(set => {
              if (set.id === setId) {
                return {
                  ...set,
                  completed: true,
                  completedAt: new Date()
                };
              }
              return set;
            })
          };
        }
        return exercise;
      })
    };

    const totalSets = playlist.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    const completedSets = playlist.exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.completed).length, 0
    );
    
    const updatedWorkout = {
      ...workout,
      progress: (completedSets / totalSets) * 100,
      completed: completedSets === totalSets,
      completedAt: completedSets === totalSets ? new Date() : undefined
    };

    await updatePlaylist(updatedPlaylist);
    await updateScheduledWorkout(updatedWorkout);
    await updateProgress({
      ...progress,
      completedWorkouts: progress.completedWorkouts + (updatedWorkout.completed ? 1 : 0),
      lastWorkout: new Date()
    });
  };

  const updateProgress = async (progress: WorkoutProgress): Promise<void> => {
    setProgress(progress);
    // TODO: Save to Firebase
  };

  const value = {
    userProfile,
    workouts,
    loading,
    error,
    updateUserProfile,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWeeklyProgress,
    refreshData,
    playlists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    scheduledWorkouts,
    scheduleWorkout,
    updateScheduledWorkout,
    deleteScheduledWorkout,
    workoutWeeks,
    createWorkoutWeek,
    updateWorkoutWeek,
    deleteWorkoutWeek,
    workoutCycles,
    createWorkoutCycle,
    updateWorkoutCycle,
    deleteWorkoutCycle,
    progress,
    updateProgress,
    getTodaysWorkout,
    completeSet
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
} 