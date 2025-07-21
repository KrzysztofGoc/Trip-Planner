import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { TripEvent } from "@/types/tripEvent";

interface OrphanedEventsDialogProps {
    open: boolean;
    orphans: TripEvent[];
    onCancel: () => void;
    onConfirm: () => void;
}

export function TripDateRangeDestructiveDialog({ open, orphans, onCancel, onConfirm }: OrphanedEventsDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                        {orphans.length} event{orphans.length !== 1 ? "s" : ""} will be deleted
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        The following events are outside the new date range and will be removed permanently:
                        <span className="my-2 flex flex-col items-center gap-1">
                            {orphans.slice(0, 5).map(ev => (
                                <span key={ev.id} className="w-fit">
                                    {ev.name} ({ev.from.toLocaleDateString()})
                                </span>
                            ))}
                            {orphans.length > 5 && (
                                <p className=" text-gray-500">+{orphans.length - 5} more…</p>
                            )}
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={onCancel}
                        className="h-12 bg-transparent shadow-none border-none text-black rounded-lg transition"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="h-12 bg-red-500 text-white transition hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Delete and Save
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
