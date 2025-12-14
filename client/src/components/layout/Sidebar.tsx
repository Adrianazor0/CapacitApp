import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { 
    LayoutDashboard, BookOpen, Users,
    DollarSign, LogOut, GraduationCap
} from "lucide-react";

export const Sidebar = () => {
    const { logout, user } = useAuth();
    
    const navClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
            isActive 
            ? "bg-indigo-50 text-indigo-700 font-medium" 
            : "text-gray-600 hover:bg-gray-50"
        }`;

    return (
        <aside className="w-64 bg-white h-screen border-r p-6 flex flex-col sticky top-0">
            <div className="p-6 border-b flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-full text-white">
                    <GraduationCap size={24} />
                </div>
                <span className="font-bold text-gray-800 text-lg font-sans">CapacitManager</span>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <NavLink to="/" className={navClass}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/programs" className={navClass}>
                    <BookOpen size={20} />
                    <span>Programas</span>
                </NavLink>
                <NavLink to="/students" className={navClass}>
                    <Users size={20} />
                    <span>Estudiantes</span>
                </NavLink>
                <NavLink to="/teachers" className={navClass}>
                    <Users size={20} />
                    <span>Profesores</span>
                </NavLink>
                <NavLink to="/groups" className={navClass}>
                <BookOpen size={20} />
                    <span>Grupos</span>
                </NavLink>
                <NavLink to="/classrooms" className={navClass}>
                    <LayoutDashboard size={20} />
                    <span>Aulas</span>
                </NavLink>
                <NavLink to="/finances" className={navClass}>
                    <DollarSign size={20} />
                    <span>Finanzas</span>
                </NavLink>

            </nav>

            <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {user?.username.substring(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-700 truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 text-red-600 text-sm hover:bg-red-50 p-2 rounded transition"
                >
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}