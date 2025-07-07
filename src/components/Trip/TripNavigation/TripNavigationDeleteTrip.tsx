import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogAction, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
// import your mutation fn here
import { deleteTrip } from "@/api/trips";
import { useNavigate } from "react-router-dom";

type TripNavigationDeleteTripProps = {
    tripId: string | undefined;
};

export default function TripNavigationDeleteTrip({ tripId }: TripNavigationDeleteTripProps) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const { mutate, isPending } = useMutation({
        mutationFn: deleteTrip,
        onSuccess: () => {
            toast.success("Trip deleted");
            setOpen(false);
            navigate("/trips");
        },
        onError: () => toast.error("Failed to delete trip"),
    });

    return (
        <>
            <Button
                variant="destructive"
                className="w-full h-12 flex items-center gap-2 justify-start"
                onClick={() => setOpen(true)}
                disabled={isPending}
            >
                <Trash2 className="size-5" /> Delete trip
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                            Delete trip?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="font-bold">This cannot be undone.</span> All trip data will be lost for all participants.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-12 bg-transparent shadow-none border-none text-black rounded-lg">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 bg-red-500 text-white"
                            onClick={() => mutate({ tripId })}
                            disabled={isPending}
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
