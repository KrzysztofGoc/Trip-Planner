import { TripEvent } from "@/types/tripEvent";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, DocumentData } from "firebase/firestore";

interface FetchTripEventParams {
  tripId: string | undefined;
  eventId: string | undefined;
}

interface FetchTripEventsParams {
  tripId: string | undefined;
}

// Helper to convert Firestore data to TripEvent with eventDate as Date
const parseTripEvent = (id: string, data: DocumentData): TripEvent => {

  const parsedTripEvent = {
    id,
    name: data.name,
    category: data.category,
    img: data.img,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    from: data.from,
    to: data.to,
    eventDate: data.eventDate.toDate(), // Convert Firestore Timestamp to JS Date
  };

  return parsedTripEvent;
};

export const fetchTripEvent = async ({ tripId, eventId }: FetchTripEventParams): Promise<TripEvent> => {
  if (!tripId) throw new Error("Trip ID is missing");
  if (!eventId) throw new Error("Event ID is missing");

  const eventRef = doc(db, "trips", tripId, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    throw new Error(`Event with id ${eventId} not found`);
  }

  return parseTripEvent(eventSnap.id, eventSnap.data());
};

export const fetchTripEvents = async ({ tripId }: FetchTripEventsParams): Promise<TripEvent[]> => {
  if (!tripId) throw new Error("Trip ID is missing");

  const eventsRef = collection(db, "trips", tripId, "events");
  const snapshot = await getDocs(eventsRef);

  return snapshot.docs.map(doc => parseTripEvent(doc.id, doc.data()));
};
