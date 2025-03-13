interface TripHeaderProps {
    name: string;
    destination: string;
    formattedDate: string;
}

export default function TripHeader({ name, destination, formattedDate }: TripHeaderProps) {
    return (
        <div className="size-auto">
            <p className="text-sm text-gray-400">{formattedDate}</p>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-gray-500">{destination}</p>
        </div>
    );
}
