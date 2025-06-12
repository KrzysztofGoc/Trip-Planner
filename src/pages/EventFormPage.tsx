import { useParams } from "react-router-dom";
import { fetchPlace } from "@/api/places";
import { fetchTrip } from "@/api/trips";
import { useQuery } from "@tanstack/react-query";
import TripNavigation from "@/components/Trip/TripNavigation";
import TripImage from "@/components/Trip/TripImage";
import TripHeader from "@/components/Trip/TripHeader/TripHeader";
import TripDateRange from "@/components/Trip/TripDateRange/TripDateRange";
import { Place } from "@/types/place";
import { Trip } from "@/types/trip";
import { TripEvent } from "@/types/tripEvent";
import dayjs from "dayjs";
import EventFormActionButton from "@/components/EventFormActionButton";
import MapWidget from "@/components/Map/MapWidget";
import { fetchTripEvent } from "@/api/events"; // Updated fetch function to get event data

function getTripDayDate(startDate: Date, day: number) {
    return dayjs(startDate).add(day - 1, "day").format("MMM D");
}

export default function EventFormPage() {
    const { tripId, dayNumber, placeId, eventId } = useParams();

    const isEditing = !!eventId;
    const isAdding = !!placeId && !!dayNumber;

    if (!isAdding && !isEditing) {
        throw new Error("Route params not found.")
    }

    const { data: tripData, isLoading: isTripLoading, isError: isTripError, error: tripError } = useQuery<Trip>({
        queryKey: ["trip", tripId],
        queryFn: () => fetchTrip({ tripId }),
    });

    const { data: placeData, isLoading: isPlaceLoading, isError: isPlaceError, error: placeError } = useQuery<Place>({
        queryKey: ["place", placeId],
        queryFn: () => fetchPlace(placeId),
        enabled: isAdding,
    });

    // Query to fetch event for editing
    const { data: eventData, isLoading: isEventLoading, isError: isEventError, error: eventError } = useQuery<TripEvent>({
        queryKey: ["event", eventId],
        queryFn: () => fetchTripEvent({ tripId, eventId }),
        enabled: isEditing,
    });

    if (isTripLoading || isPlaceLoading || isEventLoading) {
        return <p>Loading...</p>;
    }

    if (isTripError || isPlaceError || isEventError) {
        return <p>{tripError?.message || placeError?.message || eventError?.message}</p>;
    }

    // TODO Reroute to Not Found page 
    if (!tripData) {
        throw new Error("No trip found.");
    };

    // Handle edit mode
    if (isEditing) {
        // TODO Reroute to Not Found page
        if (!eventData) {
            throw new Error("No event found.");
        };

        const eventDate = dayjs(eventData.eventDate);
        const tripStartDate = dayjs(tripData.startDate);

        const eventDay = eventDate.diff(tripStartDate, "days") + 1; // Calculate dayNumber (1-based)
        const formattedEventDate = eventDate.format("MMM D, YYYY");

        const formattedDate = `Day ${eventDay}, ${formattedEventDate}`;

        return (
            <div className="size-auto flex flex-col">
                <TripNavigation />
                <TripImage mode="display" imageUrl={eventData.img} />

                <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">
                    <TripHeader
                        mode="event"
                        name={eventData.name}
                        destination={eventData.address}
                        formattedDate={formattedDate}
                    />
                    {/* <TripDateRange
                        startDate={`${formattedDate}, ${eventData.from}`}
                        endDate={`${formattedDate}, ${eventData.to}`}
                    /> */}
                    <EventFormActionButton onClick={() => null} label="Save" />
                </div>
            </div>
        );
    }

    // Handle add mode
    if (isAdding) {
        // TODO Reroute to Not Found page
        if (!placeData) {
            throw new Error("No place found.")
        }

        // If adding event the day is derived from route param
        const day = Number(dayNumber);
        const formattedDate = getTripDayDate(tripData.startDate, day);
        const formattedDayDate = `Day ${day}, ${formattedDate}`;

        return (
            <div className="size-auto flex flex-col pb-84">
                <TripNavigation />
                <TripImage mode="display" imageUrl={placeData.img} />

                <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">
                    <TripHeader
                        mode="event"
                        name={placeData.name}
                        destination={placeData.address}
                        formattedDate={formattedDayDate}
                    />
                    {/* <TripDateRange
                        startDate={`${formattedDate}, not selected`}
                        endDate={`${formattedDate}, not selected`}
                    /> */}
                    <EventFormActionButton onClick={() => null} label="Add" />
                    <MapWidget place={placeData} />
                </div>
            </div>
        );
    }
}
