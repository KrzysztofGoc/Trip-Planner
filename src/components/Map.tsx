import { Place } from '@/types/place';
import { TripEvent } from '@/types/tripEvent';
import { Map } from '@vis.gl/react-google-maps';


type MapProps = { mode: 'place'; place: Place } | { mode: 'route'; events: TripEvent[] };

export default function MapComponent(props: MapProps) {
  return (
    <Map
      mapId="" // Optional - for custom styled maps
      style={{ width: '100%', height: '500px' }}
      defaultCenter={{ lat: 35.6895, lng: 139.6917 }}
      defaultZoom={10}
    />
  );
}
