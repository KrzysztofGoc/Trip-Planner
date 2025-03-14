import { Utensils, Landmark, Trees } from "lucide-react";
import { EventCategory } from "@/types/eventCategory";

export const EVENT_CATEGORIES: EventCategory[] = [
    { id: "restaurant", name: "Restaurant", icon: Utensils },
    { id: "landmark", name: "Landmark", icon: Landmark },
    { id: "park", name: "Park", icon: Trees },
];