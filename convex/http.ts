import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occured", { status: 400 });
    }
    switch (event.type) {
      case "user.created": // intentional fallthrough
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case "user.deleted": {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    "svix-id": req.headers.get("svix-id")!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    "svix-signature": req.headers.get("svix-signature")!,
  };
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

http.route({
  pathPrefix: "/api/events/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const eventId = path.replace("/api/events/", "") as Id<"events">;
    const event = await ctx.runQuery(api.events.get, { eventId });

    if (!event) {
      return new Response("Event not found", { status: 404 });
    }

    return new Response(JSON.stringify(event), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
});

export default http;
