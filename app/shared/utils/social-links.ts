import {
  MessageCircle,
  Instagram,
  Facebook,
  Send,
  Youtube,
  Twitter,
  Music2,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";

export type SocialType =
  | "whatsapp"
  | "telegram"
  | "instagram"
  | "facebook"
  | "vk"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "other";

export interface SocialLink {
  type: SocialType;
  url: string;
  label?: string;
}

/**
 * Автоопределение типа социальной сети по URL
 */
export function detectSocialType(url: string): SocialType {
  const lowercaseUrl = url.toLowerCase();

  // WhatsApp
  if (
    lowercaseUrl.includes("wa.me") ||
    lowercaseUrl.includes("whatsapp.com") ||
    lowercaseUrl.includes("api.whatsapp.com")
  ) {
    return "whatsapp";
  }

  // Telegram
  if (lowercaseUrl.includes("t.me") || lowercaseUrl.includes("telegram.me")) {
    return "telegram";
  }

  // Instagram
  if (
    lowercaseUrl.includes("instagram.com") ||
    lowercaseUrl.includes("instagr.am")
  ) {
    return "instagram";
  }

  // Facebook
  if (
    lowercaseUrl.includes("facebook.com") ||
    lowercaseUrl.includes("fb.com")
  ) {
    return "facebook";
  }

  // VK
  if (
    lowercaseUrl.includes("vk.com") ||
    lowercaseUrl.includes("vkontakte.ru")
  ) {
    return "vk";
  }

  // Twitter / X
  if (lowercaseUrl.includes("twitter.com") || lowercaseUrl.includes("x.com")) {
    return "twitter";
  }

  // YouTube
  if (
    lowercaseUrl.includes("youtube.com") ||
    lowercaseUrl.includes("youtu.be")
  ) {
    return "youtube";
  }

  // TikTok
  if (lowercaseUrl.includes("tiktok.com")) {
    return "tiktok";
  }

  return "other";
}

/**
 * Получение иконки для типа социальной сети
 */
export function getSocialIcon(type: SocialType): LucideIcon {
  const icons: Record<SocialType, LucideIcon> = {
    whatsapp: MessageCircle,
    telegram: Send,
    instagram: Instagram,
    facebook: Facebook,
    vk: LinkIcon, // VK не имеет dedicated иконки в lucide
    twitter: Twitter,
    youtube: Youtube,
    tiktok: Music2, // TikTok ассоциируется с музыкой
    other: LinkIcon,
  };

  return icons[type];
}

/**
 * Валидация URL социальной сети
 */
export function validateSocialUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  // Пустая строка
  if (!url || url.trim() === "") {
    return { valid: false, error: "URL не может быть пустым" };
  }

  // Проверка на базовый формат URL
  try {
    // Если URL не начинается с протокола, добавляем https://
    const urlToCheck = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    const parsedUrl = new URL(urlToCheck);

    // Проверка на наличие домена
    if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
      return { valid: false, error: "Неверный формат URL" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Неверный формат URL" };
  }
}

/**
 * Нормализация URL (добавление протокола если отсутствует)
 */
export function normalizeUrl(url: string): string {
  const trimmedUrl = url.trim();
  if (!trimmedUrl.match(/^https?:\/\//i)) {
    return `https://${trimmedUrl}`;
  }
  return trimmedUrl;
}

/**
 * Получение отображаемого имени для типа социальной сети
 */
export function getSocialTypeName(type: SocialType): string {
  const names: Record<SocialType, string> = {
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    instagram: "Instagram",
    facebook: "Facebook",
    vk: "ВКонтакте",
    twitter: "Twitter",
    youtube: "YouTube",
    tiktok: "TikTok",
    other: "Другое",
  };

  return names[type];
}
