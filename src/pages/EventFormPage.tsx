import { useParams } from "react-router-dom";
import { fetchPlace } from "@/api/places";
import { fetchTrip } from "@/api/trips";
import { useQuery } from "@tanstack/react-query";
import TripNavigation from "@/components/Trip/TripNavigation";
import TripImage from "@/components/Trip/TripImage";
import TripHeader from "@/components/Trip/TripHeader";
import TripDateRange from "@/components/Trip/TripDateRange";
import { Place } from "@/types/place";
import { Trip } from "@/types/trip";
import dayjs from "dayjs";

function getTripDayDate(startDate: string, day: number) {
    return dayjs(startDate).add(day - 1, "day").format("MMM D");
}

export default function EventFormPage() {
    const { tripId, dayNumber, placeId, eventId } = useParams();

    const isEditing = !!eventId;
    const isAdding = !!placeId && !!dayNumber;

    if (!isAdding && !isEditing) {
        throw new Error("Route params not found.")
    }

    const {
        data: tripData,
        isLoading: isTripLoading,
        isError: isTripError,
        error: tripError,
    } = useQuery<Trip>({
        queryKey: ["trip", tripId],
        queryFn: ({ signal }) => fetchTrip({ signal, tripId }),
    });

    const {
        data: placeData,
        isLoading: isPlaceLoading,
        isError: isPlaceError,
        error: placeError,
    } = useQuery<Place>({
        queryKey: ["place", placeId],
        queryFn: () => fetchPlace(placeId),
        enabled: isAdding,
    });

    // Show loading state
    if (isTripLoading || isPlaceLoading) {
        return <p>Loading...</p>;
    }

    // Show error state
    if (isTripError || isPlaceError) {
        return <p>{tripError?.message || placeError?.message}</p>;
    }

    // Safeguard to satisfy typescript
    if (!tripData) {
        throw new Error("No trip found.");
    };

    // Handle edit mode
    if (isEditing) {
        const eventData = tripData.events.find((event) => event.id === eventId);

        // Safeguard if no event with eventId was found 
        if (!eventData) {
            throw new Error("No event found.");
        };

        // If editing event the day is retireved from fetched data event
        const day = eventData.dayNumber;
        const formattedDate = getTripDayDate(tripData.startDate, day);
        const formattedDayDate = `Day ${day}, ${formattedDate}`;

        return (
            <div className="size-auto flex flex-col">
                <TripNavigation />
                <TripImage imageUrl={eventData.img} />

                <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">
                    <TripHeader
                        name={eventData.name}
                        destination={eventData.address}
                        formattedDate={formattedDayDate}
                    />
                    <TripDateRange
                        startDate={`${formattedDate}, ${eventData.from}`}
                        endDate={`${formattedDate}, ${eventData.to}`}
                    />
                </div>
            </div>
        );
    }

    // Handle add mode
    if (isAdding) {

        // Safeguard to satisfy typescript
        if (!placeData) {
            throw new Error("No place found.")
        }

        // If adding event the day is derieved from route param
        const day = Number(dayNumber);
        const formattedDate = getTripDayDate(tripData.startDate, day);
        const formattedDayDate = `Day ${day}, ${formattedDate}`;

        return (
            <div className="size-auto flex flex-col">
                <TripNavigation />
                <TripImage imageUrl={placeData.img} />

                <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">
                    <TripHeader
                        name={placeData.name}
                        destination={placeData.address}
                        formattedDate={formattedDayDate}
                    />
                    <TripDateRange
                        startDate={`${formattedDate}, not selected`}
                        endDate={`${formattedDate}, not selected`}
                    />
                </div>
            </div>
        );
    }
}
