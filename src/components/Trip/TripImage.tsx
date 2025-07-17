import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "../ui/button";
import TripImageChangeDialog from "./TripImageChangeDialog";

type TripImageProps =
  | { mode: 'event'; imageUrl: string | null | undefined }  // Display mode
  | { mode: 'trip'; imageUrl: string | null; tripId: string | undefined, isOwner: boolean };

export default function TripImage(props: TripImageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Only editable if we're in "trip" mode and user is the owner
  const isEditable = props.mode === "trip" && "isOwner" in props && props.isOwner;

  // Determine which image to show
  const getImageSrc = () => {
    if (imageError || !props.imageUrl) {
      return props.mode === "event" ? "/place_default_image.png" : "/trip_default_image.png";
    }
    return props.imageUrl;
  };

  return (
    <div className="relative w-auto">
      <img
        className="object-cover size-full max-h-96"
        src={getImageSrc()}
        alt={props.imageUrl ? "Trip Cover" : "No trip image set"}
        onError={() => setImageError(true)}
      />

      {isEditable && (
        <>
          <Button
            size={null}
            className="absolute bottom-3 right-3 text-white shadow-none bg-black/30 backdrop-blur-md rounded-lg flex gap-2 items-center px-4 py-2"
            onClick={() => setDialogOpen(true)}
          >
            <Camera className="size-6 text-inherit" />
            <span className="text-sm font-medium">Change photo</span>
          </Button>

          <TripImageChangeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} tripId={props.tripId} />
        </>
      )}
    </div>
  );
}