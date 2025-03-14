import EventCategoryItem from "./EventCategoryItem";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";

export default function EventCategoryFilter() {
    return (
        <div className="size-auto flex justify-stretch gap-2">
            {EVENT_CATEGORIES.map((category) => (
                <EventCategoryItem key={category.id} category={category} />
            ))}
        </div>
    );
}