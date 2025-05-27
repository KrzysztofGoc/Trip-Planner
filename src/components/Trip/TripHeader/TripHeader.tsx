import TripDestinationEditor from "./TripDestinationEditor";
import TripNameEditor from "./TripNameEditor";
import dayjs from "dayjs";

interface TripHeaderProps {
  name: string;
  destination: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  tripId: string | undefined;
}

export default function TripHeader({ name, destination, startDate, endDate, tripId }: TripHeaderProps) {
  const formattedDate = `${dayjs(startDate).format("MMM D, YYYY")} - ${dayjs(endDate).format("MMM D, YYYY")}`;

  return (
    <div className="flex flex-col gap-1">
      {formattedDate && (<p className="text-sm text-gray-400">{formattedDate}</p>)}

      <TripNameEditor name={name} tripId={tripId} />
      <TripDestinationEditor destination={destination} tripId={tripId} />
    </div>
  );
}
