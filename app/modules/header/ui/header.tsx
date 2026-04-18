import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { Link } from "react-router";
import { NewEvent } from "~/modules/new-event";
import { AuthModal, UserProfile } from "~/modules/auth";
import { memo } from "react";

export const Header = memo(() => {
  const { isAuthenticated } = useConvexAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-white  border-border/40  shadow-xs backdrop-blur-md">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-xl outline-none ring-offset-background transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="EventHub — главная страница"
          >
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              <span className="text-primary">Event</span>
              <span className="text-foreground">Hub</span>
            </h1>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && <NewEvent />}
            <Authenticated>
              <UserProfile />
            </Authenticated>
            <Unauthenticated>
              <AuthModal />
            </Unauthenticated>
          </div>
        </div>
      </div>
    </header>
  );
});
