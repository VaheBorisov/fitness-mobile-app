import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Image } from "react-native";

import {
  getDifficultyColor,
  getDifficultyText,
} from "@/helpers/exercise-difficulty";

import { urlFor } from "@/lib/sanity/client";

import type { Exercise } from "@/lib/sanity/types";

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: VoidFunction;
  showChevron?: boolean;
}

export default function ExerciseCard({
  exercise,
  showChevron = false,
  onPress,
}: ExerciseCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100"
    >
      <View className="flex-row p-6">
        <View className="w-20 h-20 bg-white rounded-xl mr-4 overflow-hidden">
          {exercise.image ? (
            <Image
              source={{ uri: urlFor(exercise.image?.asset?._ref).url() }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
              <Ionicons name="fitness" size={24} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View className="flex-1 justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {exercise.name}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {exercise.description || "No description available"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View
              className={`px-3 py-1 rounded-full ${getDifficultyColor(exercise.difficulty)}`}
            >
              <Text className="text-xs font-semibold text-white">
                {getDifficultyText(exercise.difficulty)}
              </Text>
            </View>

            {showChevron && (
              <TouchableOpacity className="p-2">
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
