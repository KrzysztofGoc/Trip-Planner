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
                cursor-pointer
                ${selected
                    ? "bg-red-400 text-white border-red-400 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"}
            `}
        >
            {children}
        </button>
    );
}