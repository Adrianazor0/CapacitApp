import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  getProgramsRequest, createProgramRequest, 
  updateProgramRequest, deleteProgramRequest 
} from '../api/programs';
import type { Program } from '../types';
import { Modal } from '../components/ui/Modal';
import { 
  Plus, Save, Edit2, 
  Trash2, RotateCcw 
} from 'lucide-react';

export const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Program>();

  const loadPrograms = async () => {
    try {
      const res = await getProgramsRequest();
      setPrograms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrograms(); }, []);

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingProgram(null);
    reset(); // Limpiar form
    setIsModalOpen(true);
  };

  // Abrir modal para editar (llenar datos)
  const openEditModal = (prog: Program) => {
    setEditingProgram(prog);
    // Rellenar formulario con datos existentes
    setValue("code", prog.code);
    setValue("name", prog.name);
    setValue("type", prog.type);
    setValue("level", prog.level);
    setValue("cost", prog.cost);
    setValue("paymentType", prog.paymentType);
    setValue("description", prog.description);
    setIsModalOpen(true);
  };

  // Manejar toggle activo/inactivo
  const handleToggleStatus = async (id: string) => {
    if (!confirm("¿Seguro que deseas cambiar el estado de este programa?")) return;
    try {
      await deleteProgramRequest(id);
      loadPrograms();
    } catch (error) {
      alert("Error al cambiar estado");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingProgram) {
        // Modo Edición
        await updateProgramRequest(editingProgram._id, data);
      } else {
        // Modo Creación
        await createProgramRequest(data);
      }
      setIsModalOpen(false);
      reset();
      loadPrograms();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al guardar";
      alert(`Error: ${msg}`);
    }
  });

  if (loading) return <div>Cargando catálogo...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Oferta Académica</h1>
          <p className="text-gray-500">Administra cursos, niveles y precios</p>
        </div>
        <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm">
          <Plus size={20} /> Nuevo Programa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((p) => (
          <div key={p._id} className={`bg-white p-6 rounded-xl shadow-sm border transition relative ${!p.isActive ? 'opacity-75 bg-gray-50' : 'hover:shadow-md'}`}>
            
            {/* Badge de Estado */}
            <div className="flex justify-between items-start mb-3">
               <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                 {p.isActive ? 'Activo' : 'Inactivo'}
               </span>
               <div className="flex gap-2">
                 <button onClick={() => openEditModal(p)} className="text-gray-400 hover:text-indigo-600 transition" title="Editar">
                   <Edit2 size={18} />
                 </button>
                 <button onClick={() => handleToggleStatus(p._id)} className={`text-gray-400 transition ${p.isActive ? 'hover:text-red-500' : 'hover:text-green-500'}`} title={p.isActive ? "Desactivar" : "Reactivar"}>
                   {p.isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
                 </button>
               </div>
            </div>

            <h3 className="font-bold text-lg text-gray-800 mb-1">{p.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
               <span className="bg-gray-100 px-2 py-0.5 rounded">{p.code || 'S/C'}</span>
               <span>•</span>
               <span>{p.level}</span>
            </div>

            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{p.description || 'Sin descripción detallada.'}</p>
            
            <div className="border-t pt-4 flex justify-between items-center text-sm">
               <span className={`px-2 py-1 rounded text-xs font-bold ${p.type === 'Diplomado' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {p.type}
               </span>
               <span className="font-bold text-gray-800 text-lg">${p.cost}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Reutilizable (Crear/Editar) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? `Editar: ${editingProgram.name}` : "Crear Nuevo Programa"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-1">
                <label className="text-xs font-bold text-gray-500">CÓDIGO</label>
                <input {...register("code", {required:true})} className="w-full border p-2 rounded mt-1 uppercase" placeholder="Ej. DEV-01" />
                {errors.code && <span className="text-red-500 text-xs">Requerido</span>}
             </div>
             <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">NOMBRE DEL PROGRAMA</label>
                <input {...register("name", {required:true})} className="w-full border p-2 rounded mt-1" placeholder="Ej. React Avanzado" />
                {errors.name && <span className="text-red-500 text-xs">Requerido</span>}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500">TIPO</label>
              <select {...register("type")} className="w-full border p-2 rounded mt-1">
                <option value="Curso">Curso</option>
                <option value="Diplomado">Diplomado</option>
                <option value="Taller">Taller</option>
                <option value="Seminario">Seminario</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">NIVEL</label>
              <select {...register("level")} className="w-full border p-2 rounded mt-1">
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500">COSTO ($)</label>
              <input type="number" {...register("cost", {required:true, min:0})} className="w-full border p-2 rounded mt-1 font-bold" />
              {errors.cost && <span className="text-red-500 text-xs">Requerido</span>}
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500">PAGO</label>
                <select {...register("paymentType")} className="w-full border p-2 rounded mt-1">
                  <option value="unico">Pago Único</option>
                  <option value="cuotas">Por Cuotas</option>
                </select>
             </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500">DESCRIPCIÓN / TEMARIO</label>
             <textarea {...register("description")} className="w-full border p-2 rounded mt-1 h-20 resize-none"></textarea>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2">
            <Save size={20} /> {editingProgram ? "Actualizar Programa" : "Guardar Programa"}
          </button>
        </form>
      </Modal>
    </div>
  );
};