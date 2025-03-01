import type { Route } from "./+types/_index";
import { Map } from "~/modules/Map";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="relative flex-1 w-full">
      <Map />
    </div>
  );
}
