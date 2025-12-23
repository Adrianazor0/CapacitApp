import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getGroupsRequest, createGroupRequest } from '../api/groups';
import { getProgramsRequest } from '../api/programs';
import { getTeachersRequest } from '../api/teachers';
import { getClassroomsRequest } from '../api/classrooms';
import type { Group, Program, Teacher, Classroom } from '../types';
import { Modal } from '../components/ui/Modal';
import { Calendar, Plus, Save, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadData = async () => {
    try {
      const [gRes, pRes, tRes, cRes] = await Promise.all([
        getGroupsRequest(),
        getProgramsRequest(),
        getTeachersRequest(),
        getClassroomsRequest()
      ]);
      setGroups(gRes.data);
      setPrograms(pRes.data);
      setTeachers(tRes.data);
      setClassrooms(cRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      ...data,
      schedule: [{
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime
      }]
    };
    
    try {
      await createGroupRequest(payload);
      setIsModalOpen(false);
      reset();
      loadData();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Error desconocido al crear grupo";
      alert(`Error del Servidor: ${message}`);
    }
  });

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando grupos...</div>;

  return (
    <div className="max-w-full w-full animate-fade-in-up space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Grupos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Apertura de cursos y asignación de horarios</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} /> Nuevo Grupo
        </button>
      </div>

      {/* --- GRID DE TARJETAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map(g => (
          <div 
            key={g._id} 
            className="bg-white dark:bg-gray-800 dark:border-gray-700 p-6 rounded-xl shadow-sm border relative overflow-hidden transition-all hover:shadow-md"
          >
            {/* Indicador lateral de color */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
            
            {/* Header de la tarjeta */}
            <div className="flex justify-between items-start mb-3 pl-2">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                {g.code}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                ${g.status === 'Activo'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
              >
                {g.status}
              </span>
            </div>

            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 pl-2 flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-500" />
                {g.program?.name}
            </h3>
            
            {/* Detalles del grupo */}
            <div className="pl-2 grid grid-cols-2 gap-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-gray-400 dark:text-gray-500" />
                <span className="truncate">{g.teacher?.name} {g.teacher?.lastName}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                <span className="truncate">{g.classroom?.name}</span>
              </div>
              
              {/* Horario destacado */}
              <div className="col-span-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg flex items-center gap-3 mt-2 border border-indigo-100 dark:border-indigo-900/30">
                 <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                 <div>
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200 block">{g.schedule[0]?.day}</span>
                    <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 text-xs">
                        <Clock size={12} />
                        {g.schedule[0]?.startTime} - {g.schedule[0]?.endTime}
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end pl-2">
              <Link 
                to={`/groups/${g._id}`}
                className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline flex items-center gap-1"
              >
                Gestionar Grupo →
              </Link>
            </div>
          </div>
        ))}
        
        {groups.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                No hay grupos creados actualmente.
            </div>
        )}
      </div>

      {/* --- MODAL DE CREACIÓN --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Aperturar Nuevo Grupo"
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">CÓDIGO DEL GRUPO</label>
            <input 
                {...register("code", {required:true})} 
                placeholder="Ej. G-2023-01" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase transition-colors" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">PROGRAMA</label>
               <select 
                 {...register("program", {required:true})} 
                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
               >
                 <option value="">Seleccionar...</option>
                 {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
               </select>
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">AULA</label>
               <select 
                 {...register("classroom", {required:true})} 
                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
               >
                 <option value="">Seleccionar...</option>
                 {classrooms.map(c => <option key={c._id} value={c._id}>{c.name} (Cap: {c.capacity})</option>)}
               </select>
             </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">PROFESOR ASIGNADO</label>
             <select 
               {...register("teacher", {required:true})} 
               className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
             >
               <option value="">Seleccionar...</option>
               {teachers.map(t => <option key={t._id} value={t._id}>{t.name} {t.lastName} - {t.speciality}</option>)}
             </select>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Clock size={16} /> Horario y Fechas
            </p>
            <div className="grid grid-cols-3 gap-3 mb-3">
               <select 
                 {...register("day", {required:true})} 
                 className="col-span-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
               >
                 <option value="Lunes">Lunes</option>
                 <option value="Martes">Martes</option>
                 <option value="Miércoles">Miércoles</option>
                 <option value="Jueves">Jueves</option>
                 <option value="Viernes">Viernes</option>
                 <option value="Sábado">Sábado</option>
               </select>
               <input 
                 type="time" 
                 {...register("startTime", {required:true})} 
                 className="col-span-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors" 
               />
               <input 
                 type="time" 
                 {...register("endTime", {required:true})} 
                 className="col-span-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors" 
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Inicio</label>
                  <input 
                    type="date" 
                    {...register("startDate", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors" 
                  />
               </div>
               <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Fin</label>
                  <input 
                    type="date" 
                    {...register("endDate", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors" 
                  />
               </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 mt-4 flex justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Save size={20} /> Crear Grupo
          </button>
        </form>
      </Modal>
    </div>
  );
};