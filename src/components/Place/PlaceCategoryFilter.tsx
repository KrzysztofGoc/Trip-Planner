import PlaceCategoryItem from "./PlaceCategoryItem";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";

export default function PlaceCategoryFilter() {
    return (
        <div className="size-auto flex justify-stretch gap-2">
            {EVENT_CATEGORIES.map((category) => (
                <PlaceCategoryItem key={category.id} category={category} />
            ))}
        </div>
    );
}