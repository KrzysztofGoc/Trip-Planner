import { Place } from '@/types/place';
import { TripEvent } from '@/types/tripEvent';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import Directions from './MapDirections';
import MapStatusMessage from './MapStatusMessage';
import { MapStatusEnum } from '@/types/mapStatus';

type MapProps =
  | { mode: 'place'; place: Place }
  | { mode: 'route'; events: TripEvent[] };

export default function MapComponent(props: MapProps) {
  const isPlaceMode = props.mode === 'place';
  const isRouteMode = props.mode === 'route';
  const events = isRouteMode ? props.events : [];

  let center = { lat: 0, lng: 0 };
  let content: React.ReactNode = null;

  // When map is showing one place
  if (isPlaceMode) {
    center = { lat: props.place.lat, lng: props.place.lng };
    content = <AdvancedMarker position={center} />;
  }

  // When map is showing day's route
  if (isRouteMode) {
    // When there are no events in selected day, display error message
    if (events.length === 0) {
      content = <MapStatusMessage type={MapStatusEnum.Error} text="No events for this day" />;

      // When there is 1 event in selected day, display single marker
    } else if (events.length === 1) {
      center = { lat: events[0].lat, lng: events[0].lng };
      content = <AdvancedMarker position={{ lat: events[0].lat, lng: events[0].lng }} />

      // When there are at least 2 events, display route
    } else if (events.length > 1) {
      center = { lat: events[0].lat, lng: events[0].lng };
      content = <Directions events={events} />;
    }
  }

  return (
    <div className="w-screen h-screen">
      <Map
        id="full-page-map"
        defaultZoom={12}
        defaultCenter={center}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        disableDefaultUI={true}
        reuseMaps={true}
      >
        {content}
      </Map>
    </div>
  );
}
