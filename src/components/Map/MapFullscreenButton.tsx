import { MapControl, ControlPosition } from "@vis.gl/react-google-maps";
import { Maximize, Minimize } from 'lucide-react';
import { useState } from "react";

interface MapFullscreenButtonProps {
    onMaximize: () => void,
    onMinimize: () => void,
}


export default function MapFullscreenButton({ onMaximize, onMinimize }: MapFullscreenButtonProps) {
    const [isMaximized, setIsMaximized] = useState(false)

    const Icon = isMaximized ? Minimize : Maximize;

    function handleClick() {
        if (isMaximized) {
            setIsMaximized(false)
            onMinimize()
        } else {
            setIsMaximized(true)
            onMaximize()
        }
    }

    return (
        <MapControl position={ControlPosition.TOP_RIGHT}>
            <button onClick={handleClick} className="bg-white rounded-sm p-2 shadow-sm m-2.5">
                <Icon className="text-red-400 stroke-2" />
            </button>
        </MapControl>
    );
}