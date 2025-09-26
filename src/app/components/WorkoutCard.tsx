import { useMemo } from "react";
import { useRouter } from "expo-router";

import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { formatDate, formatDuration } from "@/helpers/date";

import type { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import exercise from "../../../sanity/schemaTypes/exercise";

interface IWorkoutCardProps {
  workout: GetWorkoutsQueryResult[number];
}

export default function WorkoutCard({ workout }: IWorkoutCardProps) {
  const router = useRouter();

  const totalSets = useMemo(
    () =>
      workout.exercises?.reduce(
        (total, exercise) => total + (exercise.sets?.length || 0),
        0,
      ) || 0,
    [workout.exercises],
  );

  const exerciseNames = useMemo(
    () =>
      workout.exercises?.map(({ exercise }) => exercise.name).filter(Boolean) ||
      [],
    [workout.exercises],
  );

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: "/history/workout-record",
          params: { workoutId: workout._id },
        });
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {formatDate(workout.date || "")}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              {formatDuration(workout.duration)}
            </Text>
          </View>
        </View>
        <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
          <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
        </View>
      </View>

      {/* Workout Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-gray-100 rounded-lg px-3 py-2 mr-3">
            <Text className="text-sm font-medium text-gray-700">
              {workout.exercises?.length || 0} exercises
            </Text>
          </View>
          <View className="bg-gray-100 rounded-lg px-3 py-2">
            <Text className="text-sm font-medium text-gray-700">
              {totalSets} sets
            </Text>
          </View>
        </View>
      </View>

      {/* Workour List */}
      {workout.exercises && workout.exercises.length > 0 && (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Exercises:
          </Text>
          <View className="flex-row flex-wrap">
            {exerciseNames.slice(0, 3).map((name, i) => (
              <View
                key={i}
                className="bg-blue-50 rounded-lg px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-blue-700 text-sm font-medium">
                  {name}
                </Text>
              </View>
            ))}
            {exerciseNames.length > 3 && (
              <View className="bg-gray-100 rounded-lg px-3 py-1 mr-2 mb-2">
                <Text className="text-gray-600 text-sm font-medium">
                  +{exerciseNames.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
