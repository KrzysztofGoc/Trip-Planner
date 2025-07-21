// --- TimePickerWheel.tsx ---
import Picker from "react-mobile-picker";
import { TimePickerColumn } from "./TimePickerColumn";

type TimePickerWheelProps = {
    label: string;
    value: { hour: string; minute: string };
    onChange: (next: { hour: string; minute: string }) => void;
    hours: string[];
    minutes: string[];
    blockedHours?: Set<string>;
    blockedMinutes?: Set<string>;
    itemHeight?: number;
};

export function TimePickerWheel({
    label,
    value,
    onChange,
    hours,
    minutes,
    blockedHours = new Set(),
    blockedMinutes = new Set(),
    itemHeight = 48,
}: TimePickerWheelProps) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</span>
            <div className="flex items-center justify-center relative">
                <Picker
                    value={{ hour: value.hour }}
                    onChange={obj => {
                        onChange({ ...value, hour: obj.hour });
                    }}
                    itemHeight={itemHeight}
                    wheelMode="natural"
                >
                    <TimePickerColumn name="hour" values={hours} disabled={[...blockedHours]} />
                </Picker>
                <span className="mx-1 text-xl font-semibold select-none pointer-events-none">
                    :
                </span>
                <Picker
                    value={{ minute: value.minute }}
                    onChange={obj => {
                        onChange({ ...value, minute: obj.minute });
                    }}
                    itemHeight={itemHeight}
                    wheelMode="natural"
                >
                    <TimePickerColumn name="minute" values={minutes} disabled={[...blockedMinutes]} />
                </Picker>
            </div>
        </div>
    );
}