import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Participant } from "@/types/participant";

export async function fetchParticipants({ tripId }: { tripId: string | undefined }): Promise<Participant[]> {
  if (!tripId) throw new Error("Trip ID is missing");

  const colRef = collection(db, "trips", tripId, "participants");
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map((doc) => doc.data() as Participant);
}