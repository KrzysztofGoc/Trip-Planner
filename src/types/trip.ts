import { Timestamp } from "firebase/firestore";

export interface Trip {
    id: string;
    name: string | null;
    destination: string | null;
    startDate: Date | null;
    endDate: Date | null;
    description: string | null;
    image: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    ownerId: string;
  }