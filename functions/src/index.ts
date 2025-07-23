import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentDeleted, onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import dayjs from "dayjs";

admin.initializeApp();

export const updateTripDateRange = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("permission-denied", "Only the trip owner can update the trip date range.");
  }

  const { tripId, startDate, endDate } = request.data || {};

  // Validate input
  if (!tripId || !startDate || !endDate) {
    throw new HttpsError("invalid-argument", "Missing data: tripId, startDate, endDate required.");
  }

  // Use dayjs for robust date handling
  const newFrom = dayjs(startDate).startOf("day");
  const newTo = dayjs(endDate).endOf("day");

  if (!newFrom.isValid() || !newTo.isValid()) {
    throw new HttpsError("invalid-argument", "Invalid dates provided.");
  }
  if (newFrom.isAfter(newTo)) {
    throw new HttpsError("invalid-argument", "Start date must be before or equal to end date.");
  }

  // Ensure trip exists
  const tripRef = admin.firestore().collection("trips").doc(tripId);
  const tripDoc = await tripRef.get();

  if (!tripDoc.exists) {
    throw new HttpsError("not-found", "Trip not found.");
  }

  const tripData = tripDoc.data();

  if (!tripData) {
    throw new HttpsError("not-found", "Trip data not found.");
  }

  if (request.auth.uid !== tripData.ownerId) {
    throw new HttpsError("permission-denied", "Only the trip owner can update the trip date range.");
  }

  // Fetch all events for this trip
  const eventsRef = tripRef.collection("events");
  const snapshot = await eventsRef.get();

  const batch = admin.firestore().batch();

  snapshot.forEach(doc => {
    const data = doc.data();

    // Defensive checks
    if (!data.from || !data.to) return;

    // Always handle Firestore Timestamp
    let fromDate = data.from instanceof Timestamp ? dayjs(data.from.toDate()) : dayjs(data.from);
    let toDate = data.to instanceof Timestamp ? dayjs(data.to.toDate()) : dayjs(data.to);

    if (!fromDate.isValid() || !toDate.isValid()) return;

    // An event is "orphaned" if it ends before trip starts, or starts after trip ends
    if (toDate.isBefore(newFrom) || fromDate.isAfter(newTo)) {
      batch.delete(doc.ref);
    }
  });

  batch.update(tripRef, {
    startDate: newFrom.toDate(),
    endDate: newTo.toDate()
  })

  await batch.commit();

  return { success: true };
});

// Fetch user data by UID
exports.getUserData = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const { uid } = request.data;

  if (!uid) {
    throw new HttpsError("invalid-argument", "Missing data: uid.");
  }

  try {
    // Fetch the user data using Firebase Admin SDK
    const userRecord = await admin.auth().getUser(uid);

    // Return the user data
    return {
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error) {
    // Handle any errors
    throw new HttpsError('internal', 'Unable to fetch user data');
  }
});

export const searchUsers = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const { query, tripId } = request.data || {};

  if (!query || typeof query !== "string" || !tripId) {
    throw new HttpsError("invalid-argument", "Missing data: query or tripId.");
  }

  // Fetch the trip from Firestore and check ownership
  const tripDoc = await admin.firestore().collection("trips").doc(tripId).get();
  if (!tripDoc.exists) {
    throw new HttpsError("not-found", "Trip not found.");
  }
  const trip = tripDoc.data();
  if (!trip || trip.ownerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the trip owner can search users.");
  }

  // List and filter users
  const lowerQuery = query.toLowerCase();
  const allUsers: admin.auth.UserRecord[] = [];
  let nextPageToken: string | undefined = undefined;

  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    allUsers.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  const filtered = allUsers.filter((user) => {
    const name = user.displayName?.toLowerCase() ?? "";
    return name.includes(lowerQuery);
  });

  return filtered.slice(0, 10).map((user) => ({
    uid: user.uid,
    displayName: user.displayName || "Unknown",
    photoURL: user.photoURL || "",
  }));
});

export const onTripDeleted = onDocumentDeleted("trips/{tripId}", async (event) => {
  const { tripId } = event.params;
  const db = admin.firestore();

  // (2) If you don’t have a participant array, fetch participants from subcollection
  let allParticipantUids: string[] = [];
  const participantsSnap = await db.collection(`trips/${tripId}/participants`).get();

  participantsSnap.forEach(doc => {
    allParticipantUids.push(doc.id); // assuming doc.id is the uid
  });

  const batch = db.batch();

  // (3) Cleanup /userTrips/{uid}/trips/{tripId}
  allParticipantUids.forEach(uid => {
    batch.delete(db.doc(`userTrips/${uid}/trips/${tripId}`));
  });

  // (4) Delete participants subcollection (server-side recursive delete)
  const participantsCollection = db.collection(`trips/${tripId}/participants`);
  const participants = await participantsCollection.listDocuments();
  for (const docRef of participants) {
    batch.delete(docRef);
  }

  // (5) Delete events subcollection
  const eventsCollection = db.collection(`trips/${tripId}/events`);
  const events = await eventsCollection.listDocuments();
  for (const docRef of events) {
    batch.delete(docRef);
  }

  // Commit all deletes
  await batch.commit();
});

export const onParticipantAdded = onDocumentCreated("trips/{tripId}/participants/{userId}", async (event) => {
  const { tripId, userId } = event.params;
  const db = admin.firestore();

  // Create reference to the trip
  const tripRef = db.doc(`trips/${tripId}`);

  await db
    .doc(`userTrips/${userId}/trips/${tripId}`)
    .set({
      tripRef,
      joinedAt: FieldValue.serverTimestamp(),
    });
});

export const onParticipantRemoved = onDocumentDeleted(
  "trips/{tripId}/participants/{userId}",
  async (event) => {
    const { tripId, userId } = event.params;
    const db = admin.firestore();

    // Remove the userTrip entry for this user/trip combo
    const userTripRef = db.doc(`userTrips/${userId}/trips/${tripId}`);
    await userTripRef.delete();
  });

export const getTripsTogether = onCall(async (request) => {
  const { currentUserUid, otherUserUid } = request.data;

  if (!currentUserUid || !otherUserUid) {
    throw new HttpsError("invalid-argument", "Missing required data");
  }
  if (!request.auth || request.auth.uid !== currentUserUid) {
    throw new HttpsError("permission-denied", "You can only fetch your own shared trips.");
  }

  const currentUserTripsRef = admin.firestore().collection(`userTrips/${currentUserUid}/trips`);
  const otherUserTripsRef = admin.firestore().collection(`userTrips/${otherUserUid}/trips`);

  const [currentUserDocRefs, otherUserDocRefs] = await Promise.all([
    currentUserTripsRef.listDocuments(),
    otherUserTripsRef.listDocuments()
  ]);

  const currentUserTripIds = new Set(currentUserDocRefs.map(ref => ref.id));
  const otherUserTripIds = new Set(otherUserDocRefs.map(ref => ref.id));

  // Intersection: count trips both are in
  let sharedTripCount = 0;
  for (const id of currentUserTripIds) {
    if (otherUserTripIds.has(id)) sharedTripCount++;
  }

  return { count: sharedTripCount };
});
