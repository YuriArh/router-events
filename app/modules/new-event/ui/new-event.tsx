import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/shared/ui/button";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/shared/ui/form";
import { Input } from "~/shared/ui/input";
import { Textarea } from "~/shared/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "~/shared/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/shared/ui/calendar";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useConvexMutation } from "@convex-dev/react-query";
import { LoadingButton } from "~/shared/ui/loading-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/shared/ui/sheet";
import { useSearchParams } from "react-router";
import { latitude } from "../store/signal";
import { longitude } from "../store/signal";

const formSchema = z.object({
  title: z.string().min(1).min(4).max(25),
  description: z.string().optional(),
  longitude: z.number(),
  latitude: z.number(),
  date: z.coerce.date().optional(),
});

export const NewEvent = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.events.create),
    onSuccess: () => {
      toast.success("Event created");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({
      event: { ...values, date: values.date?.toISOString() },
    });
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchParams((prev) => {
        prev.delete("newEvent");
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.set("newEvent", "true");
        return prev;
      });
    }
  };

  useEffect(() => {
    const updateFormValues = () => {
      form.setValue("latitude", latitude.value);
      form.setValue("longitude", longitude.value);
    };

    // Create subscription to signals
    const unsubscribeLat = latitude.subscribe(updateFormValues);
    const unsubscribeLng = longitude.subscribe(updateFormValues);

    return () => {
      unsubscribeLat();
      unsubscribeLng();
    };
  }, [form.setValue]);

  return (
    <Sheet
      open={searchParams.get("newEvent") === "true"}
      onOpenChange={handleOpenChange}
      key="right"
      modal={false}
    >
      <SheetTrigger asChild>
        <Button>{t("NewEvent.create")}</Button>
      </SheetTrigger>
      <SheetContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader>
          <SheetTitle>{t("NewEvent.title")}</SheetTitle>
          <SheetDescription>{t("NewEvent.description")}</SheetDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-7xl mx-auto py-10"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>title</FormLabel>
                    <FormControl>
                      <Input placeholder="supa jusa" type="text" {...field} />
                    </FormControl>
                    <FormDescription>title of event</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Placeholder"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>description of event</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>event date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton type="submit" loading={isPending}>
                create event
              </LoadingButton>
            </form>
          </Form>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
