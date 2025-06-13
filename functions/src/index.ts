import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { TripEvent } from "./types/event";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import dayjs from "dayjs";

admin.initializeApp();

export const updateTripDateRange = onCall(async (request) => {
  const { tripId, startDate, endDate } = request.data || {};

  // TODO: Add auth validation later

  // Validate input
  if (!tripId || !startDate || !endDate) {
    throw new HttpsError("invalid-argument", "Missing data: tripId, startDate, endDate required.");
  }

  const newFrom = new Date(startDate);
  const newTo = new Date(endDate);

  if (isNaN(newFrom.getTime()) || isNaN(newTo.getTime())) {
    throw new HttpsError("invalid-argument", "Invalid dates provided.");
  }
  if (newFrom > newTo) {
    throw new HttpsError("invalid-argument", "Start date must be before or equal to end date.");
  }

  // Ensure trip exists
  const tripRef = admin.firestore().collection("trips").doc(tripId);
  const tripDoc = await tripRef.get();

  if (!tripDoc.exists) {
    throw new HttpsError("not-found", "Trip not found.");
  }

  // Fetch all events for this trip
  const eventsRef = tripRef.collection("events");
  const snapshot = await eventsRef.get();

  const batch = admin.firestore().batch();
  const orphans: TripEvent[] = [];

  snapshot.forEach(doc => {
    const data = doc.data() as TripEvent;

    // Defensive checks
    if (!data.from || !data.to) return;

    let fromDate: Date;
    let toDate: Date;

    if (data.from instanceof Timestamp) {
      fromDate = data.from.toDate();
    } else {
      return;
    }

    if (data.to instanceof Timestamp) {
      toDate = data.to.toDate();
    } else {
      return;
    }

    if (isNaN(toDate.getTime()) || isNaN(fromDate.getTime())) return; // skip malformed

    if (
      dayjs(fromDate).isBefore(newFrom, "day") ||
      dayjs(toDate).isAfter(newTo, "day")
    ) {
      orphans.push(data);
      batch.delete(doc.ref);
    }
  });

  // Update trip document
  batch.update(tripRef, {
    startDate: Timestamp.fromDate(newFrom),
    endDate: Timestamp.fromDate(newTo),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Commit changes
  await batch.commit();

  return { success: true };
});
