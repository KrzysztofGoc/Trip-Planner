import { TripEvent } from "@/types/tripEvent";
import { fetchTrip } from "./trips";

interface FetchTripEventParams {
    signal?: AbortSignal;
    tripId: string | undefined;
    eventId: string | undefined;
}

export const fetchTripEvent = async ({ signal, tripId, eventId }: FetchTripEventParams): Promise<TripEvent> => {
    if (!tripId) throw new Error("Trip ID is missing");
    if (!eventId) throw new Error("Event ID is missing");

    const tripData = await fetchTrip({ signal, tripId })

    const event = tripData.events.find((event: TripEvent) => event.id === eventId);

    if (!event) throw new Error(`Event with id ${eventId} not found`);

    return event;
};