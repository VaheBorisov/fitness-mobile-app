export interface ISet {
  _type: string;
  _key: string;
  reps: number;
  weight: number;
  weightUnit: "lbs" | "kg";
}

export interface IExercises {
  _type: string;
  _key: string;
  exercise: {
    _type: string;
    _ref: string;
  };
  sets: ISet[];
}

export interface IWorkoutData {
  _type: string;
  userId: string;
  date: string;
  duration: number;
  exercises: IExercises[];
}
