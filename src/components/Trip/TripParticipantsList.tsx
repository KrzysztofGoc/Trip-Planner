import { Participant } from "@/types/participant";
import TripParticipantsOwner from "./TripParticipantsOwner";
import TripParticipantsDialog from "./TripParticipantsDialog";

interface TripParticipantsListProps {
  participants: Participant[];
  ownerId: string;
  tripId: string | undefined;
  isOwner: boolean;
}

export default function TripParticipantsList({ participants, ownerId, tripId, isOwner }: TripParticipantsListProps) {
  return (
    <div className="size-auto border-b-2 border-gray-200 pb-4">
      <div className="w-auto flex flex-col gap-8">

        {/* Hosted By Section */}
        <TripParticipantsOwner ownerId={ownerId} />

        {/* Participants Section with Dialog Trigger */}
        <TripParticipantsDialog participants={participants} tripId={tripId} isOwner={isOwner} ownerId={ownerId}/>
      </div>
    </div>
  );
}
