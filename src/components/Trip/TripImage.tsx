interface TripImageProps {
    imageUrl: string;
}

export default function TripImage({ imageUrl }: TripImageProps) {
    return (
        <div className="w-auto h-1/3">
            <img className="object-cover size-full" src={imageUrl} />
        </div>
    );
}