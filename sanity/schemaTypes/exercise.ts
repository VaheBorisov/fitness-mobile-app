import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'exercise',
  type: 'document',
  title: 'Exercise',
  description: 'An exercise item with media, difficulty, and activation state',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      description: 'The name of the exercise',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'A short description of the exercise',
      rows: 3,
    }),
    defineField({
      name: 'difficulty',
      type: 'string',
      title: 'Difficulty',
      description: 'Select the difficulty level',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'beginner',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      description: 'An image representing the exercise',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility and SEO',
          validation: (Rule) => Rule.required().min(5),
        }),
      ],
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'Link to a demo video for this exercise',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          try {
            // Basic URL validation for strings
            const url = new URL(value)
            return !!url.protocol && !!url.host || 'Must be a valid URL'
          } catch {
            return 'Must be a valid URL'
          }
        }),
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      title: 'Active',
      description: 'Whether this exercise is active/visible',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      subtitle: 'difficulty',
    },
    prepare({title, media, subtitle}) {
      const pretty = subtitle
        ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1)
        : undefined
      return {title, media, subtitle: pretty}
    },
  },
})
