import { MapControl, ControlPosition } from "@vis.gl/react-google-maps";
import { X, LoaderCircle } from "lucide-react";
import { MapStatusEnum } from "@/types/mapStatus";

interface MapStatusMessageProps {
  text: string;
  type: MapStatusEnum;
}

export default function MapStatusMessage({ text, type }: MapStatusMessageProps) {
  const iconMap = {
    [MapStatusEnum.Loading]: LoaderCircle,
    [MapStatusEnum.Error]: X,
  };

  const Icon = iconMap[type];
  const iconClasses = `size-6 text-red-400 stroke-3 ${type === MapStatusEnum.Loading ? 'animate-spin' : ''}`;

  return (
    <MapControl position={ControlPosition.CENTER}>
      <div className="bg-white rounded p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Icon className={iconClasses} />
          <p className="font-medium text-lg">{text}</p>
        </div>
      </div>
    </MapControl>
  );
}