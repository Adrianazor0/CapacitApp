import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getGroupsRequest, createGroupRequest } from '../api/groups';
import { getProgramsRequest } from '../api/programs';
import { getTeachersRequest } from '../api/teachers';
import { getClassroomsRequest } from '../api/classrooms';
import type { Group, Program, Teacher, Classroom } from '../types';
import { Modal } from '../components/ui/Modal';
import { Calendar, Plus, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadData = async () => {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Grupos</h1>
          <p className="text-gray-500">Apertura de cursos y asignación de horarios</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2">
          <Plus size={20} /> Nuevo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map(g => (
          <div key={g._id} className="bg-white p-6 rounded-xl shadow-sm border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{g.code}</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{g.status}</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800">{g.program?.name}</h3>
            
            <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Prof:</span> {g.teacher?.name} {g.teacher?.lastName}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Aula:</span> {g.classroom?.name}
              </div>
              <div className="col-span-2 bg-gray-50 p-2 rounded flex items-center gap-2 mt-2">
                 <Calendar size={16} className="text-indigo-500"/>
                 <span>{g.schedule[0]?.day} de {g.schedule[0]?.startTime} a {g.schedule[0]?.endTime}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end">
              <Link 
                to={`/groups/${g._id}`}
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Gestionar Grupo →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Aperturar Nuevo Grupo">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700">Código del Grupo</label>
            <input {...register("code", {required:true})} placeholder="Ej. G-2023-01" className="w-full border p-2 rounded mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-sm font-medium">Programa</label>
               <select {...register("program", {required:true})} className="w-full border p-2 rounded mt-1">
                 <option value="">Seleccionar...</option>
                 {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
               </select>
             </div>
             <div>
               <label className="text-sm font-medium">Aula</label>
               <select {...register("classroom", {required:true})} className="w-full border p-2 rounded mt-1">
                 <option value="">Seleccionar...</option>
                 {classrooms.map(c => <option key={c._id} value={c._id}>{c.name} (Cap: {c.capacity})</option>)}
               </select>
             </div>
          </div>

          <div>
             <label className="text-sm font-medium">Profesor Asignado</label>
             <select {...register("teacher", {required:true})} className="w-full border p-2 rounded mt-1">
               <option value="">Seleccionar...</option>
               {teachers.map(t => <option key={t._id} value={t._id}>{t.name} {t.lastName} - {t.speciality}</option>)}
             </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-bold text-gray-700 mb-2">Horario y Fechas</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
               <select {...register("day", {required:true})} className="border p-2 rounded">
                 <option value="Lunes">Lunes</option>
                 <option value="Martes">Martes</option>
                 <option value="Miércoles">Miércoles</option>
                 <option value="Jueves">Jueves</option>
                 <option value="Viernes">Viernes</option>
                 <option value="Sábado">Sábado</option>
               </select>
               <input type="time" {...register("startTime", {required:true})} className="border p-2 rounded" />
               <input type="time" {...register("endTime", {required:true})} className="border p-2 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs">Inicio</label>
                  <input type="date" {...register("startDate", {required:true})} className="w-full border p-2 rounded" />
               </div>
               <div>
                  <label className="text-xs">Fin</label>
                  <input type="date" {...register("endDate", {required:true})} className="w-full border p-2 rounded" />
               </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-700 mt-4 flex justify-center gap-2">
            <Save size={20} /> Crear Grupo
          </button>
        </form>
      </Modal>
    </div>
  );
};