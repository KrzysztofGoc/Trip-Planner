import { Triangle, Trash2, LoaderCircle } from "lucide-react";
import PlaceCard from "../PlaceCard";
import { TripEvent } from "@/types/tripEvent";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TimelineEventDestructiveDialog } from "./TimelineEventDestructiveDialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/api/queryClient";
import { deleteTripEvent } from "@/api/events"; // API call for event deletion

interface TimelineEventProps {
    event: TripEvent;
    tripId: string | undefined;
    isOwner: boolean,
}

export default function TimelineEvent({ event, tripId, isOwner }: TimelineEventProps) {
    const isPending = !!event.optimistic;
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // Optimistic delete mutation
    const { mutate: deleteEvent } = useMutation({
        mutationFn: deleteTripEvent,
        onMutate: async ({ tripId, eventId }) => {
            toast.success("Event deleted", { id: `event-${eventId}-delete` });
            await queryClient.cancelQueries({ queryKey: ["events", { tripId }] });
            const previousEvents = queryClient.getQueryData<TripEvent[]>(["events", { tripId }]);
            if (!previousEvents) {
                throw new Error("Cannot optimistically update: events are missing from cache");
            }
            queryClient.setQueryData<TripEvent[]>(
                ["events", { tripId }],
                previousEvents.filter(ev => ev.id !== eventId)
            );
            return { previousEvents };
        },
        onError: (_error, { eventId }, context) => {
            toast.error("Failed to delete event", { id: `event-${eventId}-delete` });
            if (context?.previousEvents) {
                queryClient.setQueryData(["events", { tripId }], context.previousEvents);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["events", { tripId }] });
        },
    });

    // Handle confirmed deletion
    const handleDelete = () => {
        setOpen(false);
        deleteEvent({ tripId: tripId, eventId: event.id });
    };

    return (
        <div className="flex flex-col gap-1 relative">
            {/* Start Time Handle */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{dayjs(event.from).format("HH:mm")}</p>
                <div className="h-0.5 w-full bg-gray-200"></div>
            </div>

            <div className="relative group">
                {/* Overlay if optimistic */}
                {isPending && (
                    <div className="absolute inset-0 z-10 bg-gray-200/60 flex items-center justify-center rounded-lg pointer-events-none">
                        <LoaderCircle className="animate-spin text-gray-400 w-8 h-8" />
                    </div>
                )}
                <PlaceCard
                    event={event}
                    onClick={() => {
                        if (!isPending) navigate(`/trips/${tripId}/edit/${event.id}`);
                    }}
                />
                {/* Only show delete button if isOwner */}
                {isOwner && (
                    <button
                        className="absolute top-1 right-1 size-10 flex items-center justify-center"
                        disabled={isPending}
                        onClick={e => {
                            if (isPending) return;
                            e.stopPropagation();
                            setOpen(true);
                        }}
                        aria-label="Delete event"
                    >
                        <Trash2 className={`size-5 ${isPending ? "text-gray-400" : "text-red-500"} drop-shadow-sm`} />
                    </button>
                )}
            </div>

            {/* End Time Handle */}
            <div className="flex items-center gap-2">
                <Triangle className="size-6 text-red-400 rotate-90" />
                <p className="text-xs font-semibold">{dayjs(event.to).format("HH:mm")}</p>
                <div className="h-0.5 w-full bg-gray-200"></div>
            </div>

            {/* Confirm delete dialog */}
            <TimelineEventDestructiveDialog
                open={open}
                eventName={event.name}
                onCancel={() => setOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
