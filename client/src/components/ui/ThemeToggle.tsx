import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/themeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-300
        text-gray-500 hover:bg-gray-100 hover:text-indigo-600 
        dark:text-yellow-400 dark:hover:bg-gray-700 dark:hover:text-yellow-300"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {/* Animación simple de rotación al cambiar */}
      <div className="transform transition-transform active:rotate-180 duration-500">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </div>
    </button>
  );
};