import { useState } from "react";
import { Button } from "~/shared/ui/button";
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
import { Input } from "~/shared/ui/input";
import { Label } from "~/shared/ui/label";
import { Mail } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export const AuthModal = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthActions();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("flow", isSignIn ? "signIn" : "signUp");

      await signIn("password", formData);
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      {/* OAuth Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => signIn("google")}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          <Mail className="mr-2 h-4 w-4" />
          Войти через Google
        </Button>
        {/* <Button
          onClick={() => handleOAuthSignIn("github")}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          <Github className="mr-2 h-4 w-4" />
          Войти через GitHub
        </Button> */}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Или</span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {!isSignIn && (
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Введите ваше имя"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Введите email"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Введите пароль"
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? "Загрузка..."
            : isSignIn
            ? "Войти"
            : "Зарегистрироваться"}
        </Button>
      </form>

      <div className="text-center text-sm">
        {isSignIn ? (
          <>
            Нет аккаунта?{" "}
            <button
              type="button"
              onClick={() => setIsSignIn(false)}
              className="text-primary hover:underline"
            >
              Зарегистрироваться
            </button>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <button
              type="button"
              onClick={() => setIsSignIn(true)}
              className="text-primary hover:underline"
            >
              Войти
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Войти</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSignIn ? "Вход в аккаунт" : "Регистрация"}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Войти</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {isSignIn ? "Вход в аккаунт" : "Регистрация"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
};
