import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { getProgramsRequest, createProgramRequest } from "../api/programs";
import type { Program } from "../types";
import { Plus, Save } from "lucide-react";
import { Modal } from '../components/ui/Modal';

export const ProgramsPage = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<Program>();

    const fetchPrograms = async () => {
        try {
        const res = await getProgramsRequest();
        setPrograms(res.data);
        } catch (error) {
        console.error("Error cargando programas", error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const onSubmit = handleSubmit(async (data) => {
        try {
        await createProgramRequest(data);
        setIsModalOpen(false);
        reset(); 
        fetchPrograms(); 
        } catch (error) {
        console.error("Error creando programa", error);
        alert("Error al crear programa");
        }
    });

    if (loading) {
        return <div>Cargando programas...</div>;
    }

    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Programas Académicos</h1>
          <p className="text-gray-500">Gestiona cursos, diplomados y talleres</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={20} /> Nuevo Programa
        </button>
      </div>

      {/* Lista de Programas (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <div key={program._id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded text-xs font-bold 
                ${program.type === 'Diplomado' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {program.type}
              </span>
              <span className="font-bold text-gray-800">${program.cost}</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{program.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{program.description || 'Sin descripción'}</p>
            <div className="mt-4 pt-4 border-t text-xs text-gray-400 flex justify-between">
               <span>Pago: {program.paymentType}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Creación */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Programa"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Programa</label>
            <input 
              {...register("name", { required: true })}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ej. Curso de React Avanzado"
            />
            {errors.name && <span className="text-red-500 text-xs">Requerido</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select {...register("type")} className="w-full border rounded-lg p-2 mt-1 outline-none">
                <option value="Curso">Curso</option>
                <option value="Diplomado">Diplomado</option>
                <option value="Taller">Taller</option>
                <option value="Seminario">Seminario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo ($)</label>
              <input 
                type="number"
                {...register("cost", { required: true, min: 0 })}
                className="w-full border rounded-lg p-2 mt-1 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Modalidad Pago</label>
                <select {...register("paymentType")} className="w-full border rounded-lg p-2 mt-1 outline-none">
                  <option value="unico">Pago Único</option>
                  <option value="cuotas">Por Cuotas</option>
                </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Descripción</label>
             <textarea 
               {...register("description")}
               className="w-full border rounded-lg p-2 mt-1 outline-none h-24 resize-none"
             ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Save size={18} /> Guardar Programa
          </button>
        </form>
      </Modal>
    </div>
  );
};