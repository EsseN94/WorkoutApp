'use client';

import { useState } from 'react';
import { useWorkout } from '@/lib/hooks/useWorkout';
import { DayOfWeek, MuscleGroup, WorkoutExercise, WorkoutSet, WorkoutPlaylist } from '@/lib/types';
import { 
  PlusCircleIcon, 
  XMarkIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function WorkoutPlansPage() {
  const { 
    playlists, 
    createPlaylist, 
    updatePlaylist,
    deletePlaylist,
    workoutWeeks,
    createWorkoutWeek,
    updateWorkoutWeek
  } = useWorkout();

  const [newPlanName, setNewPlanName] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<WorkoutPlaylist | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroups: [] as MuscleGroup[],
    sets: [] as WorkoutSet[]
  });

  const handleCreatePlan = async () => {
    if (!newPlanName || selectedExercises.length === 0) return;

    const playlist = await createPlaylist(newPlanName, undefined, selectedExercises);
    
    if (selectedDay && isRecurring) {
      const schedule = {
        [DayOfWeek.Monday]: '',
        [DayOfWeek.Tuesday]: '',
        [DayOfWeek.Wednesday]: '',
        [DayOfWeek.Thursday]: '',
        [DayOfWeek.Friday]: '',
        [DayOfWeek.Saturday]: '',
        [DayOfWeek.Sunday]: ''
      };
      schedule[selectedDay] = playlist.id;
      await createWorkoutWeek(`${newPlanName} Week`, schedule);
    }

    // Reset form
    setNewPlanName('');
    setSelectedDay(null);
    setSelectedExercises([]);
  };

  const handleAddExercise = (exercise: WorkoutExercise) => {
    const defaultSets = Array(3).fill(null).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      exerciseId: exercise.id,
      weight: 0,
      reps: 0,
      isBodyweight: false,
      completed: false
    }));

    setSelectedExercises([...selectedExercises, {
      ...exercise,
      sets: defaultSets
    }]);
  };

  const handleUpdateSets = (exerciseIndex: number, numSets: number) => {
    const exercise = selectedExercises[exerciseIndex];
    if (!exercise) return;

    const currentSets = exercise.sets;
    let newSets = [...currentSets];

    if (numSets > currentSets.length) {
      // Add more sets
      const additionalSets = Array(numSets - currentSets.length).fill(null).map((_, i) => ({
        id: `${Date.now()}-${currentSets.length + i}`,
        exerciseId: exercise.id,
        weight: currentSets[0]?.weight || 0,
        reps: currentSets[0]?.reps || 0,
        isBodyweight: currentSets[0]?.isBodyweight || false,
        completed: false
      }));
      newSets = [...currentSets, ...additionalSets];
    } else if (numSets < currentSets.length) {
      // Remove sets
      newSets = currentSets.slice(0, numSets);
    }

    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex] = {
      ...exercise,
      sets: newSets
    };
    setSelectedExercises(updatedExercises);
  };

  const handleCreateCustomExercise = () => {
    if (!newExercise.name || newExercise.muscleGroups.length === 0) return;

    const exercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      muscleGroup: newExercise.muscleGroups[0], // Primary muscle group
      secondaryMuscleGroups: newExercise.muscleGroups.slice(1), // Secondary muscle groups
      sets: [],
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    };

    handleAddExercise(exercise);
    setShowNewExerciseForm(false);
    setNewExercise({ name: '', muscleGroups: [], sets: [] });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workout Plans</h1>
        <Link 
          href="/dashboard"
          className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Create New Plan Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Workout Plan</h2>
        
        <div className="space-y-4">
          {/* Plan Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="e.g., Upper Body A, Leg Day"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Day (Optional)
            </label>
            <div className="grid grid-cols-7 gap-2">
              {Object.values(DayOfWeek).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedDay === day 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Toggle */}
          {selectedDay && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="recurring" className="text-sm text-gray-700">
                Make this a recurring weekly workout
              </label>
            </div>
          )}

          {/* Exercise Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Exercises
              </label>
              <button
                onClick={() => setShowNewExerciseForm(true)}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1"
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span>Add Custom Exercise</span>
              </button>
            </div>

            {/* Selected Exercises List */}
            <div className="space-y-2 mb-4">
              {selectedExercises.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{exercise.name}</span>
                    <div className="text-sm text-gray-500">
                      {exercise.muscleGroup}
                      {exercise.secondaryMuscleGroups?.map(group => `, ${group}`)}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Sets:</label>
                      <select
                        value={exercise.sets.length}
                        onChange={(e) => handleUpdateSets(index, parseInt(e.target.value))}
                        className="text-sm border rounded px-2 py-1 text-gray-900"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const newExercises = [...selectedExercises];
                        if (index > 0) {
                          [newExercises[index], newExercises[index - 1]] = 
                          [newExercises[index - 1], newExercises[index]];
                          setSelectedExercises(newExercises);
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      disabled={index === 0}
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        const newExercises = [...selectedExercises];
                        if (index < selectedExercises.length - 1) {
                          [newExercises[index], newExercises[index + 1]] = 
                          [newExercises[index + 1], newExercises[index]];
                          setSelectedExercises(newExercises);
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      disabled={index === selectedExercises.length - 1}
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        const newExercises = selectedExercises.filter((_, i) => i !== index);
                        setSelectedExercises(newExercises);
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Plan Button */}
          <button
            onClick={handleCreatePlan}
            disabled={!newPlanName || selectedExercises.length === 0}
            className={`w-full py-3 rounded-lg font-medium transition-colors
              ${!newPlanName || selectedExercises.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            Create Workout Plan
          </button>
        </div>
      </div>

      {/* Custom Exercise Form Modal */}
      {showNewExerciseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Custom Exercise</h3>
              <button
                onClick={() => setShowNewExerciseForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Exercise Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  placeholder="e.g., Bulgarian Split Squat"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              {/* Muscle Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Muscle Groups
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(MuscleGroup).filter(group => typeof group === 'string').map((group) => (
                    <button
                      key={group}
                      onClick={() => {
                        const groups = newExercise.muscleGroups.includes(group as MuscleGroup)
                          ? newExercise.muscleGroups.filter(g => g !== group)
                          : [...newExercise.muscleGroups, group as MuscleGroup];
                        setNewExercise({ ...newExercise, muscleGroups: groups });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${newExercise.muscleGroups.includes(group as MuscleGroup)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                    >
                      {group === MuscleGroup.UpperTraps ? 'Upper Traps' : group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Exercise Button */}
              <button
                onClick={handleCreateCustomExercise}
                disabled={!newExercise.name || newExercise.muscleGroups.length === 0}
                className={`w-full py-3 rounded-lg font-medium transition-colors
                  ${!newExercise.name || newExercise.muscleGroups.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Add Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Plans List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Workout Plans</h2>
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{playlist.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingPlaylist(playlist)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {playlist.exercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: exercise.color + '10' }}
                >
                  <div>
                    <span className="font-medium text-gray-900">{exercise.name}</span>
                    <div className="text-sm text-gray-500">
                      {exercise.sets.length} sets
                    </div>
                  </div>
                  <div 
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: exercise.color }}
                  />
                </div>
              ))}
            </div>

            {/* Schedule Information */}
            {workoutWeeks.some(week => 
              Object.values(week.schedule).includes(playlist.id)
            ) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Recurring on: </span>
                  {Object.entries(workoutWeeks[0].schedule)
                    .filter(([_, id]) => id === playlist.id)
                    .map(([day]) => (
                      <span key={day} className="font-medium">
                        {day}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Playlist Modal */}
      {editingPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Workout Plan</h3>
              <button
                onClick={() => setEditingPlaylist(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Plan Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={editingPlaylist.name}
                  onChange={(e) => setEditingPlaylist({
                    ...editingPlaylist,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              {/* Exercises List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercises
                </label>
                <div className="space-y-2">
                  {editingPlaylist.exercises.map((exercise, index) => (
                    <div 
                      key={exercise.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: exercise.color + '10' }}
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{exercise.name}</span>
                        <div className="text-sm text-gray-500">
                          {exercise.muscleGroup}
                          {exercise.secondaryMuscleGroups?.map(group => `, ${group}`)}
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Sets:</label>
                          <select
                            value={exercise.sets.length}
                            onChange={(e) => {
                              const numSets = parseInt(e.target.value);
                              const updatedExercises = [...editingPlaylist.exercises];
                              const currentSets = exercise.sets;
                              let newSets = [...currentSets];

                              if (numSets > currentSets.length) {
                                const additionalSets = Array(numSets - currentSets.length)
                                  .fill(null)
                                  .map((_, i) => ({
                                    id: `${Date.now()}-${currentSets.length + i}`,
                                    exerciseId: exercise.id,
                                    weight: currentSets[0]?.weight || 0,
                                    reps: currentSets[0]?.reps || 0,
                                    isBodyweight: currentSets[0]?.isBodyweight || false,
                                    completed: false
                                  }));
                                newSets = [...currentSets, ...additionalSets];
                              } else {
                                newSets = currentSets.slice(0, numSets);
                              }

                              updatedExercises[index] = {
                                ...exercise,
                                sets: newSets
                              };

                              setEditingPlaylist({
                                ...editingPlaylist,
                                exercises: updatedExercises
                              });
                            }}
                            className="text-sm border rounded px-3 py-1 text-gray-900 appearance-none w-16 text-center"
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newExercises = [...editingPlaylist.exercises];
                            if (index > 0) {
                              [newExercises[index], newExercises[index - 1]] = 
                              [newExercises[index - 1], newExercises[index]];
                              setEditingPlaylist({
                                ...editingPlaylist,
                                exercises: newExercises
                              });
                            }
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          disabled={index === 0}
                        >
                          <ChevronUpIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            const newExercises = [...editingPlaylist.exercises];
                            if (index < editingPlaylist.exercises.length - 1) {
                              [newExercises[index], newExercises[index + 1]] = 
                              [newExercises[index + 1], newExercises[index]];
                              setEditingPlaylist({
                                ...editingPlaylist,
                                exercises: newExercises
                              });
                            }
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          disabled={index === editingPlaylist.exercises.length - 1}
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            const newExercises = editingPlaylist.exercises.filter((_, i) => i !== index);
                            setEditingPlaylist({
                              ...editingPlaylist,
                              exercises: newExercises
                            });
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={() => {
                  updatePlaylist(editingPlaylist);
                  setEditingPlaylist(null);
                }}
                className="w-full py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 