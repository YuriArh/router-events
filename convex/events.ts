import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { WithoutSystemFields } from "convex/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUserOrThrow } from "./users";
import { consola } from "consola";

export const get = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

export const list = query(async (ctx) => {
  return await ctx.db.query("events").collect();
});

export const insert = internalMutation(
  (ctx, { event }: { event: WithoutSystemFields<Doc<"events">> }) =>
    ctx.db.insert("events", event)
);

export const create = mutation({
  args: {
    event: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      date: v.optional(v.string()),
      location: v.object({
        title: v.string(),
        latitude: v.number(),
        longitude: v.number(),
      }),
    }),
  },
  handler: async (ctx, { event }) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("events", {
      ...event,
      user: user._id,
    });
  },
});
