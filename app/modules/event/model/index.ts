import type { Doc } from "convex/_generated/dataModel";

export type IEvent = Doc<"events"> & {
  titleImage: string | null;
  organizer: { name: string; email: string } | null;
};
