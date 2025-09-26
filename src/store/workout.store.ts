import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface IWorkoutSet {
  id: string;
  reps: string;
  weight: string;
  weightUnit: "kg" | "lbs";
  isCompleted: boolean;
}

export interface IWorkoutExercise {
  id: string;
  sanityId: string; // Store the Sanity _id
  name: string;
  sets: IWorkoutSet[];
}

export interface IWorkoutStore {
  // State variables
  workoutExercises: IWorkoutExercise[];
  weightUnit: "kg" | "lbs";

  // Actions
  addExerciseToWorkout: (
    exercise: Pick<IWorkoutExercise, "name" | "sanityId">,
  ) => void;
  setWorkoutExercises: (
    exercises:
      | IWorkoutExercise[]
      | ((prevExercises: IWorkoutExercise[]) => IWorkoutExercise[]),
  ) => void;
  setWeightUnit: (unit: "kg" | "lbs") => void;
  resetWorkout: () => void;
}

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
