import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const categories = v.union(
  v.literal("music"),
  v.literal("sports"),
  v.literal("art"),
  v.literal("food"),
  v.literal("science"),
  v.literal("technology"),
  v.literal("other")
);

export default defineSchema({
  ...authTables,
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    address: v.object({
      formatted: v.string(),
      lat: v.number(),
      lon: v.number(),
      city: v.optional(v.string()),
      country: v.optional(v.string()),
      state: v.optional(v.string()),
    }),
    category: categories,
    date: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    socialLinks: v.optional(
      v.array(
        v.object({
          type: v.string(),
          url: v.string(),
          label: v.optional(v.string()),
        })
      )
    ),
    attendeeCount: v.number(),
    organizerId: v.id("users"),
    time: v.optional(v.string()),
  })
    .index("byCategory", ["category"])
    .index("byDate", ["date"])
    .index("byOrganizerId", ["organizerId"]),
  attendees: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
  })
    .index("byEvent", ["eventId"])
    .index("byUser", ["userId"])
    .index("byEventAndUser", ["eventId", "userId"]),
});
