import { TripEvent } from "@/types/tripEvent";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDayDirections } from "@/api/routes";
import MapStatusMessage from "./MapStatusMessage";
import { MapStatusEnum } from "@/types/mapStatus";
interface DirectionsProps {
  events: TripEvent[];
}

export default function Directions({ events }: DirectionsProps) {
  const map = useMap("full-page-map");
  const routesLib = useMapsLibrary("routes");
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const { data: directions, isPending: isDirectionsLoading, isError: isDirectionsError } = useQuery({
    queryKey: ["directions", events],
    queryFn: () => fetchDayDirections(events),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!map) return;

    if (isDirectionsLoading || isDirectionsError) {
      map.setOptions({ gestureHandling: "none" });
    } else {
      map.setOptions({ gestureHandling: "auto" });
    }
  }, [map, isDirectionsLoading, isDirectionsError]);

  useEffect(() => {
    if (!routesLib || !map || !directions) return;

    if (!rendererRef.current) {
      rendererRef.current = new routesLib.DirectionsRenderer({ map: map });
    }

    rendererRef.current.setDirections(directions);

    return () => {
      rendererRef.current?.setMap(null);
      rendererRef.current = null;
    };
  }, [directions, map, routesLib]);

  return (
    <>
      {isDirectionsLoading && <MapStatusMessage type={MapStatusEnum.Loading} text="Loading route..." />}
      {isDirectionsError && <MapStatusMessage type={MapStatusEnum.Error} text="Error loading route" />}
    </>
  );
}
