import type { categories } from "convex/schema";

export type Category = typeof categories.type | "all" | null;
