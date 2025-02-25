import { Welcome } from "~/modules/welcome/welcome";
import type { Route } from "./+types/_index";
import { Map } from "~/modules/Map";
import { Button } from "~/shared/ui/button";
import { Theme, useTheme } from "remix-themes";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [_, setTheme] = useTheme();

  return (
    <>
      <Button onClick={() => setTheme(Theme.LIGHT)}>Button</Button>
      <Button onClick={() => setTheme(Theme.DARK)}>Dark</Button>
      <Map />
    </>
  );
}
