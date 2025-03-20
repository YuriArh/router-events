import { UserButton } from "@clerk/react-router";
import { SignedIn } from "@clerk/react-router";
import { SignedOut, SignInButton } from "@clerk/react-router";
import { useTranslation } from "react-i18next";
import { Theme, useTheme } from "remix-themes";
import { Button } from "~/shared/ui/button";

export const Header = () => {
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
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};
