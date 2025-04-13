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
import { CalendarIcon, Loader, LoaderCircle } from "lucide-react";
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
import { FileUploader } from "~/shared/ui/file-uploader";
import { useMutation as useCustomMutation } from "convex/react";
import type { Id } from "convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(1).min(4).max(25),
  description: z.string().optional(),

  date: z.coerce.date().optional(),
  location: z.object({
    title: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export const NewEvent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const generateUploadUrl = useCustomMutation(api.events.generateUploadUrl);
  const [storageIds, setStorageIds] = useState<Id<"_storage">[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());

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
      event: {
        ...values,
        date: values.date?.toISOString(),
        images: storageIds,
      },
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
      form.setValue("location.latitude", latitude.value);
      form.setValue("location.longitude", longitude.value);
    };

    // Create subscription to signals
    const unsubscribeLat = latitude.subscribe(updateFormValues);
    const unsubscribeLng = longitude.subscribe(updateFormValues);

    return () => {
      unsubscribeLat();
      unsubscribeLng();
    };
  }, [form.setValue]);

  useEffect(() => {
    const doRequest = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude.value}&lon=${longitude.value}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "ru",
            },
          }
        );
        const data = await response.json();
        setIsLoading(false);
        form.setValue("location.title", data.display_name);
      } finally {
        setIsLoading(false);
      }
    };

    // Create subscription to signals
    const unsubscribeLat = latitude.subscribe(doRequest);
    const unsubscribeLng = longitude.subscribe(doRequest);

    return () => {
      unsubscribeLat();
      unsubscribeLng();
    };
  }, [form.setValue]);

  async function handleSendImage(files: File[]) {
    // Filter out already uploaded files
    const newFiles = files.filter((file) => !uploadedFiles.has(file.name));

    for (const file of newFiles) {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setStorageIds((prev) => [...prev, storageId]);
      setUploadedFiles((prev) => new Set([...prev, file.name]));
    }
  }

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
        className="min-w-xl"
      >
        <SheetHeader>
          <SheetTitle>{t("NewEvent.title")}</SheetTitle>
          <SheetDescription>{t("NewEvent.description")}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full mx-auto py-10 px-10"
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
            <FormField
              control={form.control}
              name="location.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  {isLoading ? (
                    <LoaderCircle className=" animate-spin" />
                  ) : (
                    <p>{field.value}</p>
                  )}
                  <FormDescription>Выберите локацию ивента</FormDescription>
                </FormItem>
              )}
            />

            <FileUploader
              multiple={true}
              maxFileCount={10}
              onUpload={handleSendImage}
            />

            <LoadingButton type="submit" loading={isPending}>
              create event
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
