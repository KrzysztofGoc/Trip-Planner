import { useMutation } from "@tanstack/react-query";
import { DateRange, DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateTripDateRange } from "@/api/trips"; // Import the Firebase-based update function
import { queryClient } from "@/api/queryClient"; // For cache updates

interface TripDateRangeEditorProps {
    startDate: Date;
    endDate: Date;
    tripId: string | undefined;
    onClose: () => void;
    range: DateRange | undefined,
    setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>,
}

export default function TripDateRangeEditor({ startDate, endDate, tripId, onClose, range, setRange }: TripDateRangeEditorProps) {

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
        updateDateRange({
            tripId: tripId,
            startDate: range?.from,
            endDate: range?.to,
        });
        onClose();
    };

    function handleCancel() {
        setRange({
            from: startDate,
            to: endDate,
        });
        onClose();
    }

    return (
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
    );
}
