import { TripEvent } from "@/types/tripEvent";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
interface FetchTripEventParams {
    tripId: string | undefined;
    eventId: string | undefined;
}

interface FetchTripEventsParams {
    tripId: string | undefined;
}

export const fetchTripEvent = async ({ tripId, eventId }: FetchTripEventParams): Promise<TripEvent> => {
    if (!tripId) throw new Error("Trip ID is missing");
    if (!eventId) throw new Error("Event ID is missing");

    const eventRef = doc(db, "trips", tripId, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
        throw new Error(`Event with id ${eventId} not found`);
    }

    return {
        id: eventSnap.id,
        ...eventSnap.data(),
    } as TripEvent;
};

export const fetchTripEvents = async ({ tripId }: FetchTripEventsParams): Promise<TripEvent[]> => {
    if (!tripId) throw new Error("Trip ID is missing");

    const eventsRef = collection(db, "trips", tripId, "events");
    const snapshot = await getDocs(eventsRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as TripEvent[];
};