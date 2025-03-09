import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  UserProfile,
  Workout,
  WorkoutSchedule,
  MuscleGroupProgress,
} from '../types';

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// User Profile Functions
export const createUserProfile = async (userId: string, profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  const userRef = doc(db, 'users', userId);
  const now = Timestamp.now();
  await setDoc(userRef, {
    ...profile,
    createdAt: now,
    updatedAt: now
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } as UserProfile : null;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Workout Functions
export const addWorkout = async (workout: Omit<Workout, 'id'>) => {
  const workoutsRef = collection(db, 'workouts');
  const docRef = await addDoc(workoutsRef, {
    ...workout,
    date: Timestamp.fromDate(workout.date)
  });
  return docRef.id;
};

export const getWorkouts = async (userId: string, startDate?: Date, endDate?: Date) => {
  const workoutsRef = collection(db, 'workouts');
  let q = query(workoutsRef, where('userId', '==', userId));
  
  if (startDate && endDate) {
    q = query(q, 
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: (doc.data().date as Timestamp).toDate()
  })) as Workout[];
};

// Schedule Functions
export const setWorkoutSchedule = async (schedule: Omit<WorkoutSchedule, 'id'>) => {
  const scheduleRef = collection(db, 'schedules');
  const docRef = await addDoc(scheduleRef, schedule);
  return docRef.id;
};

export const getWorkoutSchedule = async (userId: string) => {
  const scheduleRef = collection(db, 'schedules');
  const q = query(scheduleRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as WorkoutSchedule[];
};

// Progress Tracking Functions
export const updateMuscleGroupProgress = async (userId: string, progress: MuscleGroupProgress) => {
  const progressRef = doc(db, 'muscleProgress', `${userId}_${progress.muscleGroup}`);
  await setDoc(progressRef, {
    ...progress,
    lastWorked: Timestamp.fromDate(progress.lastWorked)
  }, { merge: true });
};

export const getMuscleGroupProgress = async (userId: string) => {
  const progressRef = collection(db, 'muscleProgress');
  const q = query(progressRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    lastWorked: (doc.data().lastWorked as Timestamp).toDate()
  })) as MuscleGroupProgress[];
};
