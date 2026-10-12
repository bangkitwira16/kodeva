import { defineField, defineType } from "sanity";

export const landingPage = defineType({
  name: "landingPage",
  title: "Landing page",
  type: "document",
  fields: [
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "bannerImage",
      title: "Banner image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "promoText",
      title: "Promo text",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "heroDescription",
      title: "Hero subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cta",
      title: "Hero call to action",
      type: "object",
      fields: [
        defineField({
          name: "label",
          title: "Link label",
          type: "string",
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: "href",
          title: "Link URL",
          type: "string",
          validation: (rule) =>
            rule.custom((value) =>
              value &&
              !value.startsWith("/") &&
              !value.startsWith("https://")
                ? "Use a relative path or secure https:// URL."
                : true,
            ),
        }),
      ],
    }),
    defineField({
      name: "heroCtaLabel",
      title: "Hero CTA label",
      type: "string",
    }),
    defineField({
      name: "heroCtaHref",
      title: "Hero CTA URL",
      type: "string",
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "quote", title: "Quote", type: "text" }),
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "role", title: "Role", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "role" } },
        },
      ],
    }),
    defineField({
      name: "faqs",
      title: "Frequently asked questions",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text" }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "heroTitle",
      media: "bannerImage",
    },
  },
});
