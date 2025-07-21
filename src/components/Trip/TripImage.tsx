import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "../ui/button";
import TripImageChangeDialog from "./TripImageChangeDialog";
import { AnimatePresence, motion } from "framer-motion";

type TripImageProps =
  | { mode: 'event'; imageUrl: string | null | undefined }
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

  const src = getImageSrc();

  return (
    <div
      className="
        relative w-full
        aspect-[16/9]
        min-h-[260px]
        max-h-[410px]
        rounded-none 
        shadow-none
        md:max-h-[500px]
        md:rounded-3xl
        md:shadow-xl
        overflow-hidden
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={src}
          src={src}
          alt={props.imageUrl ? 'Trip Cover' : 'No trip image set'}
          onError={() => setImageError(true)}
          draggable={false}
          className="object-cover w-full h-full select-none pointer-events-none"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.37, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>
      {isEditable && (
        <>
          <Button
            size={null}
            className="
              absolute bottom-4 right-4 z-10
              flex gap-2 items-center px-4 py-2
              bg-black/40 hover:bg-black/70 backdrop-blur-[2px] transition
              rounded-lg shadow-none
            "
            onClick={() => setDialogOpen(true)}
          >
            <Camera className="size-6" />
            <span>Change photo</span>
          </Button>
          <TripImageChangeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} tripId={(props as any).tripId} />
        </>
      )}
    </div>
  );
}
