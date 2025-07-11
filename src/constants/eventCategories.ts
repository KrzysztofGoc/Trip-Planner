import { Utensils, Landmark, Trees, Amphora, Theater, Fish, Coins, Popcorn, Music, FerrisWheel, PawPrint } from "lucide-react";
import { EventCategory } from "@/types/eventCategory";

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: "restaurant", name: "Restaurant", icon: Utensils, googleType: "restaurant" },
  { id: "tourist_attraction", name: "Landmark", icon: Landmark, googleType: "cultural_landmark" },
  { id: "park", name: "Park", icon: Trees, googleType: "park" },
  { id: "amusement_park", name: "Amusement Park", icon: FerrisWheel, googleType: "amusement_park" },
  { id: "museum", name: "Museum", icon: Amphora, googleType: "museum" },
  { id: "theater", name: "Theater", icon: Theater, googleType: "performing_arts_theater" },
  { id: "aquarium", name: "Aquarium", icon: Fish, googleType: "aquarium" },
  { id: "casino", name: "Casino", icon: Coins, googleType: "casino" },
  { id: "movie_theater", name: "Cinema", icon: Popcorn, googleType: "movie_theater" },
  { id: "opera_house", name: "Opera", icon: Music, googleType: "opera_house" },
  { id: "zoo", name: "Zoo", icon: PawPrint, googleType: "zoo" },

];