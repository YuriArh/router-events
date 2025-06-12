import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { WithoutSystemFields } from "convex/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUserOrThrow } from "./users";

export const get = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);

    if (event?.images) {
      const images = await Promise.all(
        event?.images?.map(async (id) => await ctx.storage.getUrl(id))
      );
      return { ...event, images };
    }

    return event;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    // Get image URLs for each event
    const eventsWithImage = await Promise.all(
      events.map(async (event) => {
        if (!event.images) return event;
        const titleImage = await ctx.storage.getUrl(event.images[0]);
        return { ...event, titleImage };
      })
    );

    return eventsWithImage;
  },
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
      images: v.optional(v.array(v.id("_storage"))),
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

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
