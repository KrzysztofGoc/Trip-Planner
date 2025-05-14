import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateTripDestination } from "@/api/trips";
import { toast } from "sonner";
import { Input } from "../../ui/input";
import { Pencil } from "lucide-react";
import TripNameEditor from "./TripHeaderNameEditor";

interface TripHeaderProps {
  name: string;
  destination: string;
  formattedDate: string | undefined;
  tripId: string | undefined;
}

export default function TripHeader({
  name,
  destination,
  formattedDate,
  tripId,
}: TripHeaderProps) {
  const [localDestination, setLocalDestination] = useState(destination);
  const [editingField, setEditingField] = useState<"destination" | null>(null);

  const { mutate: mutateDestination } = useMutation({
    mutationFn: updateTripDestination,
    onMutate: () =>
      toast.loading("Updating trip destination", { id: "trip-destination-update" }),
    onSuccess: () =>
      toast.success("Trip destination updated", { id: "trip-destination-update" }),
    onError: () =>
      toast.error("Failed to update destination", { id: "trip-destination-update" }),
  });

  function commitDestinationChange() {
    if (localDestination !== destination) {
      mutateDestination({ tripId, destination: localDestination });
    } else {
      setEditingField(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {formattedDate && <p className="text-sm text-gray-400">{formattedDate}</p>}

      {/* Trip Name Editor */}
      <TripNameEditor name={name} tripId={tripId} />

      {/* Destination Inline Editor */}
      <div
        className="relative group flex items-center gap-2 cursor-text w-fit"
        onClick={() => setEditingField("destination")}
      >
        {editingField === "destination" ? (
          <Input
            value={localDestination}
            onChange={(e) => setLocalDestination(e.target.value)}
            onBlur={commitDestinationChange}
            autoFocus
            className="-ml-[13px] text-base font-normal text-gray-500 h-auto py-1 border-1 border-gray-300 focus-within:border-ring focus-within:ring-3 bg-white dark:bg-gray-900 rounded-md"
          />
        ) : (
          <>
            <p className="-ml-[1px] text-base text-gray-500 py-1 border-1 border-transparent">
              {localDestination}
            </p>
            <Pencil className="size-4 text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </div>
    </div>
  );
}
