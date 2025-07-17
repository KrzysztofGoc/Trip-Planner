import { TripEvent } from "@/types/tripEvent";

export const fetchDayDirections = async (events: TripEvent[]): Promise<google.maps.DirectionsResult> => {
    if (!events) throw new Error("Events are missing");

    if (events.length < 2) {
      throw new Error("At least two events are required to calculate directions.");
    }

    const origin = { lat: events[0].lat, lng: events[0].lng };
    const destination = { lat: events[events.length - 1].lat, lng: events[events.length - 1].lng };
    const waypoints = events.slice(1, -1).map((event) => ({
      location: { lat: event.lat, lng: event.lng },
      stopover: true,
    }));
  
    const { DirectionsService } = await google.maps.importLibrary("routes") as google.maps.RoutesLibrary;
    const service = new DirectionsService();
  
    return new Promise((resolve, reject) => {
      service.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          language: "en",
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error("Failed to fetch directions: " + status));
          }
        }
      );
    });
  };
  