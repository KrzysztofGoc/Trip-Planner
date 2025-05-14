import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateTripName } from "@/api/trips";
import { queryClient } from "@/api/queryClient";
import { Trip } from "@/types/trip";
import { isValidTripName } from "@/lib/validations/trip";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

interface TripNameEditorProps {
  name: string;
  tripId: string | undefined;
}

export default function TripNameEditor({ name, tripId }: TripNameEditorProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);

  const { mutate: mutateName } = useMutation({
    mutationFn: updateTripName,

    onMutate: async ({ name }) => {
      // Immediately confirm (optimistic) update
      toast.success("Trip name updated", { id: "trip-name-update" });

      // Cancel any ongoing trip queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ["trips", { tripId }] });

      // Snapshot previous trip data for rollback if needed
      const previousTripData = queryClient.getQueryData<Trip>(["trips", { tripId }]);

      // Cancel mutation if trip data not in cache
      if (!previousTripData) {
        throw new Error("Cannot optimistically update: trip data is missing from cache");
      }

      // Optimistically update trip name in cache
      const updatedTripData = { ...previousTripData, name };
      queryClient.setQueryData(["trips", { tripId }], updatedTripData);

      // Exit editing mode after local cache has been updated to not flash previous, not-updated name
      setEditing(false);

      // Pass previous state to onError for potential rollback
      return { previousTripData };
    },

    onError: (_error, _data, context) => {
      // Show error feedback
      toast.error("Failed to update name", { id: "trip-name-update" });

      // Rollback trip name in cache
      const previousTripData = context?.previousTripData;
      if (previousTripData) {
        queryClient.setQueryData(["trips", { tripId }], previousTripData);
      }
    },

    // Ensure data is synced with server regardless of outcome
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", { tripId }] });
    },
  });

  function commitChange() {
    const newName = nameInputRef.current?.value?.trim();

    // Validate and check if changed
    if (newName && newName !== name) {
      if (isValidTripName(newName)) {
        // Don't immediately exit editing to not flash the previous not updated name in cache
        mutateName({ tripId, name: newName });
      } else {
        toast.error("Trip name must be between 3-100 characters");
        setEditing(false);
      }
    } else {
      // If text didn't change, exit editing mode
      setEditing(false);
    }
  }

  return (
    <div className="group flex items-center gap-2" onClick={() => setEditing(true)}>
      {editing ? (
        <Input
          ref={nameInputRef}
          defaultValue={name}
          onBlur={commitChange}
          autoFocus
          className="-ml-[15px] text-3xl font-bold h-auto border-1 border-gray-300 focus-within:border-ring focus-within:ring-3"
        />
      ) : (
        <>
          <h1 className="-ml-[3px] text-3xl font-bold py-1 border-1 border-transparent break-all">
            {name}
          </h1>
          <Pencil className="shrink-0 size-5 text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </div>
  );
}
