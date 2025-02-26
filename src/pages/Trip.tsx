import { useParams } from "react-router-dom";

export default function TripPage() {
    const { tripId } = useParams();

    return (
        <p>Trip {tripId} Page</p>
    );
}