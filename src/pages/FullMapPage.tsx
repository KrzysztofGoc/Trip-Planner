import TripNavigation from "@/components/Trip/TripNavigation";
import { useParams } from "react-router-dom";
import Map from "@/components/Map";
import { useQuery } from "@tanstack/react-query";
import { fetchPlace } from "@/api/places";
import { TripEvent } from "@/types/tripEvent";

export default function FullMapPage() {
    const { tripId } = useParams();

    const data: TripEvent[] = [
        {
            id: "2",
            name: "Tokyo Tower",
            category: "Observation Deck",
            img: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8",
            address: "Minato, Tokyo",
            lat: 35.6586,
            lng: 139.7454,
            from: "10:30",
            to: "11:30",
            dayNumber: 1,
        },
        {
            id: "1",
            name: "Shibuya Crossing",
            category: "Landmark",
            img: "https://images.unsplash.com/photo-1564608909988-b678124c55d6",
            address: "Shibuya, Tokyo",
            lat: 35.6595,
            lng: 139.7004,
            from: "09:00",
            to: "10:00",
            dayNumber: 1,
        },
        {
            id: "3",
            name: "Asakusa Temple",
            category: "Temple",
            img: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c",
            address: "Asakusa, Tokyo",
            lat: 35.7148,
            lng: 139.7967,
            from: "12:00",
            to: "13:00",
            dayNumber: 1,
        },

    ];

    return (
        <div className="size-auto flex flex-col">
            <TripNavigation />
            <Map mode="route" events={data} />
        </div>
    );
}