import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getTeachersRequest, createTeacherRequest } from '../api/teachers';
import type { Teacher } from '../types';
import { Plus, Save, Mail, Briefcase } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<Teacher>();

  const loadTeachers = async () => {
    const res = await getTeachersRequest();
    setTeachers(res.data);
  };

  useEffect(() => { loadTeachers(); }, []);

  const onSubmit = handleSubmit(async (data) => {
    await createTeacherRequest(data);
    setIsModalOpen(false);
    reset();
    loadTeachers();
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cuerpo Docente</h1>
          <p className="text-gray-500">Administra los profesores de la institución</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={20} /> Nuevo Profesor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t._id} className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
              {t.name[0]}{t.lastName[0]}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{t.name} {t.lastName}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Briefcase size={12} /> {t.speciality}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Mail size={12} /> {t.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Profesor">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium">Nombre</label>
                <input {...register("name", {required:true})} className="w-full border rounded p-2 mt-1" />
            </div>
            <div>
                <label className="text-sm font-medium">Apellido</label>
                <input {...register("lastName", {required:true})} className="w-full border rounded p-2 mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" {...register("email", {required:true})} className="w-full border rounded p-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Especialidad</label>
            <input {...register("speciality", {required:true})} className="w-full border rounded p-2 mt-1" placeholder="Ej. Matemáticas, Inglés..." />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 flex justify-center gap-2">
            <Save size={18} /> Guardar Profesor
          </button>
        </form>
      </Modal>
    </div>
  );
};
