import { AlertDialog, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/state/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { removeParticipantFromTrip } from "@/api/trips";
import { queryClient } from "@/api/queryClient";
import { toast } from "sonner";
import { useState } from "react";
import { Participant } from "@/types/participant";
import { useNavigate } from "react-router-dom";

type TripLeaveDialogProps = {
    tripId: string | undefined;
}

export default function TripLeaveDialog({ tripId }: TripLeaveDialogProps) {
    const [open, setOpen] = useState(false);
    const currentUser = useAuthStore(s => s.user);
    const navigate = useNavigate();

    const { mutate: leaveTrip, isPending } = useMutation({
        mutationFn: async () => {
            return removeParticipantFromTrip({ tripId, uid: currentUser?.uid });
        },
        onMutate: async () => {
            toast.success("Left the trip", { id: "leave-trip" });
            navigate("/trips");
            await queryClient.cancelQueries({ queryKey: ["trips", { tripId }, "participants"] });

            // Save old participants
            const previousParticipans = queryClient.getQueryData<Participant[]>(["trips", { tripId }, "participants"]);

            if (!previousParticipans) throw new Error("Partcipants data missing from cache");
            if (!currentUser) throw new Error("Cannot find current user"); // Should never happen

            // Remove yourself optimistically
            queryClient.setQueryData(
                ["trips", { tripId }, "participants"],
                previousParticipans.filter(p => p.uid !== currentUser.uid)
            )

            return { previousParticipans };
        },
        onError: (_err, _vars, ctx) => {
            toast.error("Failed to leave trip", { id: "leave-trip" });
            if (ctx?.previousParticipans) {
                queryClient.setQueryData(["trips", { tripId }, "participants"], ctx.previousParticipans);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["trips", { tripId }, "participants"] });
        },
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="size-12 flex justify-center items-center bg-transparent shadow-none">
                    <div className="size-10 aspect-square flex justify-center items-center bg-white/20 backdrop-blur-md rounded-full">
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
                    <AlertDialogCancel className="h-12 bg-transparent shadow-none border-none text-black rounded-lg">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="h-12 bg-red-500 text-white"
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
