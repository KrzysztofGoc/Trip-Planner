import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Participant } from "@/types/participant";

type TripParticipantsAvatarRowProps = {
    participants: Participant[];
    containerWidth: number;
};

const AVATAR_SIZE = 48;
const AVATAR_GAP = 24;

export default function TripParticipantsAvatarRow({ participants, containerWidth }: TripParticipantsAvatarRowProps) {
    const maxVisible = Math.max(
        1,
        Math.floor((containerWidth + AVATAR_GAP) / (AVATAR_SIZE + AVATAR_GAP))
    );

    const visibleParticipants =
        participants.length > maxVisible
            ? participants.slice(0, maxVisible - 1)
            : participants;
    const overflow = participants.length - visibleParticipants.length;

    return (
        <div className="flex items-center gap-6 transition w-auto">
            {visibleParticipants.map((participant) => (
                <Avatar
                    key={participant.uid}
                    className="size-12 border-2 border-gray-300 shadow-md"
                >
                    <AvatarImage src={participant.photoURL || undefined} alt={participant.displayName} />
                    <AvatarFallback>{participant.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
            ))}
            {overflow > 0 && (
                <Avatar className="size-12 border-2 border-gray-300 shadow-md bg-gray-300">
                    <AvatarFallback className="bg-gray-300">+{overflow}</AvatarFallback>
                </Avatar>
            )}
            {participants.length === 0 && (
                <span className="text-xs text-gray-400">No participants yet</span>
            )}
        </div>
    );
}
