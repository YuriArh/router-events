import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import {
  type SocialLink,
  type SocialType,
  detectSocialType,
  getSocialIcon,
  validateSocialUrl,
  normalizeUrl,
  getSocialTypeName,
} from "~/shared/utils/social-links";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "~/shared/lib/utils";

interface SocialLinksManagerProps {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export function SocialLinksManager({
  value,
  onChange,
}: SocialLinksManagerProps) {
  const { t } = useTranslation();
  const [inputUrl, setInputUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const socialTypes: SocialType[] = [
    "whatsapp",
    "telegram",
    "instagram",
    "facebook",
    "vk",
    "twitter",
    "youtube",
    "tiktok",
    "other",
  ];

  const handleAddLink = () => {
    // Валидация
    const validation = validateSocialUrl(inputUrl);
    if (!validation.valid) {
      setError(validation.error || "Неверный URL");
      return;
    }

    // Нормализация URL
    const normalizedUrl = normalizeUrl(inputUrl);

    // Автоопределение типа
    const detectedType = detectSocialType(normalizedUrl);

    // Проверка на дубликаты
    if (value.some((link) => link.url === normalizedUrl)) {
      setError("Эта ссылка уже добавлена");
      return;
    }

    // Добавление ссылки
    const newLink: SocialLink = {
      type: detectedType,
      url: normalizedUrl,
    };

    onChange([...value, newLink]);
    setInputUrl("");
    setError(null);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = value.filter((_, i) => i !== index);
    onChange(newLinks);
  };

  const handleChangeType = (index: number, newType: SocialType) => {
    const newLinks = [...value];
    newLinks[index] = { ...newLinks[index], type: newType };
    onChange(newLinks);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLink();
    }
  };

  return (
    <div className="space-y-3">
      {/* Список добавленных ссылок */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((link, index) => {
            const Icon = getSocialIcon(link.type);
            return (
              <div
                key={`${link.url}-${index}`}
                className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3"
              >
                {/* Dropdown для изменения типа с иконкой */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      type="button"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {socialTypes.map((type) => {
                      const TypeIcon = getSocialIcon(type);
                      return (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => handleChangeType(index, type)}
                        >
                          <TypeIcon className="mr-2 h-4 w-4" />
                          {t(`SocialLinks.${type}`)}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Информация о ссылке */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {getSocialTypeName(link.type)}
                  </p>
                  <p className="text-sm truncate">{link.url}</p>
                </div>

                {/* Кнопка удаления */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveLink(index)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Форма добавления новой ссылки */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t("SocialLinks.placeholder")}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setError(null);
              }}
              onKeyPress={handleKeyPress}
              className={cn(error && "border-destructive")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddLink}
            disabled={!inputUrl.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Сообщение об ошибке */}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Подсказка */}
        {value.length === 0 && !error && (
          <p className="text-xs text-muted-foreground">
            {t("SocialLinks.add")}
          </p>
        )}
      </div>
    </div>
  );
}
