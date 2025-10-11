import type { Doc } from "convex/_generated/dataModel";

export type IEvent = Omit<Doc<"events">, "images"> & {
  images: (string | null)[];
  organizer: {
    name: string | undefined;
    email: string | undefined;
  } | null;
};
