import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPlace } from "@/api/places";

export default function AddEventPage() {
    const { tripId, dayId, placeId } = useParams();

    // Fetch details of the selected place
    const { data: placeData, isLoading, isError } = useQuery({
        queryKey: ["places", placeId],
        queryFn: () => fetchPlace(placeId),
    });

    return (
        <>
            {isLoading && <p>Loading event details...</p>}
            {isError && <p>Failed to load event details.</p>}
            {placeData && (
                <div className="p-6">
                    <img src={placeData.img} className="w-full rounded-md" />
                    <h1 className="text-2xl font-bold">{placeData.name}</h1>
                    <p className="text-gray-500">{placeData.category}</p>
                    <p className="text-gray-400">{placeData.address}</p>

                    {/* Time Picker */}
                    <div className="flex gap-4 mt-4">
                        <input type="time" className="border p-2 rounded-md" placeholder="From" />
                        <input type="time" className="border p-2 rounded-md" placeholder="To" />
                    </div>

                    {/* Add Event Button */}
                    <button className="mt-6 bg-red-500 text-white px-4 py-2 rounded-md">
                        Add Event
                    </button>
                </div>
            )}

        </>

    );
}
