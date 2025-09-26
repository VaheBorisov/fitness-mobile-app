import {defineType, defineField, defineArrayMember} from 'sanity'

export default defineType({
  name: 'workout',
  type: 'document',
  title: 'Workout',
  description: 'A workout session containing performed exercises and metadata',
  fields: [
    defineField({
      name: 'userId',
      type: 'string',
      title: 'User ID',
      description: "The user's Clerk ID",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'date',
      type: 'datetime',
      title: 'Date',
      description: 'When the workout took place',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      type: 'number',
      title: 'Duration (seconds)',
      description: 'Total duration of the workout in seconds',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'exercises',
      type: 'array',
      title: 'Exercises',
      description: 'Exercises performed in this workout with their sets',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exercise',
              type: 'reference',
              title: 'Exercise',
              to: [{type: 'exercise'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              type: 'array',
              title: 'Sets',
              description: 'The Sets performed for this exercise with reps and weight details',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'set',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      type: 'number',
                      title: 'Reps',
                      description: 'The number of repetitions performed on this set',
                      validation: (Rule) => Rule.required().integer().min(0),
                    }),
                    defineField({
                      name: 'weight',
                      type: 'number',
                      title: 'Weight',
                      description: 'Weight used for the set',
                      validation: (Rule) => Rule.min(0),
                    }),
                    defineField({
                      name: 'weightUnit',
                      type: 'string',
                      title: 'Weight Unit',
                      options: {
                        list: [
                          {title: 'Kilograms', value: 'kg'},
                          {title: 'Pounds', value: 'lbs'},
                        ],
                        layout: 'radio',
                        direction: 'horizontal',
                      },
                      initialValue: 'kg',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare({reps, weight, weightUnit}) {
                      return {
                        title: `Set ${reps} reps`,
                        subtitle: weight ? `${weight} ${weightUnit}` : 'Bodyweight',
                      }
                    },
                  },
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: {
              title: 'exercise.name',
              sets: 'sets',
            },
            prepare({title, sets}) {
              const setCount = sets ? sets.length : 0

              return {
                title: title || 'Exercise',
                subtitle: `${setCount} set${setCount !== 1 ? 's' : ''}`,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: {
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
    },
    prepare({date, duration, exercises}) {
      const workoutDate = date ? new Date(date).toLocaleDateString() : 'No Date'
      const durationMinutes = duration ? Math.round(duration / 60) : 0
      const exerciseCount = exercises ? exercises.length : 0

      return {
        title: `Workout - ${workoutDate}`,
        subtitle: `${durationMinutes} min * ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`,
      }
    },
  },
})
