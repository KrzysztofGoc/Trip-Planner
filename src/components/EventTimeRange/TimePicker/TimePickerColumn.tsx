import Picker from "react-mobile-picker";

// --- TimePickerColumn.tsx ---
type TimePickerColumnProps = {
  name: string;
  values: string[];
  disabled?: string[];
};

export function TimePickerColumn({ name, values, disabled = [] }: TimePickerColumnProps) {
  return (
    <Picker.Column name={name}>
      {values.map(val => (
        <Picker.Item key={val} value={val} >
          {({ selected }: { selected: boolean }) => (
            <div
              className={
                disabled.includes(val)
                  ? "font-light text-sm w-12 text-center text-gray-300 cursor-not-allowed pointer-events-none"
                  : selected
                    ? "font-semibold text-lg w-12 text-center"
                    : "font-light text-sm w-12 text-center"
              }
            >
              {val}
            </div>
          )}
        </Picker.Item>
      ))}
    </Picker.Column>
  );
}
