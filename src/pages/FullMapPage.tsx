import TripNavigation from "@/components/Trip/TripNavigation/TripNavigation";
import Map from "@/components/Map/Map";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TripEvent } from "@/types/tripEvent";
import { fetchTripEvents } from "@/api/events";
import { fetchTrip } from "@/api/trips";
import dayjs from "dayjs";

export default function FullMapPage() {
    const { tripId } = useParams();
    const [searchParams] = useSearchParams();
    const dayParam = searchParams.get("day");

    // 1. Fetch Trip (to get startDate)
    const { data: trip, isLoading: isTripLoading, isError: isTripError, error: tripError } =
        useQuery({
            queryKey: ["trip", tripId],
            queryFn: () => fetchTrip({ tripId }),
            enabled: !!tripId,
        });

    // 2. Fetch Trip Events
    const { data: tripEvents, isLoading: isEventsLoading, isError: isEventsError, error: eventsError } =
        useQuery<TripEvent[]>({
            queryKey: ["events", { tripId }],
            queryFn: () => fetchTripEvents({ tripId }),
            enabled: !!tripId,
        });

    // 3. Handle loading/error states
    if (isTripLoading || isEventsLoading) return <p>Loading trip and events...</p>;
    if (isTripError) return <p>{tripError?.message}</p>;
    if (isEventsError) return <p>{eventsError?.message}</p>;
    if (!trip || !tripEvents) return <p>No trip or events found</p>;

    // 4. Filter events by day index, if requested
    let events = tripEvents;
    if (dayParam && trip.startDate) {
        const tripStart = dayjs(trip.startDate);
        const dayIndex = Number(dayParam); // 1-based
        const dayDate = tripStart.add(dayIndex - 1, "day");
        const dayStart = dayDate.startOf("day");
        const dayEnd = dayDate.endOf("day");

        events = tripEvents.filter(event => {
            const eventFrom = dayjs(event.from);
            // You could also check if (eventFrom.isSame(dayDate, "day"))
            return eventFrom.isAfter(dayStart) && eventFrom.isBefore(dayEnd);
        });
    }

    return (
        <div className="w-screen h-screen flex flex-col">
            <TripNavigation mode="event" showShareButton={false} />
            <Map
                mode="route"
                events={events}
            />
        </div>
    );
}
