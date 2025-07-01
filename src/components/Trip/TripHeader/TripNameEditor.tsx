import { useState, useEffect } from "react";
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
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(name);

  // Keep inputValue in sync if prop changes while not editing
  useEffect(() => {
    if (!editing) setInputValue(name);
  }, [name]);

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

      // Pass previous state to onError for potential rollback
      return { previousTripData };
    },

    onError: (_error, _data, context) => {
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
    const newName = inputValue.trim();

    if (newName !== name) {
      if (isValidTripName(newName)) {
        mutateName({ tripId, name: newName });
        setEditing(false);
      } else {
        toast.error("Trip name must be between 3-100 characters");
        setInputValue(name);
        setEditing(false);
      }
    } else {
      setEditing(false);
    }
  }

  return (
    <div className="group flex items-center gap-2" onClick={() => setEditing(true)}>
      {editing ? (
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onBlur={commitChange}
          autoFocus
          className="-ml-[15px] text-3xl font-bold h-auto border-1 border-gray-300 focus-within:border-ring focus-within:ring-3"
          onKeyDown={e => {
            if (e.key === "Enter") {
              commitChange();
            } else if (e.key === "Escape") {
              setInputValue(name);
              setEditing(false);
            }
          }}
        />
      ) : (
        <>
          <h1 className="-ml-[3px] text-3xl font-bold py-1 border-1 border-transparent break-all">
            {inputValue}
          </h1>
          <Pencil className="shrink-0 size-5 text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </div>
  );
}




