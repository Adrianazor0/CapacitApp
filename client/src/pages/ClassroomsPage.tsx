import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getClassroomsRequest, createClassroomRequest } from '../api/classrooms';
import type { Classroom } from '../types';
import { Modal } from '../components/ui/Modal';
import { Plus, Save } from 'lucide-react';

export const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<Classroom>();

  const loadData = async () => {
    const res = await getClassroomsRequest();
    setClassrooms(res.data);
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = handleSubmit(async (data) => {
    await createClassroomRequest(data);
    setIsModalOpen(false);
    reset();
    loadData();
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Aulas y Espacios</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2">
          <Plus size={20} /> Nueva Aula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classrooms.map(c => (
          <div key={c._id} className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-lg text-indigo-700">{c.name}</h3>
            <p className="text-gray-500 text-sm">{c.location}</p>
            <div className="mt-2 text-xs font-semibold bg-gray-100 inline-block px-2 py-1 rounded">
              Capacidad: {c.capacity} personas
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Aula">
        <form onSubmit={onSubmit} className="space-y-4">
          <input {...register("name", {required:true})} placeholder="Nombre (Ej. Lab 1)" className="w-full border p-2 rounded" />
          <input {...register("location", {required:true})} placeholder="Ubicación" className="w-full border p-2 rounded" />
          <input type="number" {...register("capacity", {required:true})} placeholder="Capacidad" className="w-full border p-2 rounded" />
          <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded flex justify-center gap-2"><Save size={18} /> Guardar</button>
        </form>
      </Modal>
    </div>
  );
};
