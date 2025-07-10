import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Trip } from "@/types/trip";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

interface TripCardProps {
    trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
    const navigate = useNavigate();

    function handleCardClick() {
        navigate(`/trips/${trip.id}`)
    }

    return (
        <Card onClick={handleCardClick} className="border-none shadow-none p-0 cursor-pointer gap-4">
            <CardHeader className="p-0">
                <img className="rounded-xl aspect-square object-cover" src={trip.image || "/trip_default_thumbnail_image.png"} />
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-1">
                <CardTitle>
                    {trip.destination}
                </CardTitle>
                <CardDescription className="flex flex-col gap-3">
                    {dayjs(trip.startDate).format("MMMM D, YYYY")}
                    <p>{trip.name}</p>
                </CardDescription>
            </CardContent>
        </Card>
    );
}