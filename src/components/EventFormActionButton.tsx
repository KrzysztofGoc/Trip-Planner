import { Button } from "./ui/button";

interface ActionButtonProps {
    onClick: () => void;
    label: string;
}

export default function EventFormActionButton({ onClick, label }: ActionButtonProps) {
    return (
        <Button onClick={onClick} className="w-auto h-14 bg-red-400 text-white rounded-lg">
            {label}
        </Button>
    );
}