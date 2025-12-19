import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  getStudentsRequest, createStudentRequest, 
  updateStudentRequest, deleteStudentRequest 
} from '../api/students';
import type { Student } from '../types';
import { Modal } from '../components/ui/Modal';
import { 
  Plus, Save, Edit2, 
  Trash2, RotateCcw, Search, Phone, MapPin 
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

  // Filtro de búsqueda en tiempo real
  useEffect(() => {
    const results = students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.documentId.includes(searchTerm)
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
    // Manejo de fechas: Convertir ISO a YYYY-MM-DD para el input date
    if (student.birthDate) {
        setValue("birthDate", student.birthDate.split('T')[0]);
    }
    // Datos anidados
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

  if (loading) return <div>Cargando directorio...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Directorio Estudiantes</h1>
          <p className="text-gray-500">Gestión de alumnos y contactos</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o DNI..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm">
                <Plus size={20} /> Nuevo
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Estudiante</th>
              <th className="p-4">Documento / Email</th>
              <th className="p-4">Contacto</th>
              <th className="p-4">Emergencia</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filteredStudents.map((s) => (
              <tr key={s._id} className={`hover:bg-gray-50 transition ${!s.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                <td className="p-4">
                    <div className="font-bold text-gray-800">{s.name} {s.lastName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        {s.gender === 'M' ? 'Masculino' : s.gender === 'F' ? 'Femenino' : ''} 
                        {s.birthDate && ` • ${new Date(s.birthDate).toLocaleDateString()}`}
                    </div>
                </td>
                <td className="p-4">
                    <div className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded w-fit text-xs">{s.documentId}</div>
                    <div className="text-gray-500 mt-1">{s.email}</div>
                </td>
                <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2 mb-1">
                        <Phone size={14} /> {s.phone || '-'}
                    </div>
                    {s.address && (
                        <div className="flex items-center gap-2 text-xs" title={s.address}>
                            <MapPin size={14} /> {s.address.substring(0, 15)}...
                        </div>
                    )}
                </td>
                <td className="p-4">
                    {s.emergencyContact?.name ? (
                        <div className="text-xs">
                            <span className="font-bold block">{s.emergencyContact.name}</span>
                            <span className="text-gray-500">{s.emergencyContact.phone}</span>
                        </div>
                    ) : <span className="text-gray-400">-</span>}
                </td>
                <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {s.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(s)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleToggleStatus(s._id)} className={`p-2 rounded transition ${s.isActive ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {s.isActive ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                        </button>
                    </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                        No se encontraron estudiantes.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Editar Estudiante" : "Registrar Nuevo Estudiante"}
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
                <label className="text-xs font-bold text-gray-500">GÉNERO</label>
                <select {...register("gender")} className="w-full border p-2 rounded mt-1">
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500">EMAIL</label>
                <input type="email" {...register("email", {required:true})} className="w-full border p-2 rounded mt-1" />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">TELÉFONO</label>
                <input {...register("phone")} className="w-full border p-2 rounded mt-1" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500">FECHA NACIMIENTO</label>
                <input type="date" {...register("birthDate")} className="w-full border p-2 rounded mt-1" />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500">DIRECCIÓN</label>
                <input {...register("address")} className="w-full border p-2 rounded mt-1" placeholder="Calle, Ciudad..." />
             </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border">
             <p className="text-xs font-bold text-gray-500 mb-2 border-b pb-1">CONTACTO DE EMERGENCIA</p>
             <div className="grid grid-cols-2 gap-4">
                <input {...register("emergencyContact.name")} placeholder="Nombre contacto" className="w-full border p-2 rounded bg-white" />
                <input {...register("emergencyContact.phone")} placeholder="Teléfono contacto" className="w-full border p-2 rounded bg-white" />
             </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2">
            <Save size={20} /> {editingStudent ? "Actualizar Datos" : "Guardar Estudiante"}
          </button>
        </form>
      </Modal>
    </div>
  );
};