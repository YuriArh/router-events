import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { WithoutSystemFields } from "convex/server";
import type { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { categories } from "./schema";

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
  args: {
    category: v.optional(categories),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const selectedCategory = args.category;
    const events = selectedCategory
      ? await ctx.db
          .query("events")
          .withIndex("byCategory", (q) => q.eq("category", selectedCategory))
          .order("desc")
          .collect()
      : await ctx.db.query("events").order("desc").collect();

    // Get image URLs for each event
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const organizer = await ctx.db.get(event.organizerId);
        const organaizerOrNull = organizer
          ? { name: organizer.name, email: organizer.image }
          : null;

        if (!event.images || event.images.length === 0)
          return {
            ...event,
            images: [],
            organizer: organaizerOrNull,
          };

        const images = await Promise.all(
          event.images.map(async (id) => await ctx.storage.getUrl(id))
        );

        return {
          ...event,
          images,
          organizer: organaizerOrNull,
        };
      })
    );

    return enrichedEvents;
  },
});

export const getInBounds = query({
  args: {
    minLat: v.number(),
    minLng: v.number(),
    maxLat: v.number(),
    maxLng: v.number(),
  },
  handler: async (ctx, { minLat, minLng, maxLat, maxLng }) => {
    const events = await ctx.db.query("events").collect();

    const boundedEvents = events.filter(
      (event) =>
        event.address?.lat >= minLat &&
        event.address?.lat <= maxLat &&
        event.address?.lon >= minLng &&
        event.address?.lon <= maxLng
    );

    // Get image URLs for each event
    const extendedEvents = await Promise.all(
      boundedEvents.map(async (event) => {
        const organizer = await ctx.db.get(event.organizerId);

        if (!event.images || event.images.length === 0)
          return {
            ...event,
            images: [],
            organizer: organizer
              ? { name: organizer.name, email: organizer.image }
              : null,
          };

        const images = await Promise.all(
          event.images.map(async (id) => await ctx.storage.getUrl(id))
        );

        return {
          ...event,
          images,
          organizer: organizer
            ? { name: organizer.name, email: organizer.image }
            : null,
        };
      })
    );
    return extendedEvents;
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
      address: v.object({
        formatted: v.string(),
        lat: v.number(),
        lon: v.number(),
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        state: v.optional(v.string()),
      }),
      images: v.optional(v.array(v.id("_storage"))),
      category: v.optional(categories),
      socialLinks: v.optional(
        v.array(
          v.object({
            type: v.string(),
            url: v.string(),
            label: v.optional(v.string()),
          })
        )
      ),
    }),
  },
  handler: async (ctx, { event }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create events");
    }

    return await ctx.db.insert("events", {
      ...event,
      organizerId: userId,
      attendeeCount: 0,
      category: event.category || "other",
    });
  },
});

export const toggleAttendance = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to attend events");
    }

    const existingAttendance = await ctx.db
      .query("attendees")
      .withIndex("byEventAndUser", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId)
      )
      .unique();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (existingAttendance) {
      await ctx.db.delete(existingAttendance._id);
      await ctx.db.patch(args.eventId, {
        attendeeCount: Math.max(0, event.attendeeCount - 1),
      });
      return false;
    }

    await ctx.db.insert("attendees", {
      eventId: args.eventId,
      userId,
    });
    await ctx.db.patch(args.eventId, {
      attendeeCount: event.attendeeCount + 1,
    });
    return true;
  },
});

export const isAttending = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const attendance = await ctx.db
      .query("attendees")
      .withIndex("byEventAndUser", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId)
      )
      .unique();

    return !!attendance;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
