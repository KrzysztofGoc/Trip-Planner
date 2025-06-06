import { Timestamp } from "firebase-admin/firestore";

export interface TripEvent {
    id: string;
    name: string;
    category: string;
    img: string;
    address: string;
    lat: number;
    lng: number;
    from: string;
    to: string;
    eventDate: Timestamp;
}