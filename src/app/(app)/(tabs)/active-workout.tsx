import { useState, useCallback, useMemo } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useStopwatch } from "react-timer-hook";
import { useUser } from "@clerk/clerk-expo";

import {
  Platform,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import clsx from "clsx";

import { useWorkoutStore } from "@/store/workout.store";

import ExerciseSelectionModal from "@/app/components/ExerciseSelectionModal";

import { client } from "@/lib/sanity/client";
import { findExerciseQuery } from "@/sanity-queries";

import type { IWorkoutData, IWorkoutSet } from "@/types";

export default function ActiveWorkout() {
  const { user } = useUser();

  const router = useRouter();
  const {
    workoutExercises,
    setWorkoutExercises,
    addExerciseToWorkout,
    weightUnit,
    setWeightUnit,
    resetWorkout,
  } = useWorkoutStore();

  const { minutes, seconds, totalSeconds, reset } = useStopwatch({
    autoStart: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (workoutExercises.length === 0) {
        reset();
      }
    }, [workoutExercises.length, reset]),
  );

  const getWorkoutDuration = () =>
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const saveWorkoutToDatabase = async () => {
    if (isSaving) return false;

    setIsSaving(true);

    try {
      const durationInSeconds = totalSeconds;

      const exercisesForSanity = await Promise.all(
        workoutExercises.map(async (exercise) => {
          const exerciseDoc = await client.fetch(findExerciseQuery, {
            name: exercise.name,
          });

          if (!exerciseDoc) {
            throw new Error(`Exercise "${exercise.name}" not found.`);
          }

          const setsForSanity = exercise.sets
            .filter((set) => set.isCompleted && set.reps && set.weight)
            .map((set) => ({
              _type: "set",
              _key: Math.random().toString(36).substring(2, 11),
              reps: parseInt(set.reps, 10) || 0,
              weight: parseFloat(set.weight) || 0,
              weightUnit: set.weightUnit,
            }));

          return {
            _type: "workoutExercise",
            _key: Math.random().toString(36).substring(2, 11),
            exercise: {
              _type: "reference",
              _ref: exerciseDoc._id,
            },
            sets: setsForSanity,
          };
        }),
      );

      const validExercises = exercisesForSanity.filter(
        (exercise) => exercise.sets.length,
      );

      if (!validExercises.length) {
        Alert.alert(
          "No Completed Sets",
          "Please complete at least one set before saving the workout.",
        );
        return false;
      }

      const workoutData: IWorkoutData = {
        _type: "workout",
        userId: user.id,
        date: new Date().toISOString(),
        duration: durationInSeconds,
        exercises: validExercises,
      };

      const result = await fetch("/api/save-workout", {
        method: "POST",
        body: JSON.stringify({ workoutData }),
      });

      console.log("Workout saved successfully", result);
      return true;
    } catch (e) {
      console.error("Error saving workout", e);
      Alert.alert("Save Failed", "Failed to save workout. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const completeWorkout = async () => {
    const saved = await saveWorkoutToDatabase();

    if (saved) {
      Alert.alert("Workout Saved", "Your workout has been saved successfully!");

      resetWorkout();
      router.replace("/(app)/(tabs)/history?refresh=true");
    }
  };

  const onSaveWorkout = () => {
    Alert.alert(
      "Complete Workout",
      "Are you sure want to complete the workout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Complete", onPress: async () => await completeWorkout() },
      ],
    );
  };

  const onCancelWorkout = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel the workout?",
      [
        { text: "No", style: "cancel" },
        {
          text: "End Workout",
          onPress: () => {
            resetWorkout();
            router.back();
          },
        },
      ],
    );
  };

  const addExercise = () => setShowExerciseSelection(true);

  const onDeleteExercise = (exerciseId: string) => () => {
    setWorkoutExercises((exercises) =>
      exercises.filter((exercise) => exercise.id !== exerciseId),
    );
  };

  const addNewSet = (exerciseId: string) => () => {
    const newSet: IWorkoutSet = {
      id: Math.random().toString(),
      reps: "",
      weight: "",
      weightUnit: weightUnit,
      isCompleted: false,
    };

    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise,
      ),
    );
  };

  const updateSet =
    (exerciseId: string, setId: string, field: "reps" | "weight") =>
    (value: string) => {
      setWorkoutExercises((exercises) =>
        exercises.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((set) =>
                  set.id === setId
                    ? {
                        ...set,
                        [field]: value,
                      }
                    : set,
                ),
              }
            : exercise,
        ),
      );
    };

  const onSetCompletion = (exerciseId: string, setId: string) => () => {
    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? {
                      ...set,
                      isCompleted: !set.isCompleted,
                    }
                  : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const onDeleteSet = (exerciseId: string, setId: string) => () => {
    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise,
      ),
    );
  };

  const disabledSaveButton = useMemo(
    () =>
      isSaving ||
      !workoutExercises.length ||
      workoutExercises.some((exercise) =>
        exercise.sets.some((set) => !set.isCompleted),
      ),
    [isSaving, workoutExercises],
  );

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Top Safe Area */}
      <View
        className="bg-gray-800"
        style={{
          paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0,
        }}
      />

      {/* Header  */}
      <View className="bg-gray-800 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-xl font-semibold">
              Active Workout
            </Text>
            <Text className="text-gray-300">{getWorkoutDuration()}</Text>
          </View>
          <View className="flex-row items-center space-x-3 gap-2">
            {/* Weight Unit Toggle */}
            <View className="flex-row bg-gray-700 rounded-lg p-1">
              <TouchableOpacity
                onPress={() => setWeightUnit("lbs")}
                className={clsx(
                  "px-3 py-1 rounded",
                  weightUnit === "lbs" ? "bg-blue-600" : "",
                )}
              >
                <Text
                  className={clsx(
                    "text-sm font-medium",
                    weightUnit === "lbs" ? "text-white" : "text-gray-300",
                  )}
                >
                  lbs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWeightUnit("kg")}
                className={clsx(
                  "px-3 py-1 rounded",
                  weightUnit === "kg" ? "bg-blue-600" : "",
                )}
              >
                <Text
                  className={clsx(
                    "text-sm font-medium",
                    weightUnit === "kg" ? "text-white" : "text-gray-300",
                  )}
                >
                  kg
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onCancelWorkout}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">End Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content Area with a white background */}
      <View className="flex-1 bg-white">
        {/* Workout Progress */}
        <View className="px-6 mt-4">
          <Text className="text-center text-gray-600 mb-2">
            {workoutExercises.length} exercises
          </Text>
        </View>

        {/* If no exercises, show a message */}
        {workoutExercises.length === 0 && (
          <View className="bg-gray-50 rounded-2xl p-8 items-center mx-6">
            <Ionicons name="barbell-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-600 text-lg text-center mt-4 font-medium">
              No exercises yet
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Get started by adding your first exercise below
            </Text>
          </View>
        )}

        {/* All exercises - Vertical List */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="flex-1 px-6 mt-4">
            {workoutExercises.map((exercise) => (
              <View key={exercise.id} className="mb-8">
                {/* Exercise Header */}
                <TouchableOpacity
                  className="bg-blue-50 rounded-2xl p-4 mb-3"
                  onPress={() =>
                    router.push({
                      pathname: "/exercise-detail",
                      params: { id: exercise.sanityId },
                    })
                  }
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-gray-900 mb-2">
                        {exercise.name}
                      </Text>
                      <Text className="text-gray-600">
                        {exercise.sets.length} sets -{" "}
                        {exercise.sets.filter((set) => set.isCompleted).length}{" "}
                        completed
                      </Text>
                    </View>

                    {/* Delete Exercise Button */}
                    <TouchableOpacity
                      className="w-10 h-10 rounded-xl items-center justify-center bg-red-500 ml-3"
                      onPress={onDeleteExercise(exercise.id)}
                    >
                      <Ionicons name="trash" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                {/* Exercise sets */}
                <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">
                    Sets
                  </Text>
                  {!exercise.sets.length ? (
                    <Text className="text-gray-500 text-center py-4">
                      No sets yet. Add your first set below.
                    </Text>
                  ) : (
                    exercise.sets.map((set, index) => (
                      <View
                        key={set.id}
                        className={clsx(
                          "py-3 px-3 mb-2 rounded-lg border",
                          set.isCompleted
                            ? "bg-green-100 border-green-300"
                            : "bg-gray-50 border-gray-200",
                        )}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-700">{index + 1}</Text>

                          {/* Reps input */}
                          <View className="flex-1 mx-2">
                            <Text className="text-xs text-gray-500 mb-1">
                              Reps
                            </Text>
                            <TextInput
                              value={set.reps}
                              onChangeText={updateSet(
                                exercise.id,
                                set.id,
                                "reps",
                              )}
                              placeholder="0"
                              keyboardType="numeric"
                              className={clsx(
                                "border rounded-lg px-3 py-2 text-center",
                                set.isCompleted
                                  ? "bg-gray-100 border-gray-300 text-gray-500"
                                  : "bg-white border-gray-300",
                              )}
                              editable={!set.isCompleted}
                            />
                          </View>

                          {/* Weight input */}
                          <View className="flex-1 mx-2">
                            <Text className="text-xs text-gray-500 mb-1">
                              Weight ({weightUnit})
                            </Text>
                            <TextInput
                              value={set.weight}
                              onChangeText={updateSet(
                                exercise.id,
                                set.id,
                                "weight",
                              )}
                              placeholder="0"
                              keyboardType="numeric"
                              className={clsx(
                                "border rounded-lg px-3 py-2 text-center",
                                set.isCompleted
                                  ? "bg-gray-100 border-gray-300 text-gray-500"
                                  : "bg-white border-gray-300",
                              )}
                              editable={!set.isCompleted}
                            />
                          </View>

                          {/* Complete Button */}
                          <TouchableOpacity
                            className={clsx(
                              "w-12 h-12 rounded-xl items-center justify-center mx-1",
                              set.isCompleted ? "bg-green-500" : "bg-gray-200",
                            )}
                            onPress={onSetCompletion(exercise.id, set.id)}
                          >
                            <Ionicons
                              name={
                                set.isCompleted
                                  ? "checkmark"
                                  : "checkmark-outline"
                              }
                              size={20}
                              color={set.isCompleted ? "white" : "#9CA3AF"}
                            />
                          </TouchableOpacity>

                          {/* Delete Button */}
                          <TouchableOpacity
                            onPress={onDeleteSet(exercise.id, set.id)}
                            className="w-12 h-12 rounded-xl items-center justify-center bg-red-500 ml-1"
                          >
                            <Ionicons name="trash" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}

                  {/* Add New Set Button */}
                  <TouchableOpacity
                    className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg py-3 items-center mt-2"
                    onPress={addNewSet(exercise.id)}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="add"
                        size={16}
                        color="#3B82F6"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-blue-600 font-medium">Add Set</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add Exercise Button */}
            <TouchableOpacity
              onPress={addExercise}
              className="bg-blue-600 rounded-2xl py-4 items-center mb-8 active:bg-blue-700"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="add"
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-semibold text-lg">
                  Add Exercise
                </Text>
              </View>
            </TouchableOpacity>

            {/* Complete Workout Button */}
            <TouchableOpacity
              onPress={onSaveWorkout}
              className={clsx(
                "rounded-2xl py-4 items-center mb-8",
                disabledSaveButton
                  ? "bg-gray-400"
                  : "bg-green-600 active:bg-green-700",
              )}
              disabled={disabledSaveButton}
            >
              {isSaving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Complete Workout
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Exercise Selection Modal */}
      <ExerciseSelectionModal
        visible={showExerciseSelection}
        onClose={() => setShowExerciseSelection(false)}
      />
    </View>
  );
}
