import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchTripEvent } from "@/api/events";

export default function EditEventPage() {
    const { tripId, eventId } = useParams();
    const { data: eventData, isLoading, isError, error } = useQuery({
        queryFn: ({ signal }) => fetchTripEvent({ signal, tripId, eventId }),
        queryKey: ["trips", { tripId: tripId }],
    });

    return (
        <>
            {isLoading && <p>Loading event...</p>}
            {isError && <p>Event not found.</p>}
            {eventData && (
                <p>Event edit page</p>
            )}
        </>
    );
}