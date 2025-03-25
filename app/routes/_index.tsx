import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Map as MyMap } from "~/modules/Map";

export function meta() {
  return [
    { title: "EventApp" },
    { name: "description", content: "Welcome to EventApp!" },
  ];
}

export default function Home() {
  return (
    <div className="relative flex flex-1 w-full">
      <MyMap />
    </div>
  );
}
