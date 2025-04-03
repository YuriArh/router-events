import { convexQuery, useConvexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import consola from "consola";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { DialogDescription, DialogTitle } from "~/shared/ui/dialog";
import { Sheet, SheetContent, SheetHeader } from "~/shared/ui/sheet";

export const Event = ({ eventId }: { eventId: Id<"events"> }) => {
  const { data } = useQuery(convexQuery(api.events.get, { eventId }));
  const [open, setOpen] = useState(true);

  const [_, setSearchParams] = useSearchParams();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
      setTimeout(() => {
        setSearchParams((prev) => {
          prev.delete("eventId");
          return prev;
        });
      }, 100);
    }
  };
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex-1 items-center justify-center">
        <SheetHeader>
          <DialogTitle>{data?.title}</DialogTitle>
          <DialogDescription>{data?.description}</DialogDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
