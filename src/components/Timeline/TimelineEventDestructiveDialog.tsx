// ConfirmDeleteDialog.tsx
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

interface TimelineEventDestructiveDialogProps {
    open: boolean;
    eventName: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export function TimelineEventDestructiveDialog({ open, eventName, onCancel, onConfirm, }: TimelineEventDestructiveDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                        Delete event?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <span className="font-bold">{eventName}</span>? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="h-12 bg-transparent shadow-none border-none text-black rounded-lg"
                        onClick={onCancel}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="h-12 bg-red-500 text-white"
                        onClick={onConfirm}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
