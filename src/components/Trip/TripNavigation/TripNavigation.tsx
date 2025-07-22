import { ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';
import TripLeaveDialog from './TripNavigationLeaveDialog';
import TripPopoverMenu from './TripNavigationPopoverMenu';
import { Participant } from '@/types/participant';
import { useAuthStore } from '@/state/useAuthStore';
import { useParams } from 'react-router-dom';
import { TripShareDialog } from './TripShareDialog';
import { useState } from 'react';

type TripNavigationProps = {
    mode: "trip"
    isOwner: boolean,
    tripId: string | undefined,
    participants: Participant[];
    ownerId: string;
    showShareButton?: boolean;
} | {
    mode: "event"
    showShareButton?: boolean;
};

export default function TripNavigation(props: TripNavigationProps) {
    const currentUser = useAuthStore(s => s.user);
    const [shareOpen, setShareOpen] = useState(false);

    const isTrip = props.mode === "trip";
    let isParticipant = false;

    if (isTrip) {
        isParticipant = !!props.participants.find(p => p.uid === currentUser?.uid);
    }

    // For event pages, get params
    const params = useParams();
    let backLink = "/trips"; // fallback

    if (params.tripId && params.dayNumber && params.placeId) {
        // Currently adding an event at a place
        backLink = `/trips/${params.tripId}/${params.dayNumber}/add`;
    } else if (params.tripId && params.dayNumber) {
        // In the places search page for that day
        backLink = `/trips/${params.tripId}`;
    } else if (params.tripId && params.eventId) {
        // Editing an event
        backLink = `/trips/${params.tripId}`;
    } else if (props.mode === "trip" && props.tripId) {
        backLink = `/trips`;
    }

    const showShareButton = props.showShareButton !== false; // default true unless explicitly false

    return (
        <div className="absolute z-50 w-full pt-4 md:pt-6 md:px-4 lg:px-6 flex justify-between">
            {/* Back Button */}
            <Link to={backLink} className="size-12 flex justify-center items-center pl-3">
                <div className="size-10 aspect-square flex justify-center items-center 
                bg-black/40 hover:bg-black/70 backdrop-blur-[2px] 
                rounded-full transition">
                    <ChevronLeft className="size-6 text-white" />
                </div>
            </Link>

            {/* Share and Role-Based Actions */}
            <div className="flex gap-2 w-fit pr-3">
                {showShareButton && (
                    <>
                        <Button
                            className="size-12 flex justify-center items-center bg-transparent shadow-none hover:bg-transparent"
                            onClick={() => setShareOpen(true)}
                        >
                            <div className="size-10 aspect-square flex justify-center items-center bg-black/40 hover:bg-black/70 backdrop-blur-[2px] rounded-full transition"> {/* Darker backdrop for contrast */}
                                <Share2 className="size-5.5 -ml-0.5 text-white" />
                            </div>
                        </Button>
                        <TripShareDialog open={shareOpen} onOpenChange={setShareOpen} mode={isTrip ? "trip" : "event"} />
                    </>
                )}
                {isTrip && (
                    !props.isOwner ? (
                        // Participant: Leave Trip button
                        isParticipant && (<TripLeaveDialog tripId={props.tripId} />)
                    ) : (
                        // Owner: Menu
                        <TripPopoverMenu tripId={props.tripId} participants={props.participants} ownerId={props.ownerId} />
                    )
                )}
            </div>
        </div>
    );
}