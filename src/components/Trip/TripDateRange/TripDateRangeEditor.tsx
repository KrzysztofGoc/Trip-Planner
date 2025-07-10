import { useMutation, useQuery } from "@tanstack/react-query";
import { DateRange, DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateTripDateRange } from "@/api/trips";
import { queryClient } from "@/api/queryClient";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { fetchTripEvents } from "@/api/events";
import { TripEvent } from "@/types/tripEvent";
import { TripDateRangeDestructiveDialog } from "./TripDateRangeDestructiveDialog";
import dayjs from "dayjs";

function getOrphanedEvents(events: TripEvent[], newFrom: Date, newTo: Date): TripEvent[] {
    const from = dayjs(newFrom).startOf("day");
    const to = dayjs(newTo).endOf("day");
    return events.filter(ev =>
        dayjs(ev.from).isBefore(from) || dayjs(ev.to).isAfter(to)
    );
}

interface TripDateRangeEditorProps {
    startDate: Date | null;
    endDate: Date | null;
    tripId: string | undefined;
    onClose: () => void;
    range: DateRange | undefined;
    setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export default function TripDateRangeEditor({ startDate, endDate, tripId, onClose, range, setRange }: TripDateRangeEditorProps) {
    const [pendingDialog, setPendingDialog] = useState(false);
    const [orphans, setOrphans] = useState<TripEvent[]>([]);

    const { data: events = [], isLoading: isLoadingEvents } = useQuery({
        queryKey: ["trip-events", tripId],
        queryFn: () => fetchTripEvents({ tripId }),
    });

    // Mutation for updating trip date range
    const { mutate: updateDateRange } = useMutation({
        mutationFn: updateTripDateRange,
        onMutate: async (newDates) => {
            // Optimistically update the cache
            toast.success("Trip date range updated", { id: "trip-date-range-update" });

            // Cancel ongoing queries to prevent overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ["trips", { tripId }] });

            // Snapshot the previous trip data for potential rollback
            const previousTripData = queryClient.getQueryData(["trips", { tripId }]);

            if (!previousTripData) {
                throw new Error("Cannot optimistically update: trip data is missing from cache");
            }

            // Optimistically update the trip date range in the cache
            const updatedTripData = { ...previousTripData, startDate: newDates.startDate, endDate: newDates.endDate };
            queryClient.setQueryData(["trips", { tripId }], updatedTripData);

            return { previousTripData };
        },
        onError: (_error, _newDates, context) => {
            toast.error("Failed to update trip date range", { id: "trip-date-range-update" });

            // Rollback cache on error
            const previousTripData = context?.previousTripData;
            if (previousTripData) {
                queryClient.setQueryData(["trips", { tripId }], previousTripData);
            }
        },
        onSettled: () => {
            // Refetch the trip data to sync with the server
            queryClient.invalidateQueries({ queryKey: ["trips", { tripId }] });
        },
    });

    const handleSave = () => {
        // Should never happen because Save is disabled if range From and To is not set
        if (!range?.from || !range?.to) return;

        const orphanedEvents = getOrphanedEvents(events, range.from, range.to);
        if (orphanedEvents.length > 0) {
            setOrphans(orphanedEvents);
            setPendingDialog(true);
            return;
        } else {
            updateDateRange({
                tripId: tripId,
                startDate: range?.from,
                endDate: range?.to,
            });
            onClose();
        }
    };

    const confirmDestructive = () => {
        setPendingDialog(false);
        updateDateRange({
            tripId: tripId,
            startDate: range?.from,
            endDate: range?.to,
        });
        onClose();
    };

    function handleCancel() {
        setRange(startDate && endDate ? { from: startDate, to: endDate } : undefined);
        onClose();
    }

    return (
        <>
            <TripDateRangeDestructiveDialog
                open={pendingDialog}
                orphans={orphans}
                onCancel={() => setPendingDialog(false)}
                onConfirm={confirmDestructive}
            />

            {isLoadingEvents ? (
                <div className="w-full flex flex-col gap-6 items-center py-12">
                    <LoaderCircle className="size-10 text-red-400 animate-spin" />
                    <span className="text-gray-500 text-sm">Loading available dates...</span>
                </div>
            ) : (
                <>
                    <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={setRange}
                        defaultMonth={range?.from}
                        navLayout="around"
                    />

                    <div className="flex gap-2 w-full">
                        <Button
                            onClick={handleCancel}
                            className="flex-1 h-12 bg-transparent shadow-none text-black rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!range?.from || !range?.to}
                            className="flex-1 h-12 bg-red-400 text-white shadow-md rounded-lg"
                        >
                            Save
                        </Button>
                    </div>
                </>
            )}
        </>
    );
}
