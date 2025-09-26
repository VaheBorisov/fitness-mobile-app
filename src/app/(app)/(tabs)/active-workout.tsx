import { useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import { useStopwatch } from "react-timer-hook";

import {
  Platform,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";

import clsx from "clsx";

import { useWorkoutStore } from "@/store/workout.store";

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
    </View>
  );
}
