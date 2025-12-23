import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, GraduationCap } from 'lucide-react';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* 1. Sidebar Responsivo */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col w-screen md:w-full min-w-0">
        
        {/* 2. Header Móvil (Solo visible en pantallas pequeñas) */}
        <header className="bg-white border-b p-4 flex items-center justify-between md:hidden sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-1.5 rounded text-white">
                <GraduationCap size={20} />
             </div>
             <span className="font-bold text-gray-800">EduManager</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* 3. Contenido Principal */}
        <main className="flex-1 p-4 md:w-[calc(100vw-17rem)] w-full overflow-x-hidden dark:bg-gray-800 dark:border-gray-700 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};