import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useStopwatch } from "react-timer-hook";
import {
  Platform,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import clsx from "clsx";

import ExerciseSelectionModal from "@/app/components/ExerciseSelectionModal";

import { IWorkoutSet, useWorkoutStore } from "@/store/workout.store";
import exercise from "../../../../sanity/schemaTypes/exercise";

export default function ActiveWorkout() {
  const router = useRouter();
  const {
    workoutExercises,
    setWorkoutExercises,
    addExerciseToWorkout,
    weightUnit,
    setWeightUnit,
    resetWorkout,
  } = useWorkoutStore();

  const { minutes, seconds, reset } = useStopwatch({ autoStart: true });

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

  const cancelWorkout = () => {
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

  const onDeleteExercise = (exerciseId: string) => () => {};

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
              onPress={cancelWorkout}
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
                          <Text className="text-gray-700">Set {index + 1}</Text>
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
