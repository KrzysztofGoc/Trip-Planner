import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useReducer, useEffect } from "react";
import { rangeReducer } from "@/state/eventRangeReducer";

import { fetchPlace } from "@/api/places";
import { addTripEvent, updateTripEvent, fetchTripEvent } from "@/api/events";
import { fetchTrip } from "@/api/trips";
import { queryClient } from "@/api/queryClient";

import EventTimeRange from "@/components/EventTimeRange/EventTimeRange";
import EventFormActionButton from "@/components/EventFormActionButton";
import TripImage from "@/components/Trip/TripImage";
import TripHeader from "@/components/Trip/TripHeader/TripHeader";
import TripNavigation from "@/components/Trip/TripNavigation/TripNavigation";
import MapWidget from "@/components/Map/MapWidget";

import dayjs from "dayjs";
import { toast } from "sonner";
import { TripEvent } from "@/types/tripEvent";
import { useAuthStore } from "@/state/useAuthStore";
import UniversalLoader from "@/components/LoadingSpinner";

function getTripDayDateObj(startDate: Date, day: number) {
    return dayjs(startDate).add(day - 1, "day").toDate();
}

export default function EventFormPage() {
    const { tripId, dayNumber, placeId, eventId } = useParams();
    const navigate = useNavigate();

    const isEditing = !!eventId;
    const isAdding = !!placeId && !!dayNumber;

    const [rangeState, rangeDispatch] = useReducer(rangeReducer, {
        mode: "idle",
        range: { from: null, to: null }
    });

    const { data: tripData, isLoading: isTripLoading, isError: isTripError, error: tripError } = useQuery({
        queryKey: ["trip", tripId],
        queryFn: () => fetchTrip({ tripId }),
        throwOnError: true,
    });

    const { data: placeData, isLoading: isPlaceLoading, isError: isPlaceError, error: placeError } = useQuery({
        queryKey: ["place", placeId],
        queryFn: () => fetchPlace(placeId),
        enabled: isAdding,
        throwOnError: true,
    });

    const { data: eventData, isLoading: isEventLoading, isError: isEventError, error: eventError } = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => fetchTripEvent({ tripId, eventId }),
        enabled: isEditing,
        throwOnError: true,
    });

    const currentUser = useAuthStore(state => state.user);
    const isOwner = !!tripData && currentUser?.uid === tripData.ownerId;

    useEffect(() => {
        if (isAdding && tripData && !isOwner) {
            toast.error("Only the trip owner can add events.");
            navigate(`/trips/${tripId}`);
        }
    }, [isAdding, isOwner, tripData, tripId, navigate]);

    const addMutation = useMutation({
        mutationFn: addTripEvent,
        onMutate: async ({ tripId, event }) => {
            await queryClient.cancelQueries({ queryKey: ["events", { tripId }] });
            const previousEvents = queryClient.getQueryData<TripEvent[]>(["events", { tripId }]) || [];
            const tempId = "optimistic-" + Date.now()
            const optimisticEvent: TripEvent = {
                ...event,
                id: tempId,
                optimistic: true,
            };

            toast.success("Event added!", { id: `event-${tempId}-add` });

            queryClient.setQueryData(["events", { tripId }], [...previousEvents, optimisticEvent]);

            navigate(`/trips/${tripId}`);
            return { previousEvents, tempId };
        },
        onError: (_err, { tripId }, context) => {
            if (context?.previousEvents) {
                queryClient.setQueryData(["events", { tripId }], context.previousEvents);
            }
            toast.error("Failed to add event", { id: `event-${context?.tempId}-add` });
        },
        onSuccess: (docId, { tripId, event }, context) => {
            // Remove optimistic event, add the real one (with true id)
            const events = queryClient.getQueryData<TripEvent[]>(["events", { tripId }]) || [];
            const filtered = events.filter(ev => ev.id !== context.tempId);
            queryClient.setQueryData(["events", { tripId }], [
                ...filtered,
                { ...event, id: docId }
            ]);
        },
        onSettled: (_data, _error, { tripId }) => {
            queryClient.invalidateQueries({ queryKey: ["events", { tripId }] });
        },
    });

    const editMutation = useMutation({
        mutationFn: updateTripEvent,
        onMutate: async ({ tripId, eventId, event }) => {
            toast.success("Event updated", { id: `event-${eventId}-update` });

            await queryClient.cancelQueries({ queryKey: ["events", { tripId }] });
            const previousEvents = queryClient.getQueryData<TripEvent[]>(["events", { tripId }]);
            const newEvents = previousEvents ? [...previousEvents] : [];

            // Find the event to update
            const idx = newEvents.findIndex(ev => ev.id === eventId);

            if (idx === -1) {
                throw new Error("Cannot optimistically update: event is missing from cache.");
            }

            // Replace with new data
            newEvents[idx] = { ...newEvents[idx], ...event };
            queryClient.setQueryData(["events", { tripId }], newEvents);

            return { previousEvents };
        },
        onError: (_err, { tripId }, context) => {
            if (context?.previousEvents) {
                queryClient.setQueryData(["events", { tripId }], context.previousEvents);
            }
            toast.error("Failed to update event", { id: `event-${eventId}-update` });
        },
        onSettled: (_data, _error, { tripId }) => {
            queryClient.invalidateQueries({ queryKey: ["events", { tripId }] });
        },
    });

    useEffect(() => {
        if (isEditing && eventData) {
            rangeDispatch({
                type: "RESET",
                state: {
                    mode: "idle",
                    range: { from: eventData.from, to: eventData.to }
                }
            });
        } else if (isAdding && tripData && placeData) {
            if (!tripData.startDate) return;
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
    }, [eventData, tripData, placeData, isAdding, isEditing, dayNumber]);

    if (isTripLoading || isPlaceLoading || isEventLoading) {
        return <UniversalLoader label="Loading event..." fullscreen />;
    }
    if (isTripError || isPlaceError || isEventError)
        return <p>{tripError?.message || placeError?.message || eventError?.message}</p>;

    if (!tripData) throw new Error("No trip found.");
    if (!tripData.startDate || !tripData.endDate) throw new Error("Trip date range not set.")

    function handleSaveOrAdd() {
        const { from, to } = rangeState.range;
        if (!from || !to) {
            toast.error("Please select a valid time range.");
            return;
        }

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
        else if (eventId && eventData) {
            editMutation.mutate({
                tripId,
                eventId,
                event: {
                    from: from,
                    to: to,
                }
            });
            navigate(`/trips/${tripId}`);
        }
    }

    // Shared page layout: max-w, centered, paddings
    return (
        <div className="min-h-screen bg-white w-full mx-auto max-w-screen-xl flex flex-col items-center md:px-10 md:pt-6 lg:px-20">
            {/* Main content is centered, not full width on desktop */}
            <div className="relative w-full flex flex-col">
                {/* Top nav */}
                <TripNavigation mode="event" showShareButton={!!eventId} />

                {/* Image */}
                {isEditing && eventData && (
                    <TripImage mode="event" imageUrl={eventData.img} />
                )}
                {isAdding && placeData && (
                    <TripImage mode="event" imageUrl={placeData.img} />
                )}

                {/* Main content */}
                <div className="flex flex-col gap-6 py-6 w-full px-6 md:px-0">
                    {/* Header */}
                    {isEditing && eventData && (() => {
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
                            <>
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
                                    isOwner={isOwner}
                                />
                                {isOwner && (
                                    <EventFormActionButton
                                        onClick={handleSaveOrAdd}
                                        label="Save"
                                        disabled={!(rangeState.range.from && rangeState.range.to)}
                                    />
                                )}
                                <MapWidget mode="place" place={placeForMap} />
                            </>
                        );
                    })()}

                    {isAdding && placeData && tripData && (() => {
                        const day = Number(dayNumber);
                        const addingDate = getTripDayDateObj(tripData.startDate, day);
                        const formattedDate = dayjs(addingDate).format("MMM D");
                        const formattedDayDate = `Day ${day}, ${formattedDate}`;

                        return (
                            <>
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
                                    isOwner={isOwner}
                                />
                                {isOwner && (
                                    <EventFormActionButton
                                        onClick={handleSaveOrAdd}
                                        label="Add"
                                        disabled={!(rangeState.range.from && rangeState.range.to)}
                                    />
                                )}
                                <MapWidget mode="place" place={placeData} />
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
