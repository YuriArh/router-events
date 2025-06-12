import { UserButton } from "@clerk/react-router";
import { SignedIn } from "@clerk/react-router";
import { SignedOut, SignInButton } from "@clerk/react-router";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { NewEvent } from "~/modules/new-event";
import { Button } from "~/shared/ui/button";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full h-14 items-center p-2 px-4 flex justify-between">
      <div
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
        onKeyUp={() => navigate("/")}
      >
        {t("Eventapp")}
      </div>
      <div>
        <Button onClick={() => i18n.changeLanguage("en")}>en</Button>
        <Button onClick={() => i18n.changeLanguage("ru")}>ru</Button>
      </div>

      <NewEvent />
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton>
          {/* You can pass the content as a component */}
          <UserButton.UserProfilePage
            label="Custom Page"
            url="custom"
            labelIcon={<DotIcon />}
          >
            <CustomPage />
          </UserButton.UserProfilePage>

          {/* You can also pass the content as direct children */}
          <UserButton.UserProfilePage
            label="Terms"
            labelIcon={<DotIcon />}
            url="terms"
          >
            <div>
              <h1>Custom Terms Page</h1>
              <p>This is the content of the custom terms page.</p>
            </div>
          </UserButton.UserProfilePage>

          <UserButton.MenuItems>
            <UserButton.Action
              label="Open chat"
              labelIcon={<DotIcon />}
              onClick={() => alert("init chat")}
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </div>
  );
};

const DotIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <title>Dot icon</title>
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  );
};

const CustomPage = () => {
  return (
    <div>
      <h1>Custom page</h1>
      <p>This is the content of the custom page.</p>
    </div>
  );
};
