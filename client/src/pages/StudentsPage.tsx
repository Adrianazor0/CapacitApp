import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getStudentsRequest, createStudentRequest } from '../api/students';
import type { Student } from '../types';
import { Modal } from '../components/ui/Modal';
import { Plus, Save } from 'lucide-react';

export const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<Student>();

  const loadData = async () => {
    const res = await getStudentsRequest();
    setStudents(res.data);
  };

  useEffect(() => { loadData(); }, []);

const onSubmit = handleSubmit(async (data) => {
    try {
      await createStudentRequest(data);
      setIsModalOpen(false);
      reset();
      loadData();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Error desconocido al crear estudiante";
      alert(`No se pudo guardar: ${message}`);
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2">
          <Plus size={20} /> Registrar Estudiante
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Documento</th>
              <th className="p-4">Contacto</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{s.name} {s.lastName}</td>
                <td className="p-4 text-gray-500">{s.documentId}</td>
                <td className="p-4 text-gray-500">
                  <div className="text-sm">{s.email}</div>
                  <div className="text-xs">{s.phone}</div>
                </td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Activo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Estudiante">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input {...register("name", {required:true})} placeholder="Nombre" className="w-full border p-2 rounded" />
            <input {...register("lastName", {required:true})} placeholder="Apellido" className="w-full border p-2 rounded" />
          </div>
          <input {...register("documentId", {required:true})} placeholder="DNI / Cédula" className="w-full border p-2 rounded" />
          <input {...register("email", {required:true})} placeholder="Email" className="w-full border p-2 rounded" />
          <input {...register("phone")} placeholder="Teléfono" className="w-full border p-2 rounded" />
          <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded flex justify-center gap-2"><Save size={18} /> Guardar</button>
        </form>
      </Modal>
    </div>
  );
};