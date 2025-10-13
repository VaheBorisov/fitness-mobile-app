import { defineQuery } from "groq";

export const exercisesQuery = defineQuery(`*[_type == "exercise"] {
  ...
}`);

export const findExerciseQuery =
  defineQuery(`*[_type == 'exercise' && name == $name][0] {
  _id,
  name
}`);

export const singleExerciseQuery = defineQuery(
  `*[_type == "exercise" && _id == $id][0]`,
);
