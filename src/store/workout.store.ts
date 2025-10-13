import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { IWorkoutExercise, IWorkoutStore } from "@/types";

export const useWorkoutStore = create<IWorkoutStore>()(
  persist(
    (set) => ({
      workoutExercises: [],
      weightUnit: "lbs",
      addExerciseToWorkout: (exercise) =>
        set((state) => {
          const newExercise: IWorkoutExercise = {
            id: Math.random().toString(),
            sanityId: exercise.sanityId,
            name: exercise.name,
            sets: [],
          };

          return { workoutExercises: [...state.workoutExercises, newExercise] };
        }),
      setWorkoutExercises: (exercises) =>
        set((state) => ({
          workoutExercises:
            typeof exercises === "function"
              ? exercises(state.workoutExercises)
              : exercises,
        })),
      setWeightUnit: (unit) => set({ weightUnit: unit }),
      resetWorkout: () => set({ workoutExercises: [] }),
    }),
    {
      name: "workout-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ weightUnit: state.weightUnit }),
    },
  ),
);
