import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { GetWorkoutRecordQueryResult } from "@/lib/sanity/types";

interface IWorkoutExerciseCardProps {
  exercise: GetWorkoutRecordQueryResult["exercises"][number];
  orderNumber: number;
}

export default function WorkoutExerciseCard({
  exercise,
  orderNumber,
}: IWorkoutExerciseCardProps) {
  const { volume, unit } = exercise.sets.reduce(
    (acc, set) => {
      if (set.weight && set.reps)
        return {
          volume: acc.volume + set.weight * set.reps,
          unit: set.weightUnit || "lbs",
        };
      return acc;
    },
    { volume: 0, unit: "lbs" },
  );

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            {exercise.exercise?.name || "Unknown exercise"}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            {exercise.sets?.length || 0} sets completed
          </Text>
        </View>
        <View className="bg-blue-100 rounded-full w-10 h-10 items-center justify-center">
          <Text className="text-blue-600 font-bold">{orderNumber}</Text>
        </View>
      </View>

      {/* Sets */}
      <View className="space-y-2">
        <Text className="text-sm font-medium text-gray-700 mb-2">Sets:</Text>
        {exercise.sets?.map((set, setIndex) => (
          <View
            key={set._key}
            className="bg-gray-50 rounded-lg p-3 mt-1 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="bg-gray-200 rounded-full w-6 h-6 items-center justify-center mr-3">
                <Text className="text-gray-700 text-xs font-medium">
                  {setIndex + 1}
                </Text>
              </View>
              <Text className="text-gray-900 font-medium">{set.reps} reps</Text>
            </View>
            {set.weight && (
              <View className="flex-row items-center">
                <Ionicons name="barbell-outline" size={16} color="#6B7280" />
                <Text className="text-gray-700 ml-2 font-medium">
                  {set.weight} {set.weightUnit || "lbs"}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Exercise Volume Summary */}
      {exercise.sets && exercise.sets.length > 0 && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Exercise Volume:</Text>
            <Text className="text-sm font-medium text-gray-900">
              {volume} {unit}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
