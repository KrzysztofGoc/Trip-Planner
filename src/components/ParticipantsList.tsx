import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export default function ParticipantsList({ participants }) {
    const maxVisible = 4; // Show up to 4 participants
    const extraCount = participants.length - maxVisible;

    return (
        <div className="w-auto flex flex-col gap-8">
            {/* Hosted By Section */}
            <div className="flex items-center gap-4">
                {/* Host Avatar */}
                <Avatar className="size-16 border-2 border-gray-300 shadow-md">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                {/* Host Details */}
                <div className="flex flex-col justify-center">
                    <p className="text-lg font-semibold">
                        Hosted by Kasey Terrell <span className="font-normal text-gray-500">(you)</span>
                    </p>
                    <p className="text-sm text-gray-400">
                        0 trips together
                    </p>
                </div>
            </div>

            {/* Participants Section */}
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Users className="size-6 w-15.5" />
                    <p className="text-lg font-semibold">Participants</p>
                </div>

                {/* Participants Avatars */}
                <div className="flex items-center gap-3 justify-evenly">
                    {participants.slice(0, maxVisible).map((participant) => (
                        <Avatar
                            key={participant.id}
                            className="size-12 border-2 border-gray-300 shadow-md"
                        >
                            <AvatarImage src={participant.image} alt={participant.name} />
                            <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                    ))}

                    {/* Show "+X" if there are more participants */}
                    {extraCount > 0 && (
                        <div
                            className="size-12 aspect-square flex items-center justify-center bg-gray-300 text-gray-700 text-sm font-semibold rounded-full border-2 border-gray-300 shadow-md"
                        >
                            +{extraCount}
                        </div>
                    )}
                </div>
            </div>



        </div>
    );
}