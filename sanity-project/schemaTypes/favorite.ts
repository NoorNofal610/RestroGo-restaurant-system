import { defineField, defineType } from "sanity";

export default defineType({
  name: "favorite",
  title: "Favorite",
  type: "document",
  fields: [
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Favorite Items",
      type: "array",
      of: [
        defineField({
          name: "favoriteItem",
          title: "Favorite Item",
          type: "object",
          fields: [
            defineField({
              name: "dish",
              title: "Dish",
              type: "reference",
              to: [{ type: "dish" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "createdAt",
              title: "Created At",
              type: "datetime",
              initialValue: () => new Date().toISOString(),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "user.name",
      subtitle: "items.0.dish.name",
    },
  },
});

