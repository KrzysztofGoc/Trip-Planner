import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Trip } from "@/api/trips";
import dayjs from "dayjs";

interface TripCardProps {
    trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
    return (
        <Card className="border-none shadow-none p-0 cursor-pointer gap-4">
            <CardHeader className="p-0">
                <img className="rounded-xl aspect-square object-cover" src={trip.image} />
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-1">
                <CardTitle>
                    {trip.destination}
                </CardTitle>
                <CardDescription className="flex flex-col gap-3">
                    {dayjs(trip.date).format("MMMM D, YYYY")}
                    <p>{trip.name}</p>
                </CardDescription>
            </CardContent>
        </Card>
    );
}