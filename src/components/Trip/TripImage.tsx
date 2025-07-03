import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "../ui/button";
import TripImageChangeDialog from "./TripImageChangeDialog";

type TripImageProps =
  | { mode: 'event'; imageUrl: string | null }  // Display mode
  | { mode: 'trip'; imageUrl: string | null; tripId: string | undefined, isOwner: boolean }; // Editable mode requires `tripId`

export default function TripImage(props: TripImageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Only editable if we're in "trip" mode and user is the owner
  const isEditable = props.mode === "trip" && "isOwner" in props && props.isOwner;

  return (
    <div className="relative w-auto h-1/3">
      <img
        className="object-cover size-full"
        src={props.imageUrl || "https://images.unsplash.com/photo-1626009374423-9ece0284f2af"}
        alt="Trip Cover"
      />

      {isEditable && (
        <>
          <Button
            size={null}
            className="absolute bottom-3 right-3 text-white shadow-none bg-white/20 backdrop-blur-md rounded-lg flex gap-2 items-center px-4 py-2"
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
};

