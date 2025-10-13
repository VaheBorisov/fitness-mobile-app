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
