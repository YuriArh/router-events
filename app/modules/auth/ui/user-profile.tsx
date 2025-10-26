import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "convex/_generated/api";
import { Button } from "~/shared/ui/button";
import { Input } from "~/shared/ui/input";
import { Label } from "~/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shared/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/shared/ui/drawer";
import { useMediaQuery } from "~/shared/hooks/use-media-query";
import { Avatar, AvatarFallback, AvatarImage } from "~/shared/ui/avatar";
import { Save, LogOut, User2, Mail } from "lucide-react";

export function UserProfile() {
  const user = useQuery(api.users.current);
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const { signOut } = useAuthActions();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const updateProfile = useMutation(api.users.updateProfile);

  // Update local state when user data changes
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
      setOriginalName(user.name);
    }
  }, [user?.name]);

  // Check if there are unsaved changes
  const hasChanges = name !== originalName && name.trim() !== "";

  const handleSave = async () => {
    if (!user || !hasChanges) return;

    try {
      await updateProfile({ name });
      setOriginalName(name);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  const triggerButton = (
    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.image} alt={user.name || "Пользователь"} />
        <AvatarFallback>
          {user.name ? user.name.charAt(0).toUpperCase() : "П"}
        </AvatarFallback>
      </Avatar>
    </Button>
  );

  const profileContent = (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24 ring-4 ring-gray-100">
            <AvatarImage src={user.image} alt={user.name || "Пользователь"} />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Name Field */}
        <div className="space-y-3">
          <Label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <User2 className="h-4 w-4" />
            Имя
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите ваше имя"
            className="w-full h-11 text-base border-gray-200 focus:border-rose-300 focus:ring-rose-200"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-3">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <div className="w-full h-11 px-3 py-2 text-base bg-gray-50 border border-gray-200 rounded-md text-gray-600 flex items-center">
            {user.email}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
        >
          <LogOut className="h-4 w-4" />
          Выйти из аккаунта
        </Button>

        {hasChanges && (
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6"
          >
            <Save className="h-4 w-4" />
            Сохранить изменения
          </Button>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Профиль пользователя
            </DialogTitle>
          </DialogHeader>
          {profileContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent className="bg-white">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-semibold text-gray-900">
            Профиль пользователя
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">{profileContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
