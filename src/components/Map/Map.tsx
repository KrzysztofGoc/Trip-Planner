import { Place } from '@/types/place';
import { TripEvent } from '@/types/tripEvent';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import Directions from './MapDirections';
import MapStatusMessage from './MapStatusMessage';
import { MapStatusEnum } from '@/types/mapStatus';
import { useRef } from 'react';
import MapFullscreenButton from './MapFullscreenButton';

type MapProps =
  | { mode: 'place'; place: Place }
  | { mode: 'route'; events: TripEvent[] };


/* Component that renders a Google Map based on the selected mode:
 - 'place': shows a single location with map controls disabled
 - 'route': shows a day's travel route with multiple trip events */
export default function MapComponent(props: MapProps) {
  const map = useMap("full-page-map");
  const containerRef = useRef<HTMLDivElement>(null);

  const isPlaceMode = props.mode === 'place';
  const isRouteMode = props.mode === 'route';

  let center: { lat: number, lng: number } = { lat: 0, lng: 0 };       // Map center point
  let content: React.ReactNode | null = null;                          // Content rendered inside the map
  let zoom: number | undefined = undefined;                            // Zoom level
  let mapOptions = {};                                                 // Optional props spread into <Map />

  // When map is showing one place
  if (isPlaceMode) {
    center = { lat: props.place.lat, lng: props.place.lng };
    content = (
      <>
        <AdvancedMarker position={center} />
        <MapFullscreenButton onMaximize={handleEnterFullscreen} onMinimize={handleExitFullscreen} />
      </>
    );
    zoom = 16;

    // Disable gestures,shortcuts and clickable icons in preview-style map
    mapOptions = {
      gestureHandling: 'none',
      keyboardShortcuts: false,
      clickableIcons: false,
    };
  }

  // When map is showing day's route
  if (isRouteMode) {
    const events = props.events;
    zoom = 12;

    // No events → show an error message
    if (events.length === 0) {
      content = <MapStatusMessage type={MapStatusEnum.Error} text="No events for this day" />;

      // One event → show a single marker
    } else if (events.length === 1) {
      center = { lat: events[0].lat, lng: events[0].lng };
      content = <AdvancedMarker position={{ lat: events[0].lat, lng: events[0].lng }} />

      // Multiple events → show route directions
    } else if (events.length > 1) {
      center = { lat: events[0].lat, lng: events[0].lng };
      content = <Directions events={events} />;
    }
  }

  async function handleEnterFullscreen() {
    if (!containerRef.current || !map) return;

    try {
      await containerRef.current.requestFullscreen();
      map.setOptions({
        gestureHandling: 'greedy',
        keyboardShortcuts: true,
        clickableIcons: true,
      });
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  };

  async function handleExitFullscreen() {
    if (!map) return;

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        map.panTo(center);
        map.setZoom(zoom ?? 16)
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }

    map.setOptions({
      gestureHandling: 'none',
      keyboardShortcuts: false,
      clickableIcons: false,
    });
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Map
        id="full-page-map"
        defaultZoom={zoom}
        defaultCenter={center}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        reuseMaps={true}
        disableDefaultUI={true}
        {...mapOptions}
      >
        {content}
      </Map>
    </div>

  );
}
