import { PropsWithChildren } from "react";

export default function TimelineDay({ children }: PropsWithChildren) {
    return (
        <div className="size-auto flex flex-col gap-4">
            {children}
        </div>
    );
}