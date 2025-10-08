import { useState } from "react";
import { useRouter } from "expo-router";

import {
  Modal,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useWorkoutStore } from "@/store/workout.store";

import type { Exercise } from "@/lib/sanity/types";

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: VoidFunction;
}

export default function ExerciseSelectionModal({
  visible,
  onClose,
}: ExerciseSelectionModalProps) {
  const router = useRouter();

  const { addExerciseToWorkout } = useWorkoutStore();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View className="bg-white px-4 pt-4 pb-6 shadow-sm border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-800">
              Add Exercise
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-4">
            Tap any exercise to add it to your workout
          </Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800"
              placeholder="Search exercises..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {!!searchQuery.length && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
