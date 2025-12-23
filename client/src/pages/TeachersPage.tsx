import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  getTeachersRequest, createTeacherRequest, 
  updateTeacherRequest, deleteTeacherRequest 
} from '../api/teachers';
import type { Teacher } from '../types';
import { Modal } from '../components/ui/Modal';
import { 
  Plus, Save, Edit2, Trash2, RotateCcw, 
  Search, Phone, Mail, Briefcase, Award,
} from 'lucide-react';

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Teacher>();

  const loadTeachers = async () => {
    try {
      const res = await getTeachersRequest();
      setTeachers(res.data);
      setFilteredTeachers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeachers(); }, []);

  // Lógica de búsqueda corregida
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = teachers.filter(t => 
      t.name.toLowerCase().includes(term) ||
      t.lastName.toLowerCase().includes(term) ||
      t.speciality.toLowerCase().includes(term) ||
      `${t.name} ${t.lastName}`.toLowerCase().includes(term)
    );
    setFilteredTeachers(results);
  }, [searchTerm, teachers]);

  const openCreateModal = () => {
    setEditingTeacher(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setValue("name", t.name);
    setValue("lastName", t.lastName);
    setValue("documentId", t.documentId);
    setValue("email", t.email);
    setValue("phone", t.phone);
    setValue("speciality", t.speciality);
    setValue("degree", t.degree);
    setValue("address", t.address);
    if (t.hireDate) setValue("hireDate", t.hireDate.split('T')[0]);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    if (!confirm("¿Cambiar estado del profesor?")) return;
    try {
      await deleteTeacherRequest(id);
      loadTeachers();
    } catch (error) {
      alert("Error al cambiar estado");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingTeacher) {
        await updateTeacherRequest(editingTeacher._id, data);
      } else {
        await createTeacherRequest(data);
      }
      setIsModalOpen(false);
      reset();
      loadTeachers();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al guardar";
      alert(`Error: ${msg}`);
    }
  });

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando cuerpo docente...</div>;

  return (
    <div className="max-w-full w-full animate-fade-in-up space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Cuerpo Docente</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de profesores y especialidades</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o especialidad..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={openCreateModal} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0 active:scale-95"
            >
                <Plus size={20} /> <span className="hidden md:inline">Nuevo</span>
            </button>
        </div>
      </div>

      {/* --- VISTA ESCRITORIO (TABLA) --- */}
      <div className="hidden md:block bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                <th className="p-5">Profesor</th>
                <th className="p-5">Especialidad / Título</th>
                <th className="p-5">Contacto</th>
                <th className="p-5 text-center">Estado</th>
                <th className="p-5 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {filteredTeachers.map((t) => (
                <tr 
                    key={t._id} 
                    className={`
                      group transition-colors
                      hover:bg-gray-50 dark:hover:bg-gray-700/50
                      ${!t.isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''}
                    `}
                >
                    <td className="p-5">
                        <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-sm font-bold shrink-0">
                                {t.name[0]}{t.lastName[0]}
                            </div>
                            <div>
                                {t.name} {t.lastName}
                                <div className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-0.5">ID: {t.documentId}</div>
                            </div>
                        </div>
                    </td>
                    <td className="p-5">
                        <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                            <Briefcase size={14} className="text-gray-400 dark:text-gray-500" /> {t.speciality}
                        </div>
                        {t.degree && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <Award size={14} className="text-gray-400 dark:text-gray-500" /> {t.degree}
                            </div>
                        )}
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2 mb-1" title={t.email}>
                            <Mail size={14} className="text-gray-400 dark:text-gray-500" /> {t.email}
                        </div>
                        {t.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Phone size={14} className="text-gray-400 dark:text-gray-500" /> {t.phone}
                            </div>
                        )}
                    </td>
                    <td className="p-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                          ${t.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                        >
                            {t.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => openEditModal(t)} 
                                className="p-2 bg-indigo-600  text-gray-200 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-gray-200 dark:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                onClick={() => handleToggleStatus(t._id)} 
                                className={`p-2 transition rounded-lg ${t.isActive ? ' bg-indigo-600 text-gray-200 hover:text-red-500 hover:bg-red-50 dark:text-indigo-600 dark:bg-gray-200 dark:hover:bg-red-900/30 dark:hover:text-red-400' : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-400'}`}
                            >
                                {t.isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* --- VISTA MÓVIL (TARJETAS FULL WIDTH) --- */}
      <div className="md:hidden grid grid-cols-1 gap-4 w-full">
        {filteredTeachers.map((t) => (
          <div 
            key={t._id} 
            className={`
                p-5 rounded-xl shadow-sm border transition w-full
                bg-white dark:bg-gray-800 dark:border-gray-700
                ${!t.isActive ? 'opacity-75 bg-gray-50 dark:bg-gray-900 border-dashed' : 'border-gray-100'}
            `}
          >
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0 text-lg">
                      {t.name[0]}{t.lastName[0]}
                  </div>
                  <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 dark:text-white truncate text-lg">{t.name} {t.lastName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        ID: {t.documentId}
                      </p>
                  </div>
               </div>
               <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 tracking-wider
                   ${t.isActive 
                     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                     : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
               >
                  {t.isActive ? 'Activo' : 'Inactivo'}
               </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-5 border-b border-gray-100 dark:border-gray-700 pb-4">
               <div className="flex items-center gap-2.5">
                  <Briefcase size={16} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span className="font-medium truncate">{t.speciality}</span>
                  {t.degree && <span className="text-xs text-gray-400 dark:text-gray-500 truncate">({t.degree})</span>}
               </div>
               <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{t.email}</span>
               </div>
               {t.phone && (
                 <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span>{t.phone}</span>
                 </div>
               )}
            </div>

            <div className="flex gap-3 w-full">
                <button 
                  onClick={() => openEditModal(t)}
                  className="flex-1 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                   <Edit2 size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleToggleStatus(t._id)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                    ${t.isActive 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'}`}
                >
                   {t.isActive ? <><Trash2 size={16} /> Desactivar</> : <><RotateCcw size={16} /> Activar</>}
                </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeachers.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 w-full">
            No se encontraron profesores que coincidan con la búsqueda.
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? "Editar Profesor" : "Registrar Nuevo Profesor"}
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">NOMBRE</label>
                <input 
                    {...register("name", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
                {errors.name && <span className="text-red-500 text-xs mt-1">Requerido</span>}
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">APELLIDO</label>
                <input 
                    {...register("lastName", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
                {errors.lastName && <span className="text-red-500 text-xs mt-1">Requerido</span>}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">DNI / CÉDULA</label>
                <input 
                    {...register("documentId", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
                {errors.documentId && <span className="text-red-500 text-xs mt-1">Requerido</span>}
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">TELÉFONO</label>
                <input 
                    {...register("phone")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
             </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">EMAIL</label>
             <input 
                type="email" 
                {...register("email", {required:true})} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
             />
             {errors.email && <span className="text-red-500 text-xs mt-1">Requerido</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">ESPECIALIDAD</label>
                <input 
                    {...register("speciality", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                    placeholder="Ej. Matemáticas" 
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">GRADO ACADÉMICO</label>
                <select 
                    {...register("degree")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                    <option value="">Seleccionar...</option>
                    <option value="Licenciado">Licenciado</option>
                    <option value="Ingeniero">Ingeniero</option>
                    <option value="Magister">Magister</option>
                    <option value="Doctor (PhD)">Doctor (PhD)</option>
                    <option value="Técnico">Técnico</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">FECHA CONTRATACIÓN</label>
                <input 
                    type="date" 
                    {...register("hireDate")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">DIRECCIÓN</label>
                <input 
                    {...register("address")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                    placeholder="Dirección..." 
                />
             </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Save size={20} /> {editingTeacher ? "Actualizar Datos" : "Guardar Profesor"}
          </button>
        </form>
      </Modal>
    </div>
  );
};