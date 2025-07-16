import { Outlet } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";

export default function NavigationLayout() {
    return (
        <>
            <MainNavigation />
            <Outlet />
        </>
    )
}