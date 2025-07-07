import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import TripNavigationDeleteTrip from "./TripNavigationDeleteTrip";
import TripNavigationChangeOwner from "./TripNavigationChangeOwner";
import { Ellipsis } from "lucide-react";
import { Participant } from "@/types/participant";

type TripPopoverMenuProps = {
    tripId: string | undefined;
    participants: Participant[];
    ownerId: string;
};

export default function TripPopoverMenu({ tripId, participants, ownerId }: TripPopoverMenuProps) {
    return (
        <Popover>
            <PopoverTrigger>
                <button
                    className="size-10 flex justify-center items-center bg-white/20 backdrop-blur-md rounded-full shadow border-none"
                    aria-label="Open trip menu"
                >
                    <Ellipsis className="size-6 text-white" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-60 p-1 bg-white border-none shadow-lg"
                sideOffset={8}
            >
                <div className="flex flex-col gap-2 p-2">
                    {/* Label */}
                    <div className="text-sm font-medium text-gray-500 pl-2 ">Trip options</div>
                    {/* Change Owner Button + Dialog */}
                    <TripNavigationChangeOwner tripId={tripId} participants={participants} ownerId={ownerId}/>
                    {/* Divider */}
                    <div className="my-2 h-px bg-black/20" />
                    {/* Delete Trip Button + Dialog */}
                    <TripNavigationDeleteTrip tripId={tripId} />
                </div>
            </PopoverContent>
        </Popover>
    );
}
