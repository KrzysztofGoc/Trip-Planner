import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogAction, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteTrip } from "@/api/trips";
import { useNavigate } from "react-router-dom";
import { Trip } from "@/types/trip";
import { useAuthStore } from "@/state/useAuthStore";
import { queryClient } from "@/api/queryClient";

type TripNavigationDeleteTripProps = {
    tripId: string | undefined;
};

export default function TripNavigationDeleteTrip({ tripId }: TripNavigationDeleteTripProps) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const { mutate, isPending } = useMutation({
        mutationFn: deleteTrip,

        // Optimistic update:
        onMutate: async ({ tripId }) => {
            if (!user) throw new Error("No user found");

            toast.success("Trip deleted", { id: "trip-delete" });

            // Cancel any ongoing trips queries
            await queryClient.cancelQueries({ queryKey: ["trips", user?.uid] });
            // Snapshot previous value
            const previousTrips = queryClient.getQueryData<Trip[]>(["trips", user?.uid]);
            if (!previousTrips) throw new Error("Cannot optimistically update: trips not found in cache")

            // Optimistically remove trip from cache
            queryClient.setQueryData(
                ["trips", user.uid],
                previousTrips.filter(trip => trip.id !== tripId)
            );

            navigate("/trips");

            return { previousTrips };
        },
        // Rollback if error:
        onError: (_err, _vars, context) => {
            toast.error("Failed to delete trip", { id: "trip-delete" });

            if (context?.previousTrips) {
                queryClient.setQueryData(["trips", user?.uid], context.previousTrips);
            }
        },
        // Always refetch just in case
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["trips", user?.uid] });
        },
    });

    return (
        <>
            <Button
                className="w-full h-12 flex items-center gap-2 justify-start transition bg-red-500 hover:bg-red-600"
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
                        <AlertDialogCancel className="h-12 bg-transparent shadow-none border-none text-black rounded-lg transition">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 transition bg-red-500 text-white hover:bg-red-600"
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
