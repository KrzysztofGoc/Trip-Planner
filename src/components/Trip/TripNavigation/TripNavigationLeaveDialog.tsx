import {
    AlertDialog,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogFooter,
    AlertDialogHeader
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/state/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { removeParticipantFromTrip } from "@/api/trips";
import { queryClient } from "@/api/queryClient";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trip } from "@/types/trip";

type TripLeaveDialogProps = {
    tripId: string | undefined;
};

export default function TripLeaveDialog({ tripId }: TripLeaveDialogProps) {
    const [open, setOpen] = useState(false);
    const currentUser = useAuthStore(s => s.user);
    const navigate = useNavigate();

    const { mutate: leaveTrip, isPending } = useMutation({
        mutationFn: () => removeParticipantFromTrip({ tripId, uid: currentUser?.uid }),
        onMutate: async () => {
            if (!currentUser) throw new Error("No user found");

            toast.success("Left the trip", { id: "leave-trip" });

            // Optimistically remove this trip from user's trips list cache
            await queryClient.cancelQueries({ queryKey: ["trips", currentUser.uid] });
            const previousTrips = queryClient.getQueryData<Trip[]>(["trips", currentUser.uid]);
            if (!previousTrips) throw new Error("Cannot optimistically update: no trips found in cache");

            // Remove the trip from the cache
            queryClient.setQueryData(
                ["trips", currentUser?.uid],
                previousTrips.filter(t => t.id !== tripId)
            );

            navigate("/trips");

            return { previousTrips };
        },
        onError: (_err, _vars, ctx) => {
            toast.error("Failed to leave trip", { id: "leave-trip" });
            // Rollback
            if (ctx?.previousTrips) {
                queryClient.setQueryData(["trips", currentUser?.uid], ctx.previousTrips);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["trips", currentUser?.uid] });
        },
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="size-12 flex justify-center items-center bg-transparent shadow-none hover:bg-transparent">
                    <div className="size-10 aspect-square flex justify-center items-center bg-black/40 hover:bg-black/70 backdrop-blur-[2px] rounded-full">
                        <LogOut className="size-6 text-white" />
                    </div>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                        Leave trip?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to leave this trip? <span className="font-bold">You'll lose access to it.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className="h-12 bg-transparent shadow-none transition border-none text-black rounded-lg">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="h-12 bg-red-500 hover:bg-red-600 transition text-white"
                        onClick={() => leaveTrip()}
                        disabled={isPending}
                    >
                        {isPending ? "Leaving..." : "Leave"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
