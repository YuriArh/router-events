import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    location: v.object({
      title: v.string(),
      latitude: v.number(),
      longitude: v.number(),
    }),
    user: v.id("users"),
    date: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
  }).index("byUser", ["user"]),
  users: defineTable({
    name: v.string(),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("byExternalId", ["externalId"]),
});
