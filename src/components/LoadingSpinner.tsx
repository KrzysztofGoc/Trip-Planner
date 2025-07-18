// src/components/UniversalLoader.tsx
import { LoaderCircle } from "lucide-react";

export default function UniversalLoader({
  label = "Loading...",
  fullscreen = false,
}: {
  label?: string;
  fullscreen?: boolean;
}) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90"
          : "flex flex-col items-center justify-center w-full h-full py-12"
      }
    >
      <LoaderCircle className="w-12 h-12 text-red-400 animate-spin mb-3" />
      <span className="text-gray-500 text-lg">{label}</span>
    </div>
  );
}
