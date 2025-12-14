import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <h1 className="flex h-screen w-screen items-center justify-center"> Cargando...</h1>
    if (!isAuthenticated && !loading) return <Navigate to="/login" replace />;

    return <Outlet />;
};