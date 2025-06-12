import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "~/shared/ui/avatar";
import { Skeleton } from "~/shared/ui/skeleton";

export const ProfilePicture = ({ id }: { id: Id<"users"> }) => {
  const { data: user, isLoading } = useQuery(
    convexQuery(api.users.getUserById, { id })
  );

  if (isLoading) {
    return <Skeleton className="w-10 h-10 rounded-full" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user?.imageUrl} />
        <AvatarFallback>{user?.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <p className="text-sm font-medium">{user?.name}</p>
    </div>
  );
};
