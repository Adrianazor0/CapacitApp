import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  getClassroomsRequest, createClassroomRequest, 
  updateClassroomRequest, deleteClassroomRequest 
} from '../api/classrooms';
import type { Classroom } from '../types';
import { Modal } from '../components/ui/Modal';
import { 
  LayoutDashboard, Plus, Save, Edit2, Trash2, 
  RotateCcw, Monitor, MapPin, Wifi, Video, Users 
} from 'lucide-react';

export const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  // Hook form con 'watch' para detectar cambios en el tipo de aula
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Classroom>();
  const typeWatch = watch("type", "Física"); // Valor por defecto Física

  const loadData = async () => {
    try {
      const res = await getClassroomsRequest();
      setClassrooms(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { loadData(); }, []);

  const openCreateModal = () => {
    setEditingClassroom(null);
    reset({
      type: "Física",
      name: "",
      capacity: 0,
      location: "",
      platform: "Google Meet",
      meetingLink: ""
    }); 
    setIsModalOpen(true);
  };

  const openEditModal = (c: Classroom) => {
    setEditingClassroom(c);
    reset(c); // React Hook Form llenará todos los campos automáticamente
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    if (!confirm("¿Cambiar estado del aula?")) return;
    try {
      await deleteClassroomRequest(id);
      loadData();
    } catch (error) { alert("Error al cambiar estado"); }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingClassroom) {
        await updateClassroomRequest(editingClassroom._id, data);
      } else {
        await createClassroomRequest(data);
      }
      setIsModalOpen(false);
      reset();
      loadData();
    } catch (error) {
      alert("Error al guardar aula");
    }
  });

  return (
    <div className="animate-fade-in-up space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Espacios de Aprendizaje</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona laboratorios, aulas físicas y salas virtuales</p>
        </div>
        
        <button 
          onClick={openCreateModal} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} /> Nuevo Espacio
        </button>
      </div>

      {/* --- GRID DE TARJETAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map(c => (
          <div 
            key={c._id} 
            className={`
              p-6 rounded-xl shadow-sm border relative transition-all
              bg-white dark:bg-gray-800 dark:border-gray-700
              ${!c.isActive 
                ? 'opacity-60 bg-gray-50 dark:bg-gray-900 border-dashed' 
                : 'hover:shadow-md border-gray-100'
              }
            `}
          >
            
            {/* Cabecera de Tarjeta */}
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2.5 rounded-lg 
                 ${c.type === 'Virtual' 
                   ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                   : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`
               }>
                  {c.type === 'Virtual' ? <Monitor size={24} /> : <LayoutDashboard size={24} />}
               </div>
               
               <div className="flex gap-2">
                 <button 
                   onClick={() => openEditModal(c)} 
                   className="p-1.5 bg-indigo-600  text-gray-200 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-gray-200 dark:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-colors"
                 >
                   <Edit2 size={16} />
                 </button>
                 <button 
                   onClick={() => handleToggleStatus(c._id)} 
                   className={`p-1.5 transition rounded-lg ${c.isActive ? ' bg-indigo-600 text-gray-200 hover:text-red-500 hover:bg-red-50 dark:text-indigo-600 dark:bg-gray-200 dark:hover:bg-red-900/30 dark:hover:text-red-400' : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-400'}`}
                 >
                   {c.isActive ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                 </button>
               </div>
            </div>

            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">{c.name}</h3>
            
            {/* Contenido Condicional */}
            {c.type === 'Física' ? (
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400 dark:text-gray-500" /> 
                        <span>{c.location || 'Sin ubicación'}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-md text-xs mt-2 font-medium">
                        <Users size={14} className="text-gray-500 dark:text-gray-400" />
                        Capacidad: <b className="text-gray-900 dark:text-white">{c.capacity}</b> personas
                    </div>
                </div>
            ) : (
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                        <Video size={16} /> {c.platform || 'Plataforma Virtual'}
                    </div>
                    {c.meetingLink && (
                        <a 
                          href={c.meetingLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1 truncate"
                        >
                            <Wifi size={12} /> {c.meetingLink}
                        </a>
                    )}
                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-md text-xs mt-2 font-medium">
                        <Users size={14} className="text-gray-500 dark:text-gray-400" />
                        Cupo Máx: <b className="text-gray-900 dark:text-white">{c.capacity}</b>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL DINÁMICO --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClassroom ? "Editar Espacio" : "Nuevo Espacio"}
      >
        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* Selector de Tipo y Capacidad */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">TIPO DE ESPACIO</label>
                <select 
                    {...register("type")} 
                    className="w-full border-2 border-indigo-50 dark:border-gray-600 p-2.5 rounded-xl mt-1 font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:border-indigo-500 focus:outline-none transition-colors"
                >
                    <option value="Física">Aula Física / Laboratorio</option>
                    <option value="Virtual">Aula Virtual / Remota</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">CAPACIDAD (PERSONAS)</label>
                <input 
                  type="number" 
                  {...register("capacity", {required:true, min: 1})} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
                {errors.capacity && <span className="text-red-500 text-xs mt-1">Requerido</span>}
             </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">NOMBRE / IDENTIFICADOR</label>
             <input 
               {...register("name", {required:true})} 
               className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
               placeholder="Ej. Laboratorio de Química 1" 
             />
             {errors.name && <span className="text-red-500 text-xs mt-1">Requerido</span>}
          </div>

          {/* Campos Condicionales (Adaptados a Dark Mode) */}
          {typeWatch === 'Física' ? (
             <div className="animate-fade-in space-y-4 border-l-4 border-orange-300 dark:border-orange-500 pl-4 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-r-xl">
                <div>
                    <label className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-1 block">UBICACIÓN FÍSICA</label>
                    <input 
                      {...register("location", {required: true})} 
                      className="w-full border border-orange-200 dark:border-orange-700/50 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors" 
                      placeholder="Ej. Edificio B, Piso 2" 
                    />
                    {errors.location && <span className="text-red-500 text-xs mt-1">Requerido para aulas físicas</span>}
                </div>
             </div>
          ) : (
             <div className="animate-fade-in space-y-4 border-l-4 border-purple-300 dark:border-purple-500 pl-4 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-r-xl">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1 block">PLATAFORMA</label>
                        <select 
                          {...register("platform")} 
                          className="w-full border border-purple-200 dark:border-purple-700/50 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-colors"
                        >
                            <option value="Google Meet">Google Meet</option>
                            <option value="Zoom">Zoom</option>
                            <option value="Microsoft Teams">Microsoft Teams</option>
                            <option value="Otra">Otra</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1 block">ENLACE DE REUNIÓN (PERMANENTE)</label>
                    <input 
                      {...register("meetingLink")} 
                      className="w-full border border-purple-200 dark:border-purple-700/50 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-colors" 
                      placeholder="https://meet.google.com/abc-defg-hij" 
                    />
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 opacity-80">El profesor podrá actualizar esto luego si cambia.</p>
                </div>
             </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 flex justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Save size={20} /> Guardar Espacio
          </button>
        </form>
      </Modal>
    </div>
  );
};