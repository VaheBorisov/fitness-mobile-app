import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import WorkoutExerciseCard from "@/app/components/WorkoutExerciseCard";

import { defineQuery } from "groq";

import { client } from "@/lib/sanity/client";

import { formatDate, formatTime } from "@/helpers/workout-date";
import { formatDuration } from "@/helpers/history-date";

import type { GetWorkoutRecordQueryResult } from "@/lib/sanity/types";

const getWorkoutRecordQuery =
  defineQuery(`*[_type == "workout" && _id == $workoutId][0] {
  _id,
  _type,
  _createdAt,
  date,
  duration,
  exercises[] {
    exercise-> {
      _id,
      name,
      description,
    },
    sets[] {
      reps,
      weight,
      weightUnit,
      _type,
      _key,
    },
    _type,
    _key,
  }
}`);

const initialVolume = { volume: 0, unit: "lbs" };

export default function WorkoutRecord() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams();

  const [workout, setWorkout] = useState<GetWorkoutRecordQueryResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchWorkout = async () => {
    if (!workoutId) return;

    try {
      const result = await client.fetch(getWorkoutRecordQuery, { workoutId });
      setWorkout(result);
    } catch (e) {
      console.error("Error fetching workout:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [workoutId]);

  const totalSets = useMemo(
    () =>
      workout?.exercises?.reduce(
        (total, exercise) => total + (exercise.sets?.length || 0),
        0,
      ) || 0,
    [workout?.exercises],
  );

  const { volume, unit } = useMemo(
    () =>
      workout?.exercises?.reduce(
        (volume, exercise) =>
          exercise.sets.reduce((acc, set) => {
            if (set.weight && set.reps)
              return {
                volume: acc.volume + set.weight * set.reps,
                unit: set.weightUnit || "lbs",
              };
            return acc;
          }, volume),
        initialVolume,
      ) || initialVolume,
    [workout?.exercises],
  );

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return "Duration not recorded";
    return formatDuration(seconds);
  };

  const deleteWorkout = async () => {
    if (!workout) return;

    setDeleting(true);
    try {
      await fetch("/api/delete-workout", {
        method: "POST",
        body: JSON.stringify({ workoutId }),
      });

      router.replace("/(app)/(tabs)/history?refresh=true");
    } catch (e) {
      console.error("Error deleting workout:", e);
      Alert.alert("Error", "Failed to delete workout. Please try again.", [
        {
          text: "OK",
        },
      ]);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteWorkout,
        },
      ],
    );
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading workout...</Text>
        </View>
      </SafeAreaView>
    );

  if (!workout)
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            Workout not found
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            This workout could not be found.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["left", "right"]}>
      <ScrollView className="flex-1">
        {/* Workout Summary */}
        <View className="bg-white p-6 border-b border-gray-300">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Workout Summary
            </Text>
            <TouchableOpacity
              onPress={handleDeleteWorkout}
              disabled={deleting}
              className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  <Text className="text-white font-medium ml-2">Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {formatDate(workout.date)} at {formatTime(workout.date)}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {formatWorkoutDuration(workout.duration)}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="fitness-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {workout.exercises?.length || 0} exercises
            </Text>
          </View>

          {volume > 0 && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="barbell-outline" size={20} color="#6B7280" />
              <Text className="text-gray-700 ml-3 font-medium">
                {volume.toLocaleString()} {unit} total volume
              </Text>
            </View>
          )}
        </View>

        {/* Exercise List */}
        <View className="space-y-4 p-6 gap-4">
          {workout.exercises?.map((exercise, index) => (
            <WorkoutExerciseCard
              key={exercise._key}
              exercise={exercise}
              orderNumber={index + 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
