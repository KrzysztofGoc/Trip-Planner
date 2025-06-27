import { Button } from "./ui/button";

interface ActionButtonProps {
    onClick: () => void;
    label: string;
    disabled: boolean,
}

export default function EventFormActionButton({ onClick, label, disabled }: ActionButtonProps) {
    return (
        <Button onClick={onClick} className="w-auto h-14 bg-red-400 text-white rounded-lg" disabled={disabled}>
            {label}
        </Button>
    );
}