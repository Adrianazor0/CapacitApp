import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { ThemeToggle } from '../ui/ThemeToggle'; 
import { 
  LayoutDashboard, BookOpen, Users, 
  DollarSign, LogOut, GraduationCap, X,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;     
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { logout, user } = useAuth();

  // Clases para los enlaces
  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 font-medium ${
      isActive 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
    }`;

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 h-screen flex flex-col transition-transform duration-300 ease-in-out
    bg-white border-r border-gray-200 
    dark:bg-gray-900 dark:border-gray-800
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:sticky md:top-0 md:translate-x-0
  `;

  return (
    <>
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <GraduationCap size={24} />
            </div>
            <span className="font-bold text-gray-800 text-lg dark:text-white tracking-tight">CapacitManager</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-red-500 transition">
              <X size={24} />
            </button>
          )}
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1">
            <NavLink to="/" className={navClass} onClick={onClose}>
                <LayoutDashboard size={20} /> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/programs" className={navClass} onClick={onClose}>
                <BookOpen size={20} /> <span>Programas</span>
            </NavLink>
            <NavLink to="/teachers" className={navClass} onClick={onClose}>
                <GraduationCap size={20} /> <span>Profesores</span>
            </NavLink>
            <NavLink to="/classrooms" className={navClass} onClick={onClose}>
                <Users size={20} /> <span>Aulas</span>
            </NavLink>
            <NavLink to="/students" className={navClass} onClick={onClose}>
                <Users size={20} /> <span>Estudiantes</span>
            </NavLink>
            <NavLink to="/groups" className={navClass} onClick={onClose}>
                <BookOpen size={20} /> <span>Grupos</span>
            </NavLink>
            <NavLink to="/finances" className={navClass} onClick={onClose}>
                <DollarSign size={20} /> <span>Finanzas</span>
            </NavLink>
            <NavLink to="/reports" className={navClass} onClick={onClose}>
                <FileText size={20} /> <span>Reportes</span>
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          
          <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
             <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase text-sm shrink-0 dark:bg-indigo-900 dark:text-indigo-300">
                  {user?.username.substring(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-700 truncate dark:text-gray-200">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{user?.role}</p>
                </div>
             </div>
             {/* Toggle integrado en la tarjeta de usuario */}
             <ThemeToggle />
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium p-2.5 rounded-xl transition-all duration-200
            bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200
            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-900/30"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};