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
  Search, Phone, Mail, Briefcase, Award 
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
      `${t.name} ${t.lastName}`.toLowerCase().includes(term) // Búsqueda compuesta
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

  if (loading) return <div>Cargando cuerpo docente...</div>;

  return (
    <div className="max-w-full w-full"> {/* w-full para ocupar todo el ancho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cuerpo Docente</h1>
          <p className="text-gray-500">Gestión de profesores y especialidades</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o especialidad..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm shrink-0">
                <Plus size={20} /> <span className="hidden md:inline">Nuevo</span>
            </button>
        </div>
      </div>

      {/* --- VISTA ESCRITORIO (TABLA) --- */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden w-full">
        {/* ENVOLTORIO RESPONSIVO PARA LA TABLA */}
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                <tr>
                <th className="p-4">Profesor</th>
                <th className="p-4">Especialidad / Título</th>
                <th className="p-4">Contacto</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y text-sm">
                {filteredTeachers.map((t) => (
                <tr key={t._id} className={`hover:bg-gray-50 transition ${!t.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="p-4">
                        <div className="font-bold text-gray-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs shrink-0">
                                {t.name[0]}{t.lastName[0]}
                            </div>
                            <div>
                                {t.name} {t.lastName}
                                <div className="text-xs text-gray-400 font-normal mt-0.5">ID: {t.documentId}</div>
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-2 font-medium text-gray-700">
                            <Briefcase size={14} className="text-gray-400" /> {t.speciality}
                        </div>
                        {t.degree && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Award size={14} className="text-gray-400" /> {t.degree}
                            </div>
                        )}
                    </td>
                    <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-2 mb-1" title={t.email}>
                            <Mail size={14} /> {t.email}
                        </div>
                        {t.phone && (
                            <div className="flex items-center gap-2 text-xs">
                                <Phone size={14} /> {t.phone}
                            </div>
                        )}
                    </td>
                    <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {t.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => openEditModal(t)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleToggleStatus(t._id)} className={`p-2 rounded transition ${t.isActive ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                                {t.isActive ? <Trash2 size={16} /> : <RotateCcw size={16} />}
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
      <div className="md:hidden grid grid-cols-1 gap-4 w-full"> {/* w-full explícito */}
        {filteredTeachers.map((t) => (
          <div key={t._id} className={`bg-white p-4 rounded-xl shadow-sm border transition w-full ${!t.isActive ? 'opacity-75 bg-gray-50' : ''}`}> {/* w-full en tarjeta */}
            <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      {t.name[0]}{t.lastName[0]}
                  </div>
                  <div className="min-w-0"> {/* min-w-0 permite truncar texto largo */}
                      <h3 className="font-bold text-gray-800 truncate">{t.name} {t.lastName}</h3>
                      <p className="text-xs text-gray-500 truncate">{t.documentId}</p>
                  </div>
               </div>
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {t.isActive ? 'Activo' : 'Inactivo'}
               </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4 border-b pb-3 border-gray-100">
               <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-indigo-400 shrink-0" />
                  <span className="font-medium truncate">{t.speciality}</span>
                  {t.degree && <span className="text-xs text-gray-400 truncate">({t.degree})</span>}
               </div>
               <div className="flex items-center gap-2">
                  <Mail size={16} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{t.email}</span>
               </div>
               {t.phone && (
                 <div className="flex items-center gap-2">
                    <Phone size={16} className="text-indigo-400 shrink-0" />
                    <span>{t.phone}</span>
                 </div>
               )}
            </div>

            <div className="flex justify-end gap-2 w-full">
                <button 
                  onClick={() => openEditModal(t)}
                  className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                   <Edit2 size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleToggleStatus(t._id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${t.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                   {t.isActive ? <><Trash2 size={16} /> Desactivar</> : <><RotateCcw size={16} /> Activar</>}
                </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed mt-4 w-full">
            No se encontraron profesores.
        </div>
      )}

      {/* Modal Crear/Editar (Reutilizado) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? "Editar Profesor" : "Registrar Nuevo Profesor"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500">NOMBRE</label>
                <input {...register("name", {required:true})} className="w-full border p-2 rounded mt-1" />
                {errors.name && <span className="text-red-500 text-xs">Requerido</span>}
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">APELLIDO</label>
                <input {...register("lastName", {required:true})} className="w-full border p-2 rounded mt-1" />
                {errors.lastName && <span className="text-red-500 text-xs">Requerido</span>}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500">DNI / CÉDULA</label>
                <input {...register("documentId", {required:true})} className="w-full border p-2 rounded mt-1" />
                {errors.documentId && <span className="text-red-500 text-xs">Requerido</span>}
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">TELÉFONO</label>
                <input {...register("phone")} className="w-full border p-2 rounded mt-1" />
             </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500">EMAIL</label>
             <input type="email" {...register("email", {required:true})} className="w-full border p-2 rounded mt-1" />
             {errors.email && <span className="text-red-500 text-xs">Requerido</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500">ESPECIALIDAD</label>
                <input {...register("speciality", {required:true})} className="w-full border p-2 rounded mt-1" placeholder="Ej. Matemáticas" />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">GRADO ACADÉMICO</label>
                <select {...register("degree")} className="w-full border p-2 rounded mt-1">
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
                <label className="text-xs font-bold text-gray-500">FECHA CONTRATACIÓN</label>
                <input type="date" {...register("hireDate")} className="w-full border p-2 rounded mt-1" />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">DIRECCIÓN</label>
                <input {...register("address")} className="w-full border p-2 rounded mt-1" placeholder="Dirección..." />
             </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2">
            <Save size={20} /> {editingTeacher ? "Actualizar Datos" : "Guardar Profesor"}
          </button>
        </form>
      </Modal>
    </div>
  );
};