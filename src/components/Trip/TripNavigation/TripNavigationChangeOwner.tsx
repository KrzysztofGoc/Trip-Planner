import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { transferTripOwnership } from "@/api/trips";
import { Participant } from "@/types/participant";
import { Trip } from "@/types/trip";
import { queryClient } from "@/api/queryClient";

type TripNavigationChangeOwnerProps = {
    tripId: string | undefined;
    participants: Participant[];
    ownerId: string;
};

export default function TripNavigationChangeOwner({ tripId, participants, ownerId }: TripNavigationChangeOwnerProps) {
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

    const { mutate: mutateOwnership, isPending } = useMutation({
        mutationFn: transferTripOwnership,
        onMutate: async ({ tripId, selectedUserId }) => {
            toast.success("Ownership updated", { id: "trip-owner-update" });
            await queryClient.cancelQueries({ queryKey: ["trips", { tripId }] });

            const previousTripData = queryClient.getQueryData<Trip>(["trips", { tripId }]);
            if (!previousTripData) throw new Error("Trip data missing from cache");

            if (!selectedUserId) throw new Error("No user selected for ownership transfer");

            // Optimistically update ownerId in the cache
            const updatedTripData: Trip = { ...previousTripData, ownerId: selectedUserId };
            queryClient.setQueryData(["trips", { tripId }], updatedTripData);

            return { previousTripData };
        },

        onError: (_error, _data, context) => {
            toast.error("Failed to transfer ownership", { id: "trip-owner-update" });

            // Rollback to previous trip data
            if (context?.previousTripData) {
                queryClient.setQueryData(["trips", { tripId: context.previousTripData.id }], context.previousTripData);
            }
        },

        onSettled: (_data, _error, { tripId }) => {
            // Always refetch to sync with backend
            queryClient.invalidateQueries({ queryKey: ["trips", { tripId }] });
        }
    });

    // Only allow users who are not already the owner
    const eligibleParticipants = participants.filter(
        (p) => p.uid !== ownerId
    );

    function handleOnOpenChange(open: boolean) {
        setOpen(open);
        if (!open) {
            setSelectedUserId(undefined);
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                className="w-full h-12 text-black border-none shadow-none flex items-center gap-2 justify-start"
                onClick={() => setOpen(true)}
            >
                <User2 className="size-5" /> Change owner
            </Button>
            <AlertDialog open={open} onOpenChange={handleOnOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change trip owner</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select the new owner for this trip:
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2 mt-2">
                        {eligibleParticipants.length === 0 ? (
                            <div className="text-sm text-gray-500 italic text-center">No other participants to transfer ownership.</div>
                        ) : (
                            eligibleParticipants.map((p) => (
                                <button
                                    key={p.uid}
                                    onClick={() => setSelectedUserId(p.uid)}
                                    disabled={isPending}
                                    className={`
                    flex items-center gap-2 border rounded p-2 transition
                    ${selectedUserId === p.uid ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}
                    hover:border-red-300
                  `}
                                    type="button"
                                >
                                    <Avatar className="size-8 border">
                                        <AvatarImage src={p.photoURL || undefined} />
                                        <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 text-left">{p.displayName}</span>
                                    {selectedUserId === p.uid && <Check className="size-5 text-red-400" />}
                                </button>
                            ))
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-12 bg-transparent shadow-none border-none text-black rounded-lg">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 bg-red-500 text-white"
                            disabled={!selectedUserId || isPending}
                            onClick={() => mutateOwnership({ tripId: tripId, selectedUserId: selectedUserId })}
                        >
                            {isPending ? "Transferring..." : "Change owner"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
