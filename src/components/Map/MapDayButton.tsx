type MapDayButtonProps = {
    selected: boolean;
    children: React.ReactNode;
    onClick: () => void;
}

export default function MapDayButton({ selected, children, onClick }: MapDayButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                px-4 py-1.5 rounded-lg
                text-sm font-semibold transition
                shadow-sm border
                ${selected
                    ? "bg-red-400 text-white border-red-400 shadow-md"
                    : "bg-white text-gray-700 border-gray-300"}
                focus:outline-none focus:ring-2 focus:ring-red-400
            `}
        >
            {children}
        </button>
    );
}