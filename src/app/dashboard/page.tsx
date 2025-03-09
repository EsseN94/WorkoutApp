"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWorkout } from '@/lib/contexts/WorkoutContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MuscleGroup } from '@/lib/types';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, workouts, getWeeklyProgress, loading: workoutLoading } = useWorkout();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const muscleGroups: MuscleGroup[] = [
    'Abs',
    'Back',
    'Biceps',
    'Calves',
    'Chest',
    'Forearms',
    'Glutes',
    'Hamstrings',
    'Neck',
    'Quads',
    'Shoulders',
    'Triceps',
    'Upper traps'
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (authLoading || workoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600">Workout Tracker</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Welcome, {userProfile?.name || user?.email}
              </span>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Dashboard</h1>
            <div className="space-x-4">
              <Link
                href="/workouts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Log Workout
              </Link>
              <Link
                href="/progress"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View Progress
              </Link>
            </div>
          </div>
        </div>

        {/* Muscle Group Progress */}
        <div className="px-4 sm:px-0 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Progress (Beginner Level)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {muscleGroups.map((muscleGroup) => {
              const { current, target } = getWeeklyProgress(muscleGroup);
              const percentage = (current / target) * 100;
              const progressColor = getProgressColor(percentage);

              return (
                <Link
                  key={muscleGroup}
                  href={`/muscle-groups/${muscleGroup.toLowerCase().replace(' ', '-')}`}
                  className="block transition-transform hover:scale-105"
                >
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {muscleGroup}
                          </h3>
                        </div>
                        <div className={`${progressColor} flex items-center`}>
                          {percentage >= 90 ? (
                            <ArrowUpIcon className="h-5 w-5" />
                          ) : (
                            <ArrowDownIcon className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-900">
                            {current} / {target} sets
                          </span>
                          <span className={`${progressColor} font-medium`}>{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 overflow-hidden bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              percentage >= 90
                                ? 'bg-green-500'
                                : percentage >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="px-4 sm:px-0">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900">Recent Workouts</h2>
              <p className="mt-2 text-sm text-gray-700">
                A list of your most recent workouts and their details.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link
                href="/workouts"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Duration
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Exercises
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {workouts.slice(0, 5).map((workout) => (
                        <tr key={workout.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                            {new Date(workout.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            {workout.type}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            {workout.duration} min
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            {workout.exercises.length + (workout.cardioExercises?.length || 0)}
                          </td>
                        </tr>
                      ))}
                      {workouts.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 text-center"
                          >
                            No workouts recorded yet. Start by logging your first workout!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 