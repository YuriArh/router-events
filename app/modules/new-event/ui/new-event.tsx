import { useState } from "react";
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
import { useSearchParams } from "react-router";
import { FileUploader } from "~/shared/ui/file-uploader";
import { AddressAutocomplete } from "~/shared/ui/address-autocomplete";
import { useMutation as useCustomMutation } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { useConvexAuth } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shared/ui/dialog";

const formSchema = z.object({
  title: z.string().min(1).min(4).max(25),
  description: z.string().optional(),

  date: z.coerce.date().optional(),

  address: z.object({
    formatted: z.string(),
    lat: z.number(),
    lon: z.number(),
    city: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
  }),
});

export const NewEvent = () => {
  const [storageIds, setStorageIds] = useState<Id<"_storage">[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());

  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const generateUploadUrl = useCustomMutation(api.events.generateUploadUrl);

  const { isAuthenticated } = useConvexAuth();

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
        title: values.title,
        description: values.description,
        date: values.date?.toISOString(),
        address: values.address,
        images: storageIds,
      },
    });
  }

  const handleOpenChange = (open: boolean) => {
    if (!isAuthenticated) {
      toast.error("You must be signed in to create an event");
      return;
    }

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
    <Dialog
      open={searchParams.get("newEvent") === "true"}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button>{t("NewEvent.create")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("NewEvent.title")}</DialogTitle>
          <DialogDescription>{t("NewEvent.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <AddressAutocomplete
                      value={field.value?.formatted || ""}
                      onChange={(address) => {
                        field.onChange(address);
                      }}
                      placeholder="Введите адрес события..."
                    />
                  </FormControl>
                  <FormDescription>
                    Выберите адрес из предложенных вариантов
                  </FormDescription>
                  <FormMessage />
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
      </DialogContent>
    </Dialog>
  );
};
