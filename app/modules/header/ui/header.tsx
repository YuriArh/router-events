import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "react-router";
import { Theme, useTheme } from "remix-themes";
import { Avatar, AvatarFallback, AvatarImage } from "~/shared/ui/avatar";
import { Button } from "~/shared/ui/button";

export const Header = () => {
  const { user } = useLoaderData();
  const { t, i18n } = useTranslation();
  const [_, setTheme] = useTheme();

  return (
    <div className="w-full h-14 items-center p-2 px-4 flex justify-between">
      {t("Header")}
      <div>
        <Button onClick={() => i18n.changeLanguage("en")}>en</Button>
        <Button onClick={() => i18n.changeLanguage("ru")}>ru</Button>
      </div>
      <div>
        <Button onClick={() => setTheme(Theme.LIGHT)}>Light</Button>
        <Button onClick={() => setTheme(Theme.DARK)}>Dark</Button>
      </div>
      {user ? (
        <Link to="/login">
          <Avatar>
            <AvatarImage />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        <div className="flex">
          <Link to="/register">{t("register")}</Link>
          <Link to="/login">{t("login")}</Link>
        </div>
      )}
    </div>
  );
};
