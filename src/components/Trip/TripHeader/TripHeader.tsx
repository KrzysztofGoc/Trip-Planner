import TripDestinationEditor from "./TripDestinationEditor";
import TripNameEditor from "./TripNameEditor";
import dayjs from "dayjs";

// Define a union type for props based on mode
type TripHeaderProps =
  | {
    mode: 'event';
    name: string | null | undefined;
    destination: string | null | undefined;
    formattedDate: string
  }
  | {
    mode: 'trip';
    name: string | null;
    destination: string | null;
    startDate: Date | null;
    endDate: Date | null;
    tripId: string | undefined;
    isOwner: boolean;
  };

export default function TripHeader(props: TripHeaderProps) {
  const isTrip = props.mode === "trip";
  const isEvent = props.mode === "event";

  const isEditable = isTrip && props.isOwner;

  // Handle nulls in formatted date
  let formattedDate = "";
  let displayName = "";
  let displayDestination = "";


  if (isTrip) {
    if (props.startDate && props.endDate) {
      formattedDate = `${dayjs(props.startDate).format("MMM D, YYYY")} - ${dayjs(props.endDate).format("MMM D, YYYY")}`;
    } else {
      formattedDate = "(No date range set)";
    }

    displayName = props.name || "(No trip name set)";
    displayDestination = props.destination || "(No trip destination set)";
  }

  if (isEvent) {
    formattedDate = props.formattedDate || "Event date not found";

    displayName = props.name || "Event name not found";
    displayDestination = props.destination || "Event destination not found";
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-gray-400">{formattedDate}</p>
      {isEditable ? (
        <>
          {/* Editable mode - Name and Destination Editors */}
          <TripNameEditor name={props.name} tripId={props.tripId} />
          <TripDestinationEditor destination={props.destination} tripId={props.tripId} />
        </>
      ) : (
        <>
          {/* Display mode - Static Name and Destination */}
          <h1 className="-ml-[3px] text-3xl font-bold py-1 border-1 border-transparent break-all">
            {displayName}
          </h1>
          <p className="-ml-[1px] text-base text-gray-500 py-1">
            {displayDestination}
          </p>
        </>
      )}
    </div>
  );
}
