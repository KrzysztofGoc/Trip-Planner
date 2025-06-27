import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useReducer, useEffect } from "react";
import { rangeReducer } from "@/state/eventRangeReducer";

import { fetchPlace } from "@/api/places";
import { addTripEvent, updateTripEvent, fetchTripEvent } from "@/api/events";
import { fetchTrip } from "@/api/trips";

import EventTimeRange from "@/components/EventTimeRange/EventTimeRange";
import EventFormActionButton from "@/components/EventFormActionButton";
import TripImage from "@/components/Trip/TripImage";
import TripHeader from "@/components/Trip/TripHeader/TripHeader";
import TripNavigation from "@/components/Trip/TripNavigation";
import MapWidget from "@/components/Map/MapWidget";

import dayjs from "dayjs";
import { toast } from "sonner";

function getTripDayDateObj(startDate: Date, day: number) {
    return dayjs(startDate).add(day - 1, "day").toDate();
}

export default function EventFormPage() {
    const { tripId, dayNumber, placeId, eventId } = useParams();
    const navigate = useNavigate();

    const isEditing = !!eventId;
    const isAdding = !!placeId && !!dayNumber;

    // --- Hooks MUST be top-level, no conditions!
    const [rangeState, rangeDispatch] = useReducer(rangeReducer, {
        mode: "idle",
        range: { from: null, to: null }
    });

    // Always call hooks, regardless of param presence:
    const { data: tripData, isLoading: isTripLoading, isError: isTripError, error: tripError } = useQuery({
        queryKey: ["trip", tripId],
        queryFn: () => fetchTrip({ tripId }),
    });

    const { data: placeData, isLoading: isPlaceLoading, isError: isPlaceError, error: placeError } = useQuery({
        queryKey: ["place", placeId],
        queryFn: () => fetchPlace(placeId),
        enabled: isAdding,
    });

    const { data: eventData, isLoading: isEventLoading, isError: isEventError, error: eventError } = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => fetchTripEvent({ tripId, eventId }),
        enabled: isEditing,
    });

    const addMutation = useMutation({
        mutationFn: addTripEvent,
        onSuccess: () => {
            toast.success("Event added!");
            navigate(`/trips/${tripId}`);
        },
        onError: () => {
            toast.error("Failed to add event");
        }
    });

    const editMutation = useMutation({
        mutationFn: updateTripEvent,
        onSuccess: () => {
            toast.success("Event updated!");
            navigate(`/trips/${tripId}`);
        },
        onError: () => {
            toast.error("Failed to update event");
        }
    });

    // --- Unconditionally sync reducer when data loads/changes
    useEffect(() => {
        if (eventId && eventData) {
            // Editing mode
            rangeDispatch({
                type: "RESET",
                state: {
                    mode: "idle",
                    range: { from: eventData.from, to: eventData.to }
                }
            });
        } else if (placeId && dayNumber && tripData && placeData) {
            // Adding mode
            const addingDate = getTripDayDateObj(tripData.startDate, Number(dayNumber));
            rangeDispatch({
                type: "RESET",
                state: {
                    mode: "idle",
                    range: { from: null, to: null },
                    addingDate
                }
            });
        }
    }, [eventId, eventData, placeId, dayNumber, tripData, placeData]);

    // --- Handle loading/errors (these may return early, that's fine)
    if (isTripLoading || isPlaceLoading || isEventLoading) return <p>Loading...</p>;
    if (isTripError || isPlaceError || isEventError) return <p>{tripError?.message || placeError?.message || eventError?.message}</p>;
    
    if (!tripData) throw new Error("No trip found.");

    // --- Add/Edit Handler
    function handleSaveOrAdd() {
        const { from, to } = rangeState.range;
        if (!from || !to) {
            toast.error("Please select a valid time range.");
            return;
        }

        // Add event
        if (placeId && placeData && tripData) {
            addMutation.mutate({
                tripId,
                event: {
                    ...placeData,
                    from: from,
                    to: to,
                }
            });
        }
        // Edit event
        else if (eventId && eventData) {
            editMutation.mutate({
                tripId,
                eventId,
                event: {
                    from: from,
                    to: to,
                }
            });
        }
    }

    // --- Render: Editing or Adding
    if (eventId && eventData) {
        const eventDate = dayjs(eventData.from);
        const eventDay = eventDate.diff(tripData.startDate, "days") + 1;
        const formattedEventDate = eventDate.format("MMM D, YYYY");
        const formattedDate = `Day ${eventDay}, ${formattedEventDate}`;

        const placeForMap = {
            id: eventData.id,
            name: eventData.name,
            category: eventData.category,
            img: eventData.img,
            address: eventData.address,
            lat: eventData.lat,
            lng: eventData.lng
        };

        return (
            <div className="size-auto flex flex-col pb-32">
                <TripNavigation />
                <TripImage mode="event" imageUrl={eventData.img} />
                <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">
                    <TripHeader
                        mode="event"
                        name={eventData.name}
                        destination={eventData.address}
                        formattedDate={formattedDate}
                    />
                    <EventTimeRange
                        mode="edit"
                        tripId={tripId}
                        eventId={eventId}
                        from={eventData.from}
                        to={eventData.to}
                        state={rangeState}
                        dispatch={rangeDispatch}
                    />
                    <EventFormActionButton
                        onClick={handleSaveOrAdd}
                        label="Save"
                        disabled={!(rangeState.range.from && rangeState.range.to)}
                    />
                    <MapWidget place={placeForMap} />
                </div>
            </div>
        );
    }

    if (placeId && dayNumber && placeData && tripData) {
        const day = Number(dayNumber);
        const addingDate = getTripDayDateObj(tripData.startDate, day);
        const formattedDate = dayjs(addingDate).format("MMM D");
        const formattedDayDate = `Day ${day}, ${formattedDate}`;

        return (
            <div className="size-auto flex flex-col pb-32">
                <TripNavigation />
                <TripImage mode="event" imageUrl={placeData.img} />
                <div className="size-auto h-2/3 flex flex-col px-6 pt-6 gap-6">
                    <TripHeader
                        mode="event"
                        name={placeData.name}
                        destination={placeData.address}
                        formattedDate={formattedDayDate}
                    />
                    <EventTimeRange
                        mode="add"
                        tripId={tripId}
                        addingDate={addingDate}
                        state={rangeState}
                        dispatch={rangeDispatch}
                    />
                    <EventFormActionButton
                        onClick={handleSaveOrAdd}
                        label="Add"
                        disabled={!(rangeState.range.from && rangeState.range.to)}
                    />
                    <MapWidget place={placeData} />
                </div>
            </div>
        );
    }
}
