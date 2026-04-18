import type { LucideIcon } from "lucide-react";
import {
  Cpu,
  Dumbbell,
  FlaskConical,
  LayoutGrid,
  MoreHorizontal,
  Music,
  Palette,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "~/shared/lib/utils";
import type { Category } from "~/shared/model/Category";

type CategoryKey = NonNullable<Category>;

const categoryOrder: CategoryKey[] = [
  "all",
  "music",
  "technology",
  "sports",
  "art",
  "food",
  "science",
  "other",
];

const categoryIcons: Record<CategoryKey, LucideIcon> = {
  all: LayoutGrid,
  music: Music,
  sports: Dumbbell,
  art: Palette,
  food: UtensilsCrossed,
  science: FlaskConical,
  technology: Cpu,
  other: MoreHorizontal,
};

const categoryLabels: Record<CategoryKey, string> = {
  all: "Все события",
  music: "Музыка",
  sports: "Спорт",
  art: "Искусство",
  food: "Еда",
  science: "Наука",
  technology: "Техно",
  other: "Другое",
};

interface CategorySelectorProps {
  selectedCategory?: Category | null;
  onCategoryChange: (category: Category | null) => void;
  /** Для фильтра на главной. В форме создания события — false (без пункта «Все»). */
  showAllOption?: boolean;
}

function isItemActive(
  category: CategoryKey,
  selected: Category | null | undefined,
  showAll: boolean
): boolean {
  if (category === "all") {
    if (!showAll) return false;
    return selected === null || selected === "all";
  }
  return selected === category;
}

/**
 * Горизонтальная полоса категорий: иконка над подписью, активный пункт с подчёркиванием снизу.
 */
export function CategorySelector({
  selectedCategory,
  onCategoryChange,
  showAllOption = true,
}: CategorySelectorProps) {
  const categories = showAllOption
    ? categoryOrder
    : categoryOrder.filter((c) => c !== "all");

  const handleCategoryClick = (category: CategoryKey) => {
    if (category === "all") {
      onCategoryChange(null);
      return;
    }
    onCategoryChange(category);
  };

  return (
    <div className=" bg-white py-2">
      <div
        className="scrollbar-hide -mb-px flex gap-1 overflow-x-auto px-2 sm:gap-2 sm:px-4"
        role="tablist"
        aria-label="Категории событий"
      >
        {categories.map((category) => {
          const Icon = categoryIcons[category];
          const active = isItemActive(
            category,
            selectedCategory,
            showAllOption
          );

          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1 border-b-2 border-transparent px-2 py-1 transition-colors sm:min-w-[5rem] sm:px-3",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="size-6 shrink-0 sm:size-6"
                strokeWidth={active ? 2 : 1.75}
                aria-hidden
              />
              <span className="max-w-[5.5rem] text-center text-[11px] font-medium leading-tight sm:text-xs">
                {categoryLabels[category]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
