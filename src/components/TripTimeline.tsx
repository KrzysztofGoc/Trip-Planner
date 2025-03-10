import TimelineContent from "./Timeline/TimelineContent";
import TimelineDay from "./Timeline/TimelineDay";
import TimelineHeader from "./Timeline/TimelineHeader";

const DAY_ONE_EVENTS = [
    { id: "1", from: "11:00", to: "12:00", destination: "Hyotan Sakura Park" },
    { id: "2", from: "12:00", to: "13:00", destination: "Lake Kawaguchi" }
]

export default function TripTimeline() {
    return (
        <div className="flex flex-col gap-8">
            {/* Day 1 */}
            <TimelineDay>
                <TimelineHeader dayNumber={1} dayDate="Jul 20" />
                <TimelineContent events={DAY_ONE_EVENTS} />
            </TimelineDay>
            {/* Day 1 */}
            <TimelineDay>
                <TimelineHeader dayNumber={2} dayDate="Jul 21" />
                <TimelineContent events={DAY_ONE_EVENTS} />
            </TimelineDay>

        </div>
    );
}