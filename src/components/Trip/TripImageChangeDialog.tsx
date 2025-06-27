import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { updateTripImage } from "@/api/trips";
import { IMAGE_PRESETS } from "@/constants/tripImages";
import { queryClient } from "@/api/queryClient";
import { Trip } from "@/types/trip";

interface TripImageChangeDialogProps {
  open: boolean;
  onClose: () => void;
  tripId: string | undefined;
}

export default function TripImageChangeDialog({ open, onClose, tripId }: TripImageChangeDialogProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const { mutate: updateImage, isPending } = useMutation({
    mutationFn: updateTripImage,

    // Optimistic update
    onMutate: async () => {
      toast.success("Trip image updated", { id: "update-trip-image" });

      // Cancel ongoing trip queries
      await queryClient.cancelQueries({ queryKey: ["trips", { tripId }] });

      // Snapshot previous data
      const previousTripData = queryClient.getQueryData<Trip>(["trips", { tripId }]);
      if (!previousTripData) {
        throw new Error("Cannot optimistically update: trip data is missing from cache");
      }

      // Optimistically update image in cache
      queryClient.setQueryData(["trips", { tripId }], {
        ...previousTripData,
        image: selectedUrl,
      });

      // Pass snapshot for rollback
      return { previousTripData };
    },

    // Rollback on error
    onError: (_err, _data, context) => {
      toast.error("Failed to update image", { id: "update-trip-image" });

      const previousTripData = context?.previousTripData;
      if (previousTripData) {
        queryClient.setQueryData(["trips", { tripId }], previousTripData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", { tripId }] });
    },
  });

  function handleUpdateImage() {
    updateImage({ tripId: tripId, imageUrl: selectedUrl });
    setSelectedUrl(null)
    onClose();
  }

  function handleCancel() {
    setSelectedUrl(null)
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Trip Image</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 overflow-auto">
          {IMAGE_PRESETS.map(({ key, label, url }) => (
            <button
              key={key}
              onClick={() => setSelectedUrl(url)}
              className={`border-2  ${selectedUrl === url ? "border-red-400" : "border-transparent"}`}
            >
              <img src={url} alt={label} className="object-cover size-full" />
            </button>
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isPending}
            className="h-12 bg-transparent shadow-none border-none text-black rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateImage}
            disabled={!selectedUrl || isPending}
            className="w-auto h-12 bg-red-400 text-white rounded-lg"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
