import TripDestinationEditor from "./TripDestinationEditor";
import TripNameEditor from "./TripNameEditor";
import dayjs from "dayjs";

// Define a union type for props based on mode
type TripHeaderProps =
  | { mode: 'event'; name: string; destination: string; formattedDate: string }
  | { mode: 'trip'; name: string; destination: string; startDate: Date; endDate: Date; tripId: string | undefined; isOwner: boolean; };

export default function TripHeader(props: TripHeaderProps) {
  const isTrip = props.mode === "trip";
  const isEvent = props.mode === "event";

  const isEditable = isTrip && props.isOwner;

  let formattedDate = "";
  if (isTrip) {
    formattedDate = `${dayjs(props.startDate).format("MMM D, YYYY")} - ${dayjs(props.endDate).format("MMM D, YYYY")}`;
  }
  if (isEvent) {
    formattedDate = props.formattedDate;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-gray-400">{formattedDate}</p>

      {isEditable && (
        <>
          {/* Editable mode - Name and Destination Editors */}
          <TripNameEditor name={props.name} tripId={props.tripId} />
          <TripDestinationEditor destination={props.destination} tripId={props.tripId} />
        </>
      )}
      {!isEditable && (
        <>
          {/* Display mode - Static Name and Destination */}
          <h1 className="-ml-[3px] text-3xl font-bold py-1 border-1 border-transparent break-all">
            {props.name}
          </h1>
          <p className="-ml-[1px] text-base text-gray-500 py-1">{props.destination}</p>
        </>
      )}
    </div>
  );
}
