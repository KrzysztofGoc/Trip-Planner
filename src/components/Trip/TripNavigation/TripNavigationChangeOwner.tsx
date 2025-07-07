import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogAction, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { User2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
// import your mutation fn here
import { transferTripOwnership } from "@/api/trips";

type TripNavigationChangeOwnerProps = {
    tripId: string | undefined;
};

export default function TripNavigationChangeOwner({ tripId }: TripNavigationChangeOwnerProps) {
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

    const participants = [];

    const { mutate, isPending } = useMutation({
        mutationFn: () => {
            if (!selectedUserId) throw new Error("No new owner selected");
            return transferTripOwnership(tripId, selectedUserId);
        },
        onSuccess: () => {
            toast.success("Ownership transferred");
            setOpen(false);
        },
        onError: () => toast.error("Failed to transfer ownership"),
    });

    return (
        <>
            <Button
                variant="ghost"
                className="w-full h-12 text-black border-none shadow-none flex items-center gap-2 justify-start"
                onClick={() => setOpen(true)}
            >
                <User2 className="size-5" /> Change owner
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change trip owner</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select the new owner for this trip:
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2 mt-2">
                        {participants.map(p => (
                            <Button
                                key={p.id}
                                variant={selectedUserId === p.id ? "default" : "outline"}
                                onClick={() => setSelectedUserId(p.id)}
                                className="w-full"
                                disabled={isPending}
                            >
                                {p.name}
                            </Button>
                        ))}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-12 bg-transparent shadow-none border-none text-black rounded-lg">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 bg-red-500 text-white"
                            disabled={!selectedUserId || isPending}
                            onClick={() => mutate()}
                        >
                            {isPending ? "Transferring..." : "Change owner"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
