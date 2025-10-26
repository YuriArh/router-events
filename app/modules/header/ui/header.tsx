import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { useNavigate } from "react-router";
import { NewEvent } from "~/modules/new-event";
import { AuthModal, UserProfile } from "~/modules/auth";
import { memo } from "react";

export const Header = memo(() => {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  return (
    <>
      <header className="sticky top-0 z-50 shadow-sm bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/")}
              onKeyUp={() => navigate("/")}
            >
              <h1 className="text-2xl font-bold text-rose-500">EventHub</h1>
            </div>

            <div className="flex gap-2">
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
    </>
  );
});
