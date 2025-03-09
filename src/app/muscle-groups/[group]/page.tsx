'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWorkout } from '@/lib/contexts/WorkoutContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
  createdAt: Date;
  color: string;
}

interface QuickSet {
  id: string;
  exerciseId: string;
  name: string;
  reps: number;
  weight: number;
  notes?: string;
}

interface ChartDataPoint {
  date: string;
  [key: string]: any;
  averagePower?: number;
  totalReps?: number;
  totalWeight?: number;
  trend?: {
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
}

export default function MuscleGroupPage({ params }: { params: { group: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { workouts, loading: workoutLoading } = useWorkout();
  
  // State for custom exercises
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [addSetSuccess, setAddSetSuccess] = useState(false);
  
  // State for quick sets
  const [quickSets, setQuickSets] = useState<QuickSet[]>([]);
  
  // State for adding new set
  const [selectedExercise, setSelectedExercise] = useState('');
  const [newSet, setNewSet] = useState({
    reps: '',
    weight: '',
    notes: '',
    isBodyweight: false
  });
  
  // State for adding new exercise
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#4F46E5'); // Default indigo color

  const exerciseColors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ];

  // Format muscle group name for display
  const muscleGroup = params.group.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Get exercises for this muscle group
  const muscleGroupExercises = workouts
    .flatMap(workout => workout.exercises)
    .filter(exercise => exercise.muscleGroup.toLowerCase() === params.group);

  // Prepare data for the progress chart with average power calculation
  const chartData = useMemo(() => {
    const dataByDate = new Map<string, { [key: string]: { 
      totalPower: number, 
      setCount: number,
      totalReps: number,
      totalWeight: number 
    } }>();
    
    // Sort sets by date
    const sortedSets = [...quickSets].sort((a, b) => 
      new Date(a.date || new Date()).getTime() - new Date(b.date || new Date()).getTime()
    );

    // Calculate daily averages
    sortedSets.forEach(set => {
      const date = new Date(set.date || new Date()).toLocaleDateString();
      const exercise = customExercises.find(ex => ex.id === set.exerciseId);
      if (!exercise) return;

      const power = set.reps * set.weight;
      
      if (!dataByDate.has(date)) {
        dataByDate.set(date, {});
      }
      
      const dateData = dataByDate.get(date)!;
      if (!dateData[exercise.name]) {
        dateData[exercise.name] = {
          totalPower: 0,
          setCount: 0,
          totalReps: 0,
          totalWeight: 0
        };
      }
      
      dateData[exercise.name].totalPower += power;
      dateData[exercise.name].setCount += 1;
      dateData[exercise.name].totalReps += set.reps;
      dateData[exercise.name].totalWeight += set.weight;
    });

    // Convert to chart data points and calculate trends
    const chartPoints = Array.from(dataByDate.entries()).map(([date, exercises], index, array) => {
      const point: ChartDataPoint = { date };
      
      Object.entries(exercises).forEach(([exerciseName, data]) => {
        const averagePower = data.totalPower / data.setCount;
        point[exerciseName] = averagePower;
        point[`${exerciseName}_reps`] = data.totalReps;
        point[`${exerciseName}_weight`] = data.totalWeight;
        
        // Calculate trend if there's a previous data point
        if (index > 0) {
          const prevPoint = array[index - 1];
          if (prevPoint && prevPoint[exerciseName]) {
            const prevAverage = prevPoint[exerciseName];
            const percentageChange = ((averagePower - prevAverage) / prevAverage) * 100;
            point[`${exerciseName}_trend`] = {
              percentage: Math.abs(percentageChange),
              direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable'
            };
          }
        }
      });
      
      return point;
    });

    return chartPoints;
  }, [quickSets, customExercises]);

  // Custom tooltip component with enhanced information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-3">{label}</p>
        {payload.map((entry: any) => {
          const exercise = customExercises.find(ex => ex.name === entry.name);
          if (!exercise) return null;

          const exerciseName = exercise.name;
          const averagePower = entry.value;
          const totalReps = payload[0].payload[`${exerciseName}_reps`];
          const totalWeight = payload[0].payload[`${exerciseName}_weight`];
          const trend = payload[0].payload[`${exerciseName}_trend`];

          return (
            <div key={entry.name} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: exercise.color }}
                />
                <span className="text-sm font-medium text-gray-900">{exerciseName}</span>
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm text-gray-700">
                  Average Power: {averagePower.toFixed(1)} units
                </p>
                <p className="text-sm text-gray-700">
                  Total Reps: {totalReps} • Total Weight: {totalWeight}kg
                </p>
                {trend && (
                  <p className={`text-sm flex items-center gap-1
                    ${trend.direction === 'up' ? 'text-green-600' : 
                      trend.direction === 'down' ? 'text-red-600' : 
                      'text-gray-600'}`}
                  >
                    {trend.direction === 'up' ? '↑' : 
                     trend.direction === 'down' ? '↓' : '→'}
                    {trend.percentage.toFixed(1)}% from previous day
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Get last set for an exercise
  const getLastSet = (exerciseId: string) => {
    return quickSets.reverse().find(set => set.exerciseId === exerciseId);
  };

  // Add new custom exercise
  const handleAddCustomExercise = () => {
    if (!newExerciseName.trim()) return;

    const newExercise: CustomExercise = {
      id: Date.now().toString(),
      name: newExerciseName,
      muscleGroup: muscleGroup,
      createdAt: new Date(),
      color: selectedColor
    };

    setCustomExercises([...customExercises, newExercise]);
    setNewExerciseName('');
    setSelectedColor(exerciseColors[0]);
    setShowAddExercise(false);
  };

  // Add new set
  const handleAddSet = (exerciseId: string) => {
    if (!newSet.reps || (!newSet.weight && !newSet.isBodyweight)) return;

    const exercise = customExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const quickSet: QuickSet = {
      id: Date.now().toString(),
      exerciseId: exerciseId,
      name: exercise.name,
      reps: Number(newSet.reps),
      weight: Number(newSet.weight),
      notes: newSet.notes
    };

    setQuickSets([quickSet, ...quickSets]);
    setNewSet({ reps: '', weight: '', notes: '', isBodyweight: false });
    setAddSetSuccess(true);
    setTimeout(() => {
      setAddSetSuccess(false);
    }, 2000);
  };

  // Calculate progress for muscle group
  const getMuscleGroupProgress = () => {
    const totalSets = quickSets.length;
    const target = 10; // Example target, adjust based on your requirements
    return {
      current: totalSets,
      target,
      percentage: Math.min((totalSets / target) * 100, 100)
    };
  };

  // Remove the individual exercise progress calculation since we're tracking muscle group progress
  const getExerciseProgress = (exerciseId: string) => {
    const exerciseSets = quickSets.filter(set => set.exerciseId === exerciseId);
    return exerciseSets.length;
  };

  // Filter visible exercises in chart
  const [visibleExercises, setVisibleExercises] = useState<Set<string>>(new Set());

  // Toggle exercise visibility in chart
  const toggleExerciseVisibility = (exerciseId: string) => {
    const newVisible = new Set(visibleExercises);
    if (newVisible.has(exerciseId)) {
      newVisible.delete(exerciseId);
    } else {
      newVisible.add(exerciseId);
    }
    setVisibleExercises(newVisible);
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">{muscleGroup}</h1>
          
          {/* Progress Chart */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Progress Over Time</h2>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    name="Average Power"
                    label={{ 
                      value: 'Average Power (reps × weight)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {customExercises
                    .filter(ex => visibleExercises.has(ex.id))
                    .map(exercise => {
                      const lastPoint = chartData[chartData.length - 1];
                      const trend = lastPoint?.[`${exercise.name}_trend`];
                      
                      return (
                        <Line
                          key={exercise.id}
                          type="monotone"
                          dataKey={exercise.name}
                          name={exercise.name}
                          stroke={exercise.color}
                          strokeWidth={2}
                          dot={(props: any) => {
                            const isLast = props.index === chartData.length - 1;
                            if (!isLast) {
                              return (
                                <circle
                                  cx={props.cx}
                                  cy={props.cy}
                                  r={4}
                                  fill={exercise.color}
                                  stroke="none"
                                />
                              );
                            }
                            
                            // Last point with trend indicator
                            return (
                              <g>
                                <circle
                                  cx={props.cx}
                                  cy={props.cy}
                                  r={5}
                                  fill={exercise.color}
                                  stroke="white"
                                  strokeWidth={2}
                                />
                                {trend && (
                                  <path
                                    d={trend.direction === 'up' ? 
                                      `M${props.cx-4},${props.cy+6} L${props.cx},${props.cy+2} L${props.cx+4},${props.cy+6}` :
                                      trend.direction === 'down' ?
                                      `M${props.cx-4},${props.cy-6} L${props.cx},${props.cy-2} L${props.cx+4},${props.cy-6}` :
                                      `M${props.cx-4},${props.cy} L${props.cx+4},${props.cy}`
                                    }
                                    stroke={trend.direction === 'up' ? '#16A34A' : 
                                           trend.direction === 'down' ? '#DC2626' : 
                                           '#6B7280'}
                                    strokeWidth={2}
                                    fill="none"
                                  />
                                )}
                              </g>
                            );
                          }}
                          activeDot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: 'white'
                          }}
                          connectNulls
                          animationDuration={750}
                          animationEasing="ease-in-out"
                        />
                      );
                    })}
                  <ReferenceLine
                    y={0}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Legend with Trend Summary */}
            <div className="mt-4 flex flex-wrap gap-4">
              {customExercises
                .filter(ex => visibleExercises.has(ex.id))
                .map(exercise => {
                  const lastPoint = chartData[chartData.length - 1];
                  const trend = lastPoint?.[`${exercise.name}_trend`];
                  
                  return (
                    <div 
                      key={exercise.id}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: exercise.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {exercise.name}
                      </span>
                      {trend && (
                        <span className={`text-sm ${
                          trend.direction === 'up' ? 'text-green-600' : 
                          trend.direction === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {trend.direction === 'up' ? '↑' : 
                           trend.direction === 'down' ? '↓' : '→'}
                          {trend.percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Custom Exercise Library */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Exercise Library</h2>
              <button
                onClick={() => setShowAddExercise(!showAddExercise)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {showAddExercise ? 'Cancel' : 'Add Exercise'}
              </button>
            </div>
            
            {/* Add new exercise */}
            {showAddExercise && (
              <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder="New exercise name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {exerciseColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedColor === color ? 'border-gray-400' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAddCustomExercise}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Exercise filters */}
            <div className="mb-4 flex flex-wrap gap-2">
              {customExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => toggleExerciseVisibility(exercise.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    visibleExercises.has(exercise.id) ? 'text-white' : 'text-gray-700 bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: visibleExercises.has(exercise.id) ? exercise.color : undefined
                  }}
                >
                  {exercise.name}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="space-y-4">
              {customExercises.map((exercise) => {
                const setsCount = getExerciseProgress(exercise.id);
                const lastSet = getLastSet(exercise.id);
                const isExpanded = expandedExercise === exercise.id;
                const hasMetGoal = setsCount >= getMuscleGroupProgress().target;
                const isVisible = visibleExercises.has(exercise.id);

                return (
                  <div key={exercise.id} className="space-y-2">
                    <div
                      className={`relative overflow-hidden border rounded-lg transition-colors duration-200 ${
                        isExpanded ? 'border-2' : ''
                      }`}
                      style={{
                        borderColor: isExpanded ? exercise.color : undefined
                      }}
                    >
                      {/* Colored strip */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: exercise.color }}
                      />

                      <div className="flex items-center p-4">
                        <button
                          onClick={() => toggleExerciseVisibility(exercise.id)}
                          className="mr-3 p-1 rounded-full hover:bg-gray-100"
                          title={isVisible ? 'Hide from graph' : 'Show in graph'}
                        >
                          {isVisible ? (
                            <EyeIcon className="w-5 h-5 text-gray-600" />
                          ) : (
                            <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        <button
                          onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                          className="flex-1 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">
                              {exercise.name}
                            </h3>
                            {hasMetGoal && (
                              <svg
                                className="w-5 h-5 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                            {setsCount > 0 && (
                              <span className="text-sm text-gray-500">
                                {setsCount} sets
                              </span>
                            )}
                          </div>

                          <svg
                            className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div 
                        className="border rounded-lg p-4 bg-white space-y-4"
                        style={{ borderColor: exercise.color }}
                      >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Reps
                            </label>
                            <input
                              type="number"
                              value={newSet.reps}
                              onChange={(e) => setNewSet({ ...newSet, reps: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Weight (kg)
                            </label>
                            <div className="flex items-center gap-4">
                              <input
                                type="number"
                                value={newSet.weight}
                                onChange={(e) => setNewSet({ ...newSet, weight: e.target.value })}
                                disabled={newSet.isBodyweight}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                              />
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="checkbox"
                                  id={`bodyweight-${exercise.id}`}
                                  checked={newSet.isBodyweight}
                                  onChange={(e) => {
                                    setNewSet({
                                      ...newSet,
                                      isBodyweight: e.target.checked,
                                      weight: e.target.checked ? '0' : ''
                                    });
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`bodyweight-${exercise.id}`} className="text-sm text-gray-700">
                                  Bodyweight
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Notes
                          </label>
                          <textarea
                            value={newSet.notes}
                            onChange={(e) => setNewSet({ ...newSet, notes: e.target.value })}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                            placeholder="How did this set feel?"
                          />
                        </div>

                        <div className="flex gap-4">
                          {lastSet && (
                            <button
                              onClick={() => {
                                setNewSet({
                                  reps: lastSet.reps.toString(),
                                  weight: lastSet.weight.toString(),
                                  notes: '',
                                  isBodyweight: lastSet.weight === 0
                                });
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Autofill from Last Set
                            </button>
                          )}
                          <button
                            onClick={() => handleAddSet(exercise.id)}
                            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Add Set
                          </button>
                        </div>

                        {addSetSuccess && (
                          <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md">
                            Set added successfully!
                          </div>
                        )}

                        {/* Recent Sets for this exercise */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Sets</h4>
                          <div className="space-y-2">
                            {quickSets
                              .filter(set => set.exerciseId === exercise.id)
                              .slice(0, 3)
                              .map(set => (
                                <div
                                  key={set.id}
                                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                                >
                                  <span className="text-sm text-gray-600">
                                    {set.reps} reps @ {set.weight}kg
                                  </span>
                                  {set.notes && (
                                    <span className="text-sm text-gray-500 italic">
                                      {set.notes}
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 