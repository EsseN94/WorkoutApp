'use client';

import { useState } from 'react';
import { useWorkout } from '@/lib/hooks/useWorkout';
import { CheckCircleIcon, PencilIcon } from '@heroicons/react/24/solid';
import { WorkoutSet } from '@/lib/types';

export default function TodaysWorkout() {
  const { getTodaysWorkout, playlists, completeSet } = useWorkout();
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<{id: string, exerciseId: string} | null>(null);
  const [editValues, setEditValues] = useState<{reps: number, weight: number}>({ reps: 0, weight: 0 });

  const todaysWorkout = getTodaysWorkout();
  if (!todaysWorkout) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500 text-center">No workout scheduled for today</p>
      </div>
    );
  }

  const playlist = playlists.find(p => p.id === todaysWorkout.playlistId);
  if (!playlist) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500 text-center">Workout plan not found</p>
      </div>
    );
  }

  // Calculate total sets and completed sets across all exercises
  const totalSets = playlist.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = playlist.exercises.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.completed).length, 0
  );
  
  // Calculate overall progress percentage
  const overallProgress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleEditSet = (set: WorkoutSet, exerciseId: string) => {
    setEditingSet({ id: set.id, exerciseId });
    setEditValues({ reps: set.reps, weight: set.weight });
  };

  const handleSaveEdit = async (exerciseId: string) => {
    if (!editingSet) return;

    // Find the exercise and set
    const exercise = playlist.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const setIndex = exercise.sets.findIndex(s => s.id === editingSet.id);
    if (setIndex === -1) return;

    // Create updated exercise with new set values
    const updatedExercise = {
      ...exercise,
      sets: exercise.sets.map((set, index) => 
        index === setIndex 
          ? { ...set, reps: editValues.reps, weight: editValues.weight }
          : set
      )
    };

    // Update the playlist with the new exercise
    const updatedPlaylist = {
      ...playlist,
      exercises: playlist.exercises.map(e => 
        e.id === exerciseId ? updatedExercise : e
      )
    };

    // TODO: Add updatePlaylist to WorkoutContext and call it here
    // await updatePlaylist(updatedPlaylist);

    setEditingSet(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500">
            {overallProgress}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {playlist.exercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise.id;
          const completedSets = exercise.sets.filter(set => set.completed).length;
          const progress = (completedSets / exercise.sets.length) * 100;

          return (
            <div 
              key={exercise.id}
              className="rounded-lg overflow-hidden"
            >
              {/* Exercise Header */}
              <button
                onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: exercise.color + '10' }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: exercise.color }}
                  />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                    <p className="text-sm text-gray-500">
                      {completedSets} of {exercise.sets.length} sets completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Mini Progress Bar */}
                  <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 ease-in-out"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: exercise.color
                      }}
                    />
                  </div>
                  {/* Expand/Collapse Arrow */}
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Sets */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="grid grid-cols-5 gap-4 p-4 text-sm font-medium text-gray-500">
                    <div>Set</div>
                    <div>Weight</div>
                    <div>Reps</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  {exercise.sets.map((set, index) => (
                    <div 
                      key={set.id}
                      className="grid grid-cols-5 gap-4 px-4 py-2 hover:bg-gray-50"
                    >
                      <div className="text-gray-500">#{index + 1}</div>
                      {editingSet?.id === set.id ? (
                        <>
                          <div>
                            <input
                              type="number"
                              value={editValues.weight}
                              onChange={(e) => setEditValues({ ...editValues, weight: Number(e.target.value) })}
                              className="w-20 px-2 py-1 border rounded"
                            />
                            <span className="ml-1">lbs</span>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={editValues.reps}
                              onChange={(e) => setEditValues({ ...editValues, reps: Number(e.target.value) })}
                              className="w-16 px-2 py-1 border rounded"
                            />
                          </div>
                          <div>
                            <button
                              onClick={() => handleSaveEdit(exercise.id)}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200"
                            >
                              Save
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={() => setEditingSet(null)}
                              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-gray-900">{set.weight} lbs</div>
                          <div className="text-gray-900">{set.reps}</div>
                          <div>
                            <button
                              onClick={() => completeSet(todaysWorkout.id, exercise.id, set.id)}
                              disabled={set.completed}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                                set.completed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              {set.completed ? (
                                <>
                                  <CheckCircleIcon className="h-4 w-4" />
                                  <span>Done</span>
                                </>
                              ) : (
                                <span>Complete</span>
                              )}
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={() => handleEditSet(set, exercise.id)}
                              disabled={set.completed}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {todaysWorkout.completed && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-medium">Workout completed! Great job!</span>
          </div>
        </div>
      )}
    </div>
  );
} 