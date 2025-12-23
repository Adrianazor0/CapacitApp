import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  getStudentsRequest, createStudentRequest, 
  updateStudentRequest, deleteStudentRequest 
} from '../api/students';
import type { Student } from '../types';
import { Modal } from '../components/ui/Modal';
import { 
  Plus, Save, Edit2, Mail, 
  Trash2, RotateCcw, Search, Phone, MapPin, User,
  Calendar, AlertCircle
} from 'lucide-react';

export const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Student>();

  const loadStudents = async () => {
    try {
      const res = await getStudentsRequest();
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = students.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.lastName.toLowerCase().includes(term) ||
      s.documentId.includes(term)
    );
    setFilteredStudents(results);
  }, [searchTerm, students]);

  const openCreateModal = () => {
    setEditingStudent(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setValue("name", student.name);
    setValue("lastName", student.lastName);
    setValue("documentId", student.documentId);
    setValue("email", student.email);
    setValue("phone", student.phone);
    setValue("gender", student.gender);
    setValue("address", student.address);
    if (student.birthDate) {
        setValue("birthDate", student.birthDate.split('T')[0]);
    }
    if (student.emergencyContact) {
        setValue("emergencyContact.name", student.emergencyContact.name);
        setValue("emergencyContact.phone", student.emergencyContact.phone);
    }
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    if (!confirm("¿Cambiar estado del estudiante?")) return;
    try {
      await deleteStudentRequest(id);
      loadStudents();
    } catch (error) {
      alert("Error al cambiar estado");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingStudent) {
        await updateStudentRequest(editingStudent._id, data);
      } else {
        await createStudentRequest(data);
      }
      setIsModalOpen(false);
      reset();
      loadStudents();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al guardar";
      alert(`Error: ${msg}`);
    }
  });

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando directorio...</div>;

  return (
    <div className="max-w-full w-full animate-fade-in-up space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Directorio Estudiantes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de alumnos y contactos</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o DNI..." 
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
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-5">Estudiante</th>
                  <th className="p-5">Documento / Email</th>
                  <th className="p-5">Contacto</th>
                  <th className="p-5">Emergencia</th>
                  <th className="p-5 text-center">Estado</th>
                  <th className="p-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {filteredStudents.map((s) => (
                  <tr 
                    key={s._id} 
                    className={`group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50
                      ${!s.isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''}`}
                  >
                    <td className="p-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold shrink-0">
                               <User size={18} />
                           </div>
                           <div>
                               <div className="font-bold text-gray-800 dark:text-gray-200">{s.name} {s.lastName}</div>
                               <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                   {s.gender === 'M' ? 'Masc.' : s.gender === 'F' ? 'Fem.' : 'Otro'} 
                                   {s.birthDate && (
                                     <> • <Calendar size={10} className="inline ml-1" /> {new Date(s.birthDate).toLocaleDateString()}</>
                                   )}
                               </div>
                           </div>
                        </div>
                    </td>
                    <td className="p-5">
                        <div className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded w-fit text-xs font-medium">
                            {s.documentId}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                            <Mail size={12} /> {s.email}
                        </div>
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2 mb-1">
                            <Phone size={14} className="text-gray-400 dark:text-gray-500" /> 
                            {s.phone || <span className="text-gray-400 italic">Sin teléfono</span>}
                        </div>
                        {s.address && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400" title={s.address}>
                                <MapPin size={14} className="text-gray-400 dark:text-gray-500" /> 
                                {s.address.substring(0, 20)}{s.address.length > 20 && '...'}
                            </div>
                        )}
                    </td>
                    <td className="p-5">
                        {s.emergencyContact?.name ? (
                            <div className="text-xs bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">
                                <div className="flex items-center gap-1 text-red-800 dark:text-red-300 font-bold mb-0.5">
                                    <AlertCircle size={10} /> {s.emergencyContact.name}
                                </div>
                                <div className="text-red-600 dark:text-red-400 pl-3.5">
                                    {s.emergencyContact.phone}
                                </div>
                            </div>
                        ) : <span className="text-gray-400 text-xs italic">No registrado</span>}
                    </td>
                    <td className="p-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                          ${s.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                        >
                            {s.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => openEditModal(s)} 
                                className="p-2 bg-indigo-600  text-gray-200 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-gray-200 dark:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                onClick={() => handleToggleStatus(s._id)} 
                                className={`p-2 transition rounded-lg ${s.isActive ? ' bg-indigo-600 text-gray-200 hover:text-red-500 hover:bg-red-50 dark:text-indigo-600 dark:bg-gray-200 dark:hover:bg-red-900/30 dark:hover:text-red-400' : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-400'}`}
                                title={s.isActive ? "Desactivar" : "Activar"}
                            >
                                {s.isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* --- VISTA MÓVIL (TARJETAS) --- */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredStudents.map((s) => (
          <div 
            key={s._id} 
            className={`
               p-5 rounded-xl shadow-sm border transition w-full relative
               bg-white dark:bg-gray-800 dark:border-gray-700
               ${!s.isActive ? 'opacity-75 bg-gray-50 dark:bg-gray-900 border-dashed' : 'border-gray-100'}
            `}
          >
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold shrink-0">
                      <User size={20} />
                  </div>
                  <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">{s.name} {s.lastName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded w-fit mt-1">
                          {s.documentId}
                      </p>
                  </div>
               </div>
               <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0
                   ${s.isActive 
                     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                     : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
               >
                  {s.isActive ? 'Activo' : 'Inactivo'}
               </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-5 border-b border-gray-100 dark:border-gray-700 pb-4">
               <div className="flex items-center gap-3">
                  <Mail size={16} className="text-blue-500 dark:text-blue-400 shrink-0" />
                  <span className="truncate">{s.email}</span>
               </div>
               {s.phone && (
                 <div className="flex items-center gap-3">
                    <Phone size={16} className="text-blue-500 dark:text-blue-400 shrink-0" />
                    <span>{s.phone}</span>
                 </div>
               )}
               {s.address && (
                 <div className="flex items-center gap-3 text-xs">
                    <MapPin size={16} className="text-blue-500 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{s.address}</span>
                 </div>
               )}
            </div>

            {s.emergencyContact?.name && (
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-xs mb-5 border border-red-100 dark:border-red-900/20">
                    <span className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1 mb-1">
                        <AlertCircle size={12} /> Contacto de Emergencia:
                    </span>
                    <span className="text-red-700 dark:text-red-400 block ml-4">
                        {s.emergencyContact.name} ({s.emergencyContact.phone})
                    </span>
                </div>
            )}

            <div className="flex gap-3 w-full">
                <button 
                  onClick={() => openEditModal(s)}
                  className="flex-1 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                   <Edit2 size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleToggleStatus(s._id)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                    ${s.isActive 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'}`}
                >
                   {s.isActive ? <><Trash2 size={16} /> Desactivar</> : <><RotateCcw size={16} /> Activar</>}
                </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 w-full">
            No se encontraron estudiantes que coincidan con la búsqueda.
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Editar Estudiante" : "Registrar Nuevo Estudiante"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
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
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">GÉNERO</label>
                <select 
                    {...register("gender")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">EMAIL</label>
                <input 
                    type="email" 
                    {...register("email", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">TELÉFONO</label>
                <input 
                    {...register("phone")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">FECHA NACIMIENTO</label>
                <input 
                    type="date" 
                    {...register("birthDate")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">DIRECCIÓN</label>
                <input 
                    {...register("address")} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                    placeholder="Calle, Ciudad..." 
                />
             </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">CONTACTO DE EMERGENCIA</p>
             <div className="grid grid-cols-2 gap-4">
                <input 
                    {...register("emergencyContact.name")} 
                    placeholder="Nombre contacto" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
                <input 
                    {...register("emergencyContact.phone")} 
                    placeholder="Teléfono contacto" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                />
             </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Save size={20} /> {editingStudent ? "Actualizar Datos" : "Guardar Estudiante"}
          </button>
        </form>
      </Modal>
    </div>
  );
};