import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { 
  LayoutDashboard, BookOpen, Users, 
  DollarSign, LogOut, GraduationCap, X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout, user } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
      isActive 
        ? 'bg-indigo-50 text-indigo-700 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`;


  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r h-screen flex flex-col transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:relative md:translate-x-0
  `;

  return (
    <>
      {/* Overlay Oscuro (Solo en móvil cuando está abierto) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden "
          onClick={onClose}
        ></div>
      )}

      <aside className={sidebarClasses}>
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <span className="font-bold text-gray-800 text-lg">EduManager</span>
          </div>
          {/* Botón Cerrar (Solo móvil) */}
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <NavLink to="/" className={navClass} onClick={onClose}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/programs" className={navClass} onClick={onClose}>
            <BookOpen size={20} />
            <span>Programas</span>
          </NavLink>
          <NavLink to="/teachers" className={navClass} onClick={onClose}>
            <GraduationCap size={20} />
            <span>Profesores</span>
          </NavLink>
          <NavLink to="/classrooms" className={navClass} onClick={onClose}>
            <Users size={20} />
            <span>Aulas</span>
          </NavLink>
          <NavLink to="/students" className={navClass} onClick={onClose}>
            <Users size={20} />
            <span>Estudiantes</span>
          </NavLink>
          <NavLink to="/groups" className={navClass} onClick={onClose}>
            <BookOpen size={20} />
            <span>Grupos</span>
          </NavLink>
          <NavLink to="/finances" className={navClass} onClick={onClose}>
            <DollarSign size={20} />
            <span>Finanzas</span>
          </NavLink>
          <NavLink to="/reports" className={navClass} onClick={onClose}>
            <BookOpen size={20} />
            <span>Reportes</span>
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
    </>
  );
};