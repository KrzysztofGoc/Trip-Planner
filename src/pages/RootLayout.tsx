import { Outlet } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";
import WarningMessage from "@/components/WarningMessage";

export default function RootLayout() {
    return (
        <>
            <WarningMessage />
            <MainNavigation />
            <Outlet />
        </>
    )
}