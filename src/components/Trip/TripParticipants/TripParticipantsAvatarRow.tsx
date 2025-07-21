import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Participant } from "@/types/participant";
import { AnimatePresence, motion } from "framer-motion";

type TripParticipantsAvatarRowProps = {
    participants: Participant[];
    containerWidth: number;
};

const AVATAR_SIZE = 48;
const AVATAR_GAP = 24;

const avatarAnim = {
    initial: { opacity: 0, y: -24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.32, type: "spring", bounce: 0.13 } },
    exit: { opacity: 0, y: -24, transition: { duration: 0.32 } },
};

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
            <AnimatePresence initial={false}>
                {visibleParticipants.map((participant) => (
                    <motion.div
                        key={participant.uid}
                        variants={avatarAnim}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                    >
                        <Avatar className="size-12 border-2 border-gray-300 shadow-md">
                            <AvatarImage src={participant.photoURL || undefined} alt={participant.displayName} />
                            <AvatarFallback>{participant.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </motion.div>
                ))}

                {overflow > 0 && (
                    <motion.div
                        key="overflow"
                        variants={avatarAnim}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                    >
                        <Avatar className="size-12 border-2 border-gray-300 shadow-md bg-gray-300">
                            <AvatarFallback className="bg-gray-300">+{overflow}</AvatarFallback>
                        </Avatar>
                    </motion.div>
                )}

            </AnimatePresence>
            {participants.length === 0 && (
                <span className="text-xs text-gray-400">No participants yet</span>
            )}
        </div>
    );
}
