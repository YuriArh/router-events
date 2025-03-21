import { useQuery } from "convex/react";
import type { Route } from "./+types/_index";
import { Map as MyMap } from "~/modules/Map";
import { api } from "convex/_generated/api";
import { consola } from "consola";

export function meta() {
  return [
    { title: "EventApp" },
    { name: "description", content: "Welcome to EventApp!" },
  ];
}

export default function Home() {
  const posts = useQuery(api.posts.list);

  return (
    <div className="relative flex flex-1 w-full">
      <MyMap />
    </div>
  );
}
