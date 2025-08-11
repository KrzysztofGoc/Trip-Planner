import { useState, useEffect } from "react";
import TripDateRangeEditor from "./TripDateRangeEditor";
import TripDateRangePreview from "./TripDateRangePreview";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";

type TripDateRangeProps = {
    startDate: Date | null;
    endDate: Date | null;
    tripId: string | undefined;
    isOwner: boolean;
};

const buttonVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.65 } },
    exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
};

export default function TripDateRange({ startDate, endDate, tripId, isOwner }: TripDateRangeProps) {
    const [editing, setEditing] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>(startDate && endDate ? { from: startDate, to: endDate } : undefined);

    useEffect(() => {
        setRange(startDate && endDate ? { from: startDate, to: endDate } : undefined);
    }, [startDate, endDate]);

    const formattedStartDate = range?.from ? dayjs(range.from).format("MMM D, YYYY") : "Not selected";
    const formattedEndDate = range?.to ? dayjs(range.to).format("MMM D, YYYY") : "Not selected";

    return (
        <div
            className={`flex flex-col items-center justify-center border-1 border-gray-200 gap-2 px-6 pt-6 rounded-lg shadow-md ${!isOwner && "pb-8"}`}
        >
            <TripDateRangePreview formattedStart={formattedStartDate} formattedEnd={formattedEndDate} />

            <AnimatePresence initial={false}>
                {isOwner && editing && (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, y: -32, height: 0, }}
                        animate={{
                            opacity: 1, y: 0, height: "auto", paddingBottom: 24,
                            transition: {
                                height: { delay: 0.07, duration: 0.3 },

                                y: { delay: 0.35, duration: 0.3 },
                                opacity: { delay: 0.35, duration: 0.3 },
                                paddingBottom: { delay: 0.35, duration: 0.3 }
                            }
                        }}
                        exit={{
                            opacity: 0, y: 32, height: 0, paddingBottom: 0,
                            transition: {
                                y: { duration: 0.3 },
                                opacity: { duration: 0.3 },
                                paddingBottom: { duration: 0.3 },

                                height: { delay: 0.35, duration: 0.3 },
                            }
                        }}
                        className="w-fit"
                    >
                        <TripDateRangeEditor
                            startDate={startDate}
                            endDate={endDate}
                            tripId={tripId}
                            onClose={() => setEditing(false)}
                            range={range}
                            setRange={setRange}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {/* Only show ChevronDown when NOT editing */}
                {isOwner && !editing && (
                    <motion.button
                        key="chevron-button"
                        aria-label="Open calendar"
                        className="w-full h-12 flex justify-center items-center cursor-pointer"
                        onClick={() => setEditing(true)}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={buttonVariants}
                        style={{ background: "none", border: "none" }}
                    >
                        <motion.span
                            whileHover={{
                                scale: 1.18,
                                y: 8,
                                transition: { type: "spring", stiffness: 340, damping: 13 }
                            }}
                            whileTap={{
                                scale: 0.93,
                                y: 10,
                                transition: { type: "tween", duration: 0.16 }
                            }}
                            className="size-full flex items-center justify-center"
                        >
                            <ChevronDown className="text-red-400" />
                        </motion.span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
