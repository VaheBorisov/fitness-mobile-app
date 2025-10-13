import { defineQuery } from "groq";

export const getWorkoutRecordQuery =
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

export const getWorkoutsQuery =
  defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc) {
  _id,
  date,
  duration,
  exercises[] {
    exercise-> {
      _id,
      name
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
