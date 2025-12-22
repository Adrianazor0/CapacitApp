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
  RotateCcw, Monitor, MapPin, Wifi, Video 
} from 'lucide-react';

export const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  // Hook form con 'watch' para detectar cambios en el tipo de aula
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Classroom>();
  const typeWatch = watch("type", "Física"); // Valor por defecto Física

  const loadData = async () => {
    try {
      const res = await getClassroomsRequest();
      setClassrooms(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { loadData(); }, []);

  // CORRECCIÓN: Usar reset con valores por defecto explícitos para Crear
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

  // CORRECCIÓN: Usar reset(c) completo para Editar. Esto soluciona el problema del botón guardar.
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Espacios de Aprendizaje</h1>
          <p className="text-gray-500">Gestiona laboratorios, aulas físicas y salas virtuales</p>
        </div>
        <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm">
          <Plus size={20} /> Nuevo Espacio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map(c => (
          <div key={c._id} className={`bg-white p-6 rounded-xl shadow-sm border relative transition ${!c.isActive ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
            
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2 rounded-lg ${c.type === 'Virtual' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                  {c.type === 'Virtual' ? <Monitor size={24} /> : <LayoutDashboard size={24} />}
               </div>
               <div className="flex gap-2">
                 <button onClick={() => openEditModal(c)} className="text-gray-400 hover:text-indigo-600 p-1">
                   <Edit2 size={16} />
                 </button>
                 <button onClick={() => handleToggleStatus(c._id)} className={`p-1 ${c.isActive ? 'text-gray-400 hover:text-red-500' : 'text-green-600'}`}>
                   {c.isActive ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                 </button>
               </div>
            </div>

            <h3 className="font-bold text-lg text-gray-800">{c.name}</h3>
            
            {c.type === 'Física' ? (
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} /> {c.location || 'Sin ubicación'}
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded w-fit mt-2">
                        Capacidad: <b>{c.capacity}</b> personas
                    </div>
                </div>
            ) : (
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2 text-purple-600 font-medium">
                        <Video size={14} /> {c.platform || 'Plataforma Virtual'}
                    </div>
                    {c.meetingLink && (
                        <a href={c.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline flex items-center gap-1 mt-1 truncate">
                            <Wifi size={12} /> {c.meetingLink}
                        </a>
                    )}
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded w-fit mt-2">
                        Cupo Máx: <b>{c.capacity}</b>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Dinámico */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClassroom ? "Editar Espacio" : "Nuevo Espacio"}>
        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500">TIPO DE ESPACIO</label>
                <select 
                    {...register("type")} 
                    className="w-full border-2 border-indigo-50 p-2 rounded mt-1 font-medium text-gray-700 focus:border-indigo-500 outline-none"
                >
                    <option value="Física">Aula Física / Laboratorio</option>
                    <option value="Virtual">Aula Virtual / Remota</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">CAPACIDAD (PERSONAS)</label>
                <input type="number" {...register("capacity", {required:true, min: 1})} className="w-full border p-2 rounded mt-1" />
                {errors.capacity && <span className="text-red-500 text-xs">Requerido</span>}
             </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500">NOMBRE / IDENTIFICADOR</label>
             <input {...register("name", {required:true})} className="w-full border p-2 rounded mt-1" placeholder="Ej. Laboratorio de Química 1" />
             {errors.name && <span className="text-red-500 text-xs">Requerido</span>}
          </div>

          {/* Campos Condicionales */}
          {typeWatch === 'Física' ? (
             <div className="animate-fade-in space-y-4 border-l-4 border-orange-200 pl-4 bg-orange-50 p-3 rounded-r">
                <div>
                    <label className="text-xs font-bold text-orange-700">UBICACIÓN FÍSICA</label>
                    <input {...register("location", {required: true})} className="w-full border p-2 rounded mt-1 bg-white" placeholder="Ej. Edificio B, Piso 2" />
                    {errors.location && <span className="text-red-500 text-xs">Requerido para aulas físicas</span>}
                </div>
                {/* Aquí podrías agregar checkboxes para recursos si expandes el modelo */}
             </div>
          ) : (
             <div className="animate-fade-in space-y-4 border-l-4 border-purple-200 pl-4 bg-purple-50 p-3 rounded-r">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-purple-700">PLATAFORMA</label>
                        <select {...register("platform")} className="w-full border p-2 rounded mt-1 bg-white">
                            <option value="Google Meet">Google Meet</option>
                            <option value="Zoom">Zoom</option>
                            <option value="Microsoft Teams">Microsoft Teams</option>
                            <option value="Otra">Otra</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-purple-700">ENLACE DE REUNIÓN (PERMANENTE)</label>
                    <input {...register("meetingLink")} className="w-full border p-2 rounded mt-1 bg-white" placeholder="[https://meet.google.com/abc-defg-hij](https://meet.google.com/abc-defg-hij)" />
                    <p className="text-xs text-purple-400 mt-1">El profesor podrá actualizar esto luego si cambia.</p>
                </div>
             </div>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2 mt-4">
            <Save size={20} /> Guardar Espacio
          </button>
        </form>
      </Modal>
    </div>
  );
};