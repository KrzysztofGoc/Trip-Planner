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
    onOpenChange: (open: boolean) => void;
};

export function TripShareDialog({ open, onOpenChange }: TripShareDialogProps) {
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-400">
                        Share this trip
                    </DialogTitle>
                    <DialogDescription>
                        Anyone with this link can view your trip details.
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
                            className="h-12 bg-transparent shadow-none border-none text-black rounded-lg"
                        >
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleCopy}
                        className="h-12 bg-red-400 text-white flex gap-2 items-center rounded-lg hover:bg-red-500 transition"
                    >
                        <Copy className="size-5" />
                        {copied ? "Copied!" : "Copy link"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
