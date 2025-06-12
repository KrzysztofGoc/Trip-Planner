export interface TripEvent {
  id: string;
  name: string;
  category: string;
  img: string;
  address: string;
  lat: number;
  lng: number;
  eventDate: Date;
  from: string;
  to: string;
}