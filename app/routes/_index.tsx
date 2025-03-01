import { Welcome } from "~/modules/welcome/welcome";
import type { Route } from "./+types/_index";
import { Map } from "~/modules/Map";
import { Button } from "~/shared/ui/button";
import { Theme, useTheme } from "remix-themes";
import { useTranslation } from "react-i18next";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [_, setTheme] = useTheme();
  let { t, i18n } = useTranslation();
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-50 right-0flex z-10">
        <h1>{t("greeting")}</h1>
        <Button onClick={() => i18n.changeLanguage("en")}>en</Button>
        <Button onClick={() => i18n.changeLanguage("ru")}>ru</Button>
      </div>
      <div className="absolute top-0  right-0 flex z-10">
        <Button onClick={() => setTheme(Theme.LIGHT)}>Light</Button>
        <Button onClick={() => setTheme(Theme.DARK)}>Dark</Button>
      </div>
      <Map />
    </div>
  );
}
