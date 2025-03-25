import 'leaflet/dist/leaflet.css';
import { Place } from '@/types/place';
import { TripEvent } from '@/types/tripEvent';


type MapProps = { mode: 'place'; place: Place } | { mode: 'route'; events: TripEvent[] };

export default function MapComponent(props: MapProps) {
  return (
    <p>Map Component</p>
  );
}
