import type { categories } from "convex/schema";
import { cn } from "~/shared/lib/utils";

/**
 * Иконки для категорий событий
 */
const categoryIcons = {
  music: "🎵",
  sports: "⚽",
  art: "🎨",
  food: "🍽️",
  science: "🔬",
  technology: "💻",
  other: "📅",
} as const;

/**
 * Лейблы категорий на русском языке
 */
const categoryLabels = {
  music: "Музыка",
  sports: "Спорт",
  art: "Искусство",
  food: "Еда",
  science: "Наука",
  technology: "Технологии",
  other: "Другое",
} as const;

type Category = typeof categories.type;

interface CategorySelectorProps {
  /** Выбранная категория */
  selectedCategory?: Category | null;
  /** Callback функция при изменении категории */
  onCategoryChange: (category: Category | null) => void;
}

/**
 * Компонент селектора категорий событий
 *
 * Горизонтальный скролл с кнопками категорий в стиле Airbnb
 */
export function CategorySelector({
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  const categories: Category[] = [
    "music",
    "sports",
    "art",
    "food",
    "science",
    "technology",
    "other",
  ];

  const handleCategoryClick = (category: Category | null) => {
    onCategoryChange(category);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => handleCategoryClick(category)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
            "hover:scale-105 active:scale-95",
            selectedCategory === category
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200"
          )}
        >
          <span>{categoryIcons[category]}</span>
          <span>{categoryLabels[category]}</span>
        </button>
      ))}
    </div>
  );
}
