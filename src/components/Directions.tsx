import { TripEvent } from "@/types/tripEvent";
import { useMap, useMapsLibrary, useApiLoadingStatus, APILoadingStatus, MapControl, ControlPosition } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDayDirections } from "@/api/routes";
import { LoaderCircle } from 'lucide-react';

interface DirectionsProps {
  events: TripEvent[];
}

export default function Directions({ events }: DirectionsProps) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const apiStatus = APILoadingStatus.LOADING;
  const rendererRef = useRef<google.maps.DirectionsRenderer>(null);

  const { data: directions, isLoading: isDirectionsLoading, isError: isDirectionsError, error: directionsError } = useQuery({
    queryKey: ["directions", events],
    queryFn: () => fetchDayDirections(events),
  });

  useEffect(() => {
    if (!routesLib || !map || !directions) return;

    if (!rendererRef.current) {
      rendererRef.current = new routesLib.DirectionsRenderer({ map });
    }

    rendererRef.current.setDirections(directions);

    return () => {
      rendererRef.current?.setMap(null);
      rendererRef.current = null;
    };
  }, [directions, map, routesLib]);

  console.log(apiStatus);

  return (
    <>
      {true && (
        <MapControl position={ControlPosition.CENTER}>
          <div className="bg-white rounded p-4 shadow">
            {apiStatus === APILoadingStatus.LOADING && (
              <div className="flex items-center gap-2">
                <LoaderCircle className="size-6 animate-spin text-red-400" />
                <p className="font-semibold text-lg">Loading Directions API</p>
              </div>
            )}

            {apiStatus === APILoadingStatus.FAILED && <p>Could Not Load Directions API</p>}

            {apiStatus === APILoadingStatus.LOADED && (
              <>
                {isDirectionsError && <p>Error Loading Route: {directionsError?.message}</p>}
                {isDirectionsLoading && (
                  <div className="flex gap-2 content-center align-middle">
                    <LoaderCircle className="size-6 animate-spin text-red-400 " />
                    <p className="text-center">Loading Route</p>
                  </div>
                )}
              </>
            )}
          </div>
        </MapControl>
      )}
    </>
  );
}
