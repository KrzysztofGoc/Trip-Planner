import TripDestinationEditor from "./TripDestinationEditor";
import TripNameEditor from "./TripNameEditor";

interface TripHeaderProps {
  name: string;
  destination: string;
  formattedDate: string | undefined;
  tripId: string | undefined;
}

export default function TripHeader({ name, destination, formattedDate, tripId }: TripHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      {formattedDate && (<p className="text-sm text-gray-400">{formattedDate}</p>)}

      <TripNameEditor name={name} tripId={tripId} />
      <TripDestinationEditor destination={destination} tripId={tripId} />
    </div>
  );
}
