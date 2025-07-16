import { Outlet } from "react-router-dom";
import WarningMessage from "@/components/WarningMessage";

export default function RootLayout() {
    return (
        <>
            <WarningMessage />
            <Outlet />
        </>
    )
}