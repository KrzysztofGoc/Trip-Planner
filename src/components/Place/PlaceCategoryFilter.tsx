// PlaceCategoryFilter.tsx
import PlaceCategoryItem from "./PlaceCategoryItem";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";

interface PlaceCategoryFilterProps {
  value: string | undefined;
  onChange: (category: string | undefined) => void;
}

export default function PlaceCategoryFilter({ value, onChange }: PlaceCategoryFilterProps) {
  return (
    <div className="size-auto px-2 flex justify-stretch gap-2 overflow-x-auto scrollbar-hide relative">
      {EVENT_CATEGORIES.map((category) => (
        <PlaceCategoryItem
          key={category.id}
          category={category}
          selected={value === category.googleType}
          onClick={() => onChange(value === category.googleType ? undefined : category.googleType)}
        />
      ))}
    </div>
  );
}
