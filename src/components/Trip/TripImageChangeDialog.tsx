import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { updateTripImage } from "@/api/trips";
import { IMAGE_PRESETS } from "@/constants/tripImages";
import { queryClient } from "@/api/queryClient";

interface TripImageChangeDialogProps {
  open: boolean;
  onClose: () => void;
  tripId: string | undefined;
}

export default function TripImageChangeDialog({ open, onClose, tripId }: TripImageChangeDialogProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const { mutate: updateImage, isPending } = useMutation({
    mutationFn: () => updateTripImage({ tripId, imageUrl: selectedUrl }),
    onError: () => toast.error("Failed to update image", { id: "update-trip-image" }),
    onSuccess: () => {
      toast.success("Image updated", { id: "update-trip-image" });
      queryClient.invalidateQueries({ queryKey: ["trips", { tripId: tripId }] });
      setSelectedUrl(null);
      onClose();
    },
  });

  function handleImageClick({ url }: { url: string }) {
    setSelectedUrl(url);
  }

  function handleUpdateImage() {
    updateImage();
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
              onClick={() => handleImageClick({ url: url })}
              className={`border-2  ${selectedUrl === url ? "border-red-400" : "border-transparent"}`}
            >
              <img src={url} alt={label} className="object-cover size-full" />
            </button>
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
            className="w-auto h-12 bg-gray-100 text-red-400 shadow-md rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateImage}
            disabled={!selectedUrl || isPending}
            className="w-auto h-12 bg-red-400 text-white shadow-md rounded-lg"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
