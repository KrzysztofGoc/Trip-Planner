import { useRef } from 'react';
import { Place } from '@/types/place';
import { TripEvent } from '@/types/tripEvent';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import Directions from './MapDirections';
import MapStatusMessage from './MapStatusMessage';
import { MapStatusEnum } from '@/types/mapStatus';
import MapFullscreenButton from './MapFullscreenButton';

function fitBoundsForEvents(map: google.maps.Map, events: TripEvent[]) {
  if (!map || !events.length) return;
  const bounds = new window.google.maps.LatLngBounds();
  events.forEach(ev => bounds.extend({ lat: ev.lat, lng: ev.lng }));
  map.fitBounds(bounds, 64);
  if (events.length === 1) {
    map.setZoom(15);
  }
}

type MapProps =
  | { mode: 'place'; place: Place }
  | { mode: 'route'; events: TripEvent[] };

export default function MapComponent(props: MapProps) {
  const map = useMap("full-page-map");
  const containerRef = useRef<HTMLDivElement>(null);

  const isPlaceMode = props.mode === 'place';
  const isRouteMode = props.mode === 'route';

  // --------- For place mode ---------
  let center: { lat: number, lng: number } = { lat: 0, lng: 0 };
  let zoom: number | undefined = undefined;
  let content: React.ReactNode | null = null;

  const mapOptions = {
    gestureHandling: 'none',
    keyboardShortcuts: false,
    clickableIcons: false,
  };

  if (isPlaceMode) {
    zoom = 16;
    center = { lat: props.place.lat, lng: props.place.lng };
    content = (
      <>
        <AdvancedMarker position={center} clickable={false} />
        <MapFullscreenButton onMaximize={handleEnterFullscreen} onMinimize={handleExitFullscreen} />
      </>
    );
  }

  // --------- For route mode ---------
  const events = isRouteMode ? props.events : [];
  // We'll let useEffect handle fitBounds/panning for all event cases!

  if (isRouteMode) {
    zoom = 12;
    if (events.length === 0) {
      content = <MapStatusMessage type={MapStatusEnum.Error} text="No events for this day" />;
    } else if (events.length === 1) {
      center = { lat: events[0].lat, lng: events[0].lng };
      map?.setCenter(center);
      content = (
        <>
          <AdvancedMarker position={center} clickable={false} />
          <MapFullscreenButton onMaximize={handleEnterFullscreen} onMinimize={handleExitFullscreen} />
        </>
      );
    } else if (events.length > 1) {
      content = (
        <>
          <Directions events={events} />
          <MapFullscreenButton onMaximize={handleEnterFullscreen} onMinimize={handleExitFullscreen} />
        </>
      );
    }
  }

  // --------- Fullscreen handlers ---------
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
  }

  async function handleExitFullscreen() {
    if (!map) return;
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }
    map.setOptions({
      gestureHandling: 'none',
      keyboardShortcuts: false,
      clickableIcons: false,
    });

    // <<--- Add this here!
    if (isRouteMode) {
      fitBoundsForEvents(map, events);
    }
    if (isPlaceMode) {
      map.panTo(center);
      map.setZoom(zoom ?? 16)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Map
        id="full-page-map"
        defaultZoom={zoom}
        defaultCenter={center}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        disableDefaultUI={true}
        reuseMaps={true}
        {...mapOptions}
      >
        {content}
      </Map>
    </div>
  );
}
