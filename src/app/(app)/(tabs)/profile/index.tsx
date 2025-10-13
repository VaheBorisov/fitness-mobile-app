import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { client } from "@/lib/sanity/client";
import { getWorkoutsQuery } from "@/sanity-queries";

import { formatDuration } from "@/helpers/history-date";

import type { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import { accountSettingsOptions } from "@/constants/account.settings.options";
import clsx from "clsx";

const formatJoinDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

export default function Page() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      const results = await client.fetch(getWorkoutsQuery, { userId: user.id });
      setWorkouts(results);
    } catch (e) {
      console.error("Error fetching workouts:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  const workoutsStats = useMemo(() => {
    const total = workouts.length;
    const duration = workouts.reduce(
      (sum, workout) => sum + (workout.duration || 0),
      0,
    );
    const average = total > 0 ? Math.round(duration / total) : 0;

    return {
      total,
      duration,
      average,
    };
  }, [workouts]);

  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceJoining = Math.floor(
    (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  if (isLoading)
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <Text className="text-3xl font-bold text-gray-900">Profile</Text>
          <Text className="text-lg text-gray-600 mt-1">
            Manage your account and stats
          </Text>
        </View>

        {/* User Info Card */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
                <Image
                  source={{
                    uri: user.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                  }}
                  className="rounded-full"
                  style={{ width: 64, height: 64 }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || "User"}
                </Text>
                <Text className="text-gray-600">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Member since {formatJoinDate(joinDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Your Fitness Stats
            </Text>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600">
                  {workoutsStats.total}
                </Text>
                <Text className="text-sm text-gray-600 text-center">
                  Total Workouts
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-green-600">
                  {formatDuration(workoutsStats.duration)}
                </Text>
                <Text className="text-sm text-gray-600 text-center">
                  Total Time
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-purple-600">
                  {daysSinceJoining}
                </Text>
                <Text className="text-sm text-gray-600 text-center">
                  Days Active
                </Text>
              </View>
            </View>

            {workoutsStats.total > 0 && (
              <View className="mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">
                    Average workout duration:
                  </Text>
                  <Text className="font-semibold text-gray-900">
                    {formatDuration(workoutsStats.average)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Account Settings
          </Text>

          {/* Settings Options */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {accountSettingsOptions.map(({ title, icon, color, bgColor }) => (
              <TouchableOpacity
                key={title}
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <View
                    className={clsx(
                      "w-10 h-10 rounded-full items-center justify-center mr-3",
                      bgColor,
                    )}
                  >
                    <Ionicons name={icon} size={20} color={color} />
                  </View>
                  <Text className="text-gray-900 font-medium">{title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-600 rounded-2xl p-4 shadow-sm"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text className="ml-2 text-white font-semibold text-lg">
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
