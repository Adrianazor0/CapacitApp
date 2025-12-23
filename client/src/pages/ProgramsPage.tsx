import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  getProgramsRequest, createProgramRequest, 
  updateProgramRequest, deleteProgramRequest 
} from '../api/programs';
// Tipos
import type { Program } from '../types';
import { Modal } from '../components/ui/Modal';
// Iconos combinados
import { 
  Plus, Save, Edit2, 
  Trash2, RotateCcw, BookOpen, 
  Search, CheckCircle, 
  XCircle, Tag, DollarSign 
} from 'lucide-react';

export const ProgramsPage = () => {
  // --- ESTADOS ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Program>();

  // --- LÓGICA DE DATOS (REAL) ---
  const loadPrograms = async () => {
    try {
      const res = await getProgramsRequest();
      setPrograms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrograms(); }, []);

  // --- MANEJADORES DEL MODAL ---
  const openCreateModal = () => {
    setEditingProgram(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (prog: Program) => {
    setEditingProgram(prog);
    setValue("code", prog.code);
    setValue("name", prog.name);
    setValue("type", prog.type);
    setValue("level", prog.level);
    setValue("cost", prog.cost);
    setValue("paymentType", prog.paymentType);
    setValue("description", prog.description);
    setIsModalOpen(true);
  };

  // --- ACCIONES (REALES) ---
  const handleToggleStatus = async (id: string) => {
    if (!confirm("¿Seguro que deseas cambiar el estado de este programa?")) return;
    try {
      await deleteProgramRequest(id);
      loadPrograms();
    } catch (error) {
      alert("Error al cambiar estado");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingProgram) {
        await updateProgramRequest(editingProgram._id, data);
      } else {
        await createProgramRequest(data);
      }
      setIsModalOpen(false);
      reset();
      loadPrograms();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al guardar";
      alert(`Error: ${msg}`);
    }
  });

  // Filtrado de datos para el buscador
  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos para las estadísticas (Basados en datos reales)
  const activeProgramsCount = programs.filter(p => p.isActive).length;
  const inactiveProgramsCount = programs.length - activeProgramsCount;

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando catálogo...</div>;

  return (
    <div className="animate-fade-in-up space-y-8 ">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Oferta Académica</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Administra cursos, niveles y precios</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} />
          Nuevo Programa
        </button>
      </div>

      {/* --- STATS SUMMARY (Calculados con datos reales) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Programas</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{programs.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Activos</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeProgramsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Inactivos</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{inactiveProgramsCount}</p>
          </div>
        </div>
      </div>

      {/* --- FILTERS & SEARCH --- */}
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre, nivel o código..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE SECTION (Layout Renovado) --- */}
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-5 font-semibold">Programa</th>
                <th className="p-5 font-semibold">Código / Tipo</th>
                <th className="p-5 font-semibold">Costo / Pago</th>
                <th className="p-5 font-semibold">Estado</th>
                <th className="p-5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPrograms.map((program) => (
                <tr 
                  key={program._id} 
                  className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-default"
                >
                  <td className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${program.isActive ? 'bg-indigo-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base">{program.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{program.level}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-mono">
                        <Tag size={14} className="text-gray-400" />
                        <span>{program.code || 'S/C'}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{program.type}</span>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-1 font-bold text-gray-800 dark:text-gray-200">
                          <DollarSign size={14} className="text-gray-400" />
                          {program.cost}
                       </div>
                       <span className="text-xs text-gray-500 capitalize">{program.paymentType}</span>
                    </div>
                  </td>

                  <td className="p-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${program.isActive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {program.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(program)}
                        className="p-2 bg-indigo-600  text-gray-200 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-gray-200 dark:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      
                      <button 
                        onClick={() => handleToggleStatus(program._id)}
                        className={`p-2 transition rounded-lg ${program.isActive ? ' bg-indigo-600 text-gray-200 hover:text-red-500 hover:bg-red-50 dark:text-indigo-600 dark:bg-gray-200 dark:hover:bg-red-900/30 dark:hover:text-red-400' : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-400'}`}
                        title={program.isActive ? "Desactivar" : "Activar"}
                      >
                         {program.isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredPrograms.length === 0 && !loading && (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron programas que coincidan con tu búsqueda.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL PARA CREAR/EDITAR (Mantenido) --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? `Editar: ${editingProgram.name}` : "Crear Nuevo Programa"}
      >
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Fila 1 */}
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">CÓDIGO</label>
                <input 
                  {...register("code", {required:true})} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase transition-colors" 
                  placeholder="Ej. DEV-01" 
                />
                {errors.code && <span className="text-red-500 text-xs mt-1">Requerido</span>}
             </div>
             <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">NOMBRE DEL PROGRAMA</label>
                <input 
                  {...register("name", {required:true})} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                  placeholder="Ej. React Avanzado" 
                />
                {errors.name && <span className="text-red-500 text-xs mt-1">Requerido</span>}
             </div>
          </div>

          {/* Fila 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">TIPO</label>
              <select {...register("type")} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors">
                <option value="Curso">Curso</option>
                <option value="Diplomado">Diplomado</option>
                <option value="Taller">Taller</option>
                <option value="Seminario">Seminario</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">NIVEL</label>
              <select {...register("level")} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors">
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          {/* Fila 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">COSTO ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">$</span>
                <input 
                  type="number" 
                  {...register("cost", {required:true, min:0})} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 pl-7 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
              </div>
              {errors.cost && <span className="text-red-500 text-xs mt-1">Requerido</span>}
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">PAGO</label>
                <select {...register("paymentType")} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors">
                  <option value="unico">Pago Único</option>
                  <option value="cuotas">Por Cuotas</option>
                </select>
             </div>
          </div>

          {/* Fila 4 */}
          <div>
             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">DESCRIPCIÓN / TEMARIO</label>
             <textarea 
               {...register("description")} 
               className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
               placeholder="Describe brevemente el contenido del programa..."
             ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Save size={20} /> {editingProgram ? "Actualizar Programa" : "Guardar Programa"}
          </button>
        </form>
      </Modal>
    </div>
  );
};