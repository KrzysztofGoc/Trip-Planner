import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type TripShareDialogProps = {
    open: boolean;
    mode: "trip" | "event";
    onOpenChange: (open: boolean) => void;
};

export function TripShareDialog({ open, mode, onOpenChange }: TripShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = String(window.location);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 1000);
        } catch {
            toast.error("Could not copy link.");
        }
    };

    const isTrip = mode === "trip";
    const title = isTrip ? "Share this trip" : "Share this event";
    const description = isTrip
        ? "Anyone with this link can view your trip details."
        : "Anyone with this link can view this event’s details in the trip.";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-400">
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="flex items-center h-12 gap-2 bg-gray-100 rounded px-2 py-1 my-2 w-full max-w-full min-w-0"
                >
                    <span
                        className="truncate select-all font-mono text-gray-800 text-sm flex-1 min-w-0 max-w-full"
                        title={shareUrl}
                    >
                        {shareUrl}
                    </span>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            className="h-12 bg-transparent shadow-none border-none text-black rounded-lg transition"
                        >
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleCopy}
                        className="h-12 bg-red-400 text-white rounded-lg hover:bg-red-500 transition"
                    >
                        <Copy className="size-5" />
                        {copied ? "Copied!" : "Copy link"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
