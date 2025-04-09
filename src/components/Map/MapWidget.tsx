import { Place } from "@/types/place";
import Map from "./Map";


interface MapWidgetProps {
    place: Place
}

export default function MapWidget({ place }: MapWidgetProps) {
    return (
        <div className="flex flex-col rounded-lg overflow-hidden shadow-md bg-white">
            <div className="h-64 w-full">
                <Map mode="place" place={place} />
            </div>
            <div className="w-full p-4 space-y-1">
                <p className="text-lg font-semibold">{place.name}</p>
                <p className="text-sm text-gray-600">{place.category}</p>
                <p className="text-sm text-gray-500">{place.address}</p>
            </div>
        </div>
    );
}