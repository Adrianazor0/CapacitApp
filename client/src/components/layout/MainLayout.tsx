import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <Outlet />
            </main>
        </div>
    );
}