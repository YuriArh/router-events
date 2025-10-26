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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/shared/ui/drawer";
import { useMediaQuery } from "~/shared/hooks/use-media-query";
import { CategorySelector } from "~/modules/event/ui/category-selector";
import { SocialLinksManager } from "~/shared/ui/social-links-manager";
import { UploadedImagesGrid } from "~/shared/ui/uploaded-images-grid";

type Category =
  | "music"
  | "sports"
  | "art"
  | "food"
  | "science"
  | "technology"
  | "other";

const formSchema = z.object({
  title: z.string().min(4, "Минимум 4 символа").max(25, "Максимум 25 символов"),
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
  category: z.enum([
    "music",
    "sports",
    "art",
    "food",
    "science",
    "technology",
    "other",
  ]),
  socialLinks: z
    .array(
      z.object({
        type: z.enum([
          "whatsapp",
          "telegram",
          "instagram",
          "facebook",
          "vk",
          "twitter",
          "youtube",
          "tiktok",
          "other",
        ]),
        url: z.string(),
        label: z.string().optional(),
      })
    )
    .optional(),
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
    defaultValues: {
      category: "other",
      socialLinks: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({
      event: {
        title: values.title,
        description: values.description,
        date: values.date?.toISOString(),
        address: values.address,
        images: storageIds,
        category: values.category,
        socialLinks: values.socialLinks,
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

  function handleRemoveImage(index: number) {
    setStorageIds((prev) => prev.filter((_, i) => i !== index));
  }

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const open = searchParams.get("newEvent") === "true";

  // Shared form content component
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("NewEvent.form.title")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("NewEvent.form.titlePlaceholder")}
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("NewEvent.form.titleDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("NewEvent.form.description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("NewEvent.form.descriptionPlaceholder")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("NewEvent.form.descriptionDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("NewEvent.form.category")}</FormLabel>
              <FormControl>
                <CategorySelector
                  selectedCategory={field.value as Category}
                  onCategoryChange={(category) => {
                    field.onChange(category || "other");
                  }}
                />
              </FormControl>
              <FormDescription>
                {t("NewEvent.form.categoryDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("NewEvent.form.date")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{t("NewEvent.form.datePickPlaceholder")}</span>
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
              <FormDescription>
                {t("NewEvent.form.dateDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("NewEvent.form.address")}</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  value={field.value?.formatted || ""}
                  onChange={(address) => {
                    field.onChange(address);
                  }}
                  placeholder={t("NewEvent.form.addressPlaceholder")}
                />
              </FormControl>
              <FormDescription>
                {t("NewEvent.form.addressDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialLinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("NewEvent.form.socialLinks")}</FormLabel>
              <FormControl>
                <SocialLinksManager
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                {t("NewEvent.form.socialLinksDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div>
            <FormLabel>
              {t("NewEvent.form.images")}
              {storageIds.length > 0 && (
                <span className="ml-1 text-sm text-muted-foreground">
                  ({storageIds.length}/10)
                </span>
              )}
            </FormLabel>
          </div>

          {/* Сетка загруженных изображений */}
          {storageIds.length > 0 && (
            <UploadedImagesGrid
              storageIds={storageIds}
              onRemove={handleRemoveImage}
            />
          )}

          {/* FileUploader - показывается только если не достигнут лимит */}
          {storageIds.length < 10 && (
            <FileUploader
              multiple={true}
              maxFileCount={10 - storageIds.length}
              onUpload={handleSendImage}
            />
          )}

          <FormDescription>
            {t("NewEvent.form.imagesDescription")}
          </FormDescription>
        </div>

        <LoadingButton type="submit" loading={isPending}>
          {t("NewEvent.form.submit")}
        </LoadingButton>
      </form>
    </Form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>{t("NewEvent.create")}</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>{t("NewEvent.title")}</DialogTitle>
            <DialogDescription>{t("NewEvent.description")}</DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button>{t("NewEvent.create")}</Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        <DrawerHeader>
          <DrawerTitle>{t("NewEvent.title")}</DrawerTitle>
          <DrawerDescription>{t("NewEvent.description")}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
};
