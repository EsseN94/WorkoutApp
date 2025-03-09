'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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
  OPTIMAL_SETS_PER_WEEK 
} from '@/lib/types';

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
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and workouts when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setUserProfile(null);
      setWorkouts([]);
      setLoading(false);
    }
  }, [user]);

  // Refresh all data
  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user profile
      const profiles = await getDocuments('userProfiles');
      const profile = profiles.find((p: any) => p.userId === user.uid);
      setUserProfile(profile || null);

      // Fetch workouts
      const allWorkouts = await getDocuments('workouts');
      const userWorkouts = allWorkouts
        .filter((w: any) => w.userId === user.uid)
        .sort((a: Workout, b: Workout) => b.date.getTime() - a.date.getTime());
      setWorkouts(userWorkouts);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
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

  // Add new workout
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

  // Update existing workout
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

  // Delete workout
  const deleteWorkout = async (workoutId: string) => {
    try {
      await deleteDocument('workouts', workoutId);
      await refreshData();
    } catch (err) {
      setError('Failed to delete workout');
      console.error('Error deleting workout:', err);
    }
  };

  // Calculate weekly progress for a muscle group
  const getWeeklyProgress = (muscleGroup: MuscleGroup): MuscleGroupProgress => {
    if (!userProfile) {
      return { current: 0, target: 0, percentage: 0 };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total sets for the muscle group in the last week
    const weekSets = workouts
      .filter(workout => new Date(workout.date) >= oneWeekAgo)
      .reduce((total, workout) => {
        const muscleGroupSets = workout.exercises
          .filter(exercise => exercise.muscleGroup === muscleGroup)
          .reduce((sets, exercise) => sets + exercise.sets.length, 0);
        return total + muscleGroupSets;
      }, 0);

    const target = OPTIMAL_SETS_PER_WEEK[userProfile.fitnessLevel][muscleGroup];
    const percentage = (weekSets / target) * 100;

    return {
      current: weekSets,
      target,
      percentage,
    };
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