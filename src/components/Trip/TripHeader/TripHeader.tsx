import TripDestinationEditor from "./TripDestinationEditor";
import TripNameEditor from "./TripNameEditor";
import dayjs from "dayjs";

type TripHeaderProps =
  | {
      mode: "event";
      name: string | null | undefined;
      destination: string | null | undefined;
      formattedDate: string;
    }
  | {
      mode: "trip";
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

  // Dates & Labels
  let formattedDate = "";
  let displayName = "";
  let displayDestination = "";

  if (isTrip) {
    if (props.startDate && props.endDate) {
      formattedDate = `${dayjs(props.startDate).format("MMM D, YYYY")} – ${dayjs(props.endDate).format("MMM D, YYYY")}`;
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
    <div className="flex flex-col gap-1 w-full">
      <p className="text-xs md:text-sm text-gray-400 font-medium tracking-wide">
        {formattedDate}
      </p>

      {isEditable ? (
        <>
          <TripNameEditor name={props.name} tripId={props.tripId} />
          <TripDestinationEditor destination={props.destination} tripId={props.tripId} />
        </>
      ) : (
        <>
          <h1 className="-ml-[3px] text-3xl font-bold break-words">
            {displayName}
          </h1>
          <p className="-ml-[1px] text-base text-gray-500 font-normal break-words">
            {displayDestination}
          </p>
        </>
      )}
    </div>
  );
}
