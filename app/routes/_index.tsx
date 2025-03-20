import { useQuery } from "convex/react";
import type { Route } from "./+types/_index";
import { Map as MyMap } from "~/modules/Map";
import { api } from "convex/_generated/api";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const posts = useQuery(api.posts.list);

  console.log(posts);

  return (
    <div className="relative flex-1 w-full">
      <MyMap />
    </div>
  );
}
