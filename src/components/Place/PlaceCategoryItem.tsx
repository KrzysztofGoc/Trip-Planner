import { EventCategory } from "@/types/eventCategory";

interface PlaceCategoryItemProps {
    category: EventCategory;
}

export default function PlaceCategoryItem({ category }: PlaceCategoryItemProps) {
    const Icon = category.icon;

    return (
        <button className="flex flex-col items-center gap-2 p-3 grow">
            <Icon className="size-6 stroke-current" />
            <span>{category.name}</span>
        </button>
    );
}