export type TripEvent = {
  id: string;
  name: string;
  category: string;
  img: string;
  address: string;
  lat: number;
  lng: number;
  from: Date;
  to: Date;
  optimistic?: boolean;
}
