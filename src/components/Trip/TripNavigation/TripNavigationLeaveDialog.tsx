import { AlertDialog, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type TripLeaveDialogProps = {
    tripId: string | undefined;
}

export default function TripLeaveDialog({ tripId }: TripLeaveDialogProps) {
    return (
        <AlertDialog>
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
                    <AlertDialogAction className="h-12 bg-red-500 text-white">
                        Leave
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}