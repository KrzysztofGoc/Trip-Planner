import { ChevronLeft, SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';
import TripLeaveDialog from './TripNavigationLeaveDialog';
import TripPopoverMenu from './TripNavigationPopoverMenu';
import { Participant } from '@/types/participant';
import { useAuthStore } from '@/state/useAuthStore';

type TripNavigationProps = {
    mode: "trip"
    isOwner: boolean,
    tripId: string | undefined,
    participants: Participant[];
    ownerId: string;
} | {
    mode: "event"
};

// You’ll pass isOwner and onLeave/onDelete/onChangeOwner as props:
export default function TripNavigation(props: TripNavigationProps) {
    const currentUser = useAuthStore(s => s.user);

    const isTrip = props.mode === "trip";
    let isParticipant = false;


    if (isTrip) {
        isParticipant = !!props.participants.find(p => p.uid === currentUser?.uid);
    }

    return (
        <div className="fixed z-50 top-4 left-0 w-full flex justify-between">
            {/* Back Button */}
            <Link to=".." className="size-12 flex justify-center items-center pl-3">
                <div className="size-10 aspect-square flex justify-center items-center bg-white/20 backdrop-blur-md rounded-full">
                    <ChevronLeft className="size-6 text-white" />
                </div>
            </Link>

            {/* Share and Role-Based Actions */}
            <div className="flex gap-2 w-fit pr-3">
                <Button className="size-12 flex justify-center items-center bg-transparent shadow-none">
                    <div className="size-10 aspect-square flex justify-center items-center bg-white/20 backdrop-blur-md rounded-full">
                        <SquareArrowOutUpRight className="size-6 text-white" />
                    </div>
                </Button>
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
