import { ChevronLeft, SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';
import TripLeaveDialog from './TripNavigationLeaveDialog';
import TripPopoverMenu from './TripNavigationPopoverMenu';

type TripNavigationProps = {
    isOwner: boolean,
    tripId: string | undefined,
}

// You’ll pass isOwner and onLeave/onDelete/onChangeOwner as props:
export default function TripNavigation({ isOwner, tripId }: TripNavigationProps) {
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
                {!isOwner ? (
                    // Leave Trip (Participant)
                    <TripLeaveDialog tripId={tripId} />
                ) : (
                    // Owner: Menu
                    <TripPopoverMenu tripId={tripId} />
                )}
            </div>
        </div>
    );
}
