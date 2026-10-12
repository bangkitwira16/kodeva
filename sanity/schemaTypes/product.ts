import {
  defineArrayMember,
  defineField,
  defineType,
} from "sanity";

export const product = defineType({
  name: "product",
  title: "Marketplace product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Card image",
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
    }),
    defineField({
      name: "screenshots",
      title: "Feature screenshots",
      type: "array",
      of: [
        defineArrayMember({
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
        }),
      ],
    }),
    defineField({
      name: "packages",
      title: "Packages",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Package",
              type: "string",
              options: {
                list: ["Basic", "Pro", "Business"].map((value) => ({
                  title: value,
                  value,
                })),
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "priceInCents",
              title: "Price (cents)",
              type: "number",
              validation: (rule) => rule.required().integer().min(0),
            }),
            defineField({
              name: "promoPriceInCents",
              title: "Promotional price (cents)",
              type: "number",
              validation: (rule) => rule.integer().min(0),
            }),
          ],
          preview: { select: { title: "name", subtitle: "priceInCents" } },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .length(3)
          .custom((packages) => {
            const names = (packages ?? []).map(
              (item) => (item as { name?: string }).name,
            );
            const requiredNames = ["Basic", "Pro", "Business"];
            return requiredNames.every((name) => names.includes(name))
              ? true
              : "Add one Basic, Pro, and Business package.";
          })
          .custom((packages) =>
            (packages ?? []).every((item) => {
              const packageValue = item as {
                priceInCents?: number;
                promoPriceInCents?: number;
              };
              return (
                packageValue.promoPriceInCents === undefined ||
                packageValue.promoPriceInCents < (packageValue.priceInCents ?? 0)
              );
            })
              ? true
              : "A promotional price must be lower than the regular price.",
          ),
    }),
    defineField({
      name: "remainingLicenses",
      title: "Remaining licenses",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "promoLicenseQuota",
      title: "Promotional license quota (shared across packages)",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "featured",
      title: "Feature on landing page",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category.title", media: "image" },
  },
});
