import { mutation, query, type QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

export const updateProfile = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update profile");
    }

    await ctx.db.patch(userId, {
      name: args.name,
    });

    return { success: true };
  },
});

export const getUserEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const events = await ctx.db
      .query("events")
      .withIndex("byOrganizerId", (q) => q.eq("organizerId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      events.map(async (event) => {
        const imageUrl = event.images
          ? await ctx.storage.getUrl(event.images[0])
          : null;
        return {
          ...event,
          imageUrl,
        };
      })
    );
  },
});
