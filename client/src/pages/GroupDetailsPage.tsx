import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getGroupFinancialsRequest, enrollStudentRequest, addGradeRequest } from '../api/finance';
import { getGroupsRequest } from '../api/groups'; 
import { getStudentsRequest } from '../api/students'; 
import client from '../api/axios'; 
import type { Group, Student } from '../types';
import { Modal } from '../components/ui/Modal';
import { 
  Users, ArrowLeft, GraduationCap, 
  CheckSquare, UserMinus, Plus
} from 'lucide-react';

// DEFINICIÓN DE ESTRUCTURA DE EVALUACIÓN
const EVALUATION_PLAN = [
    { id: 'parcial1', name: '1er Examen Parcial', max: 15 },
    { id: 'parcial2', name: '2do Examen Parcial', max: 15 },
    { id: 'practica', name: 'Nota Práctica', max: 30 },
    { id: 'final', name: 'Examen Final', max: 40 },
];

export const GroupDetailsPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'asistencia' | 'notas'>('asistencia');
  const [group, setGroup] = useState<Group | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  
  // Modales
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Forms
  const { register: registerEnroll, handleSubmit: handleEnroll, reset: resetEnroll } = useForm();
  
  // Form de notas con watch para validación dinámica
  const { register: registerGrade, handleSubmit: handleGrade, reset: resetGrade, watch } = useForm();
  const selectedEvalType = watch("note"); // Observar qué evaluación eligió el profe

  // Estado local para asistencia
  const [attendanceBuffer, setAttendanceBuffer] = useState<Record<string, string>>({});

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
        const [groupsRes, financeRes, studentsRes] = await Promise.all([
            getGroupsRequest(),
            getGroupFinancialsRequest(id),
            getStudentsRequest()
        ]);

        const foundGroup = groupsRes.data.find(g => g._id === id);
        setGroup(foundGroup || null);
        setEnrollments(financeRes.data);

        const currentIds = new Set(financeRes.data.map(e => e.student._id));
        setAvailableStudents(studentsRes.data.filter(s => s.isActive && !currentIds.has(s._id)));

    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  // --- LÓGICA DE CALIFICACIONES ---

  const calculateTotalAndLiteral = (grades: any[]) => {
    const total = grades.reduce((sum, g) => sum + g.value, 0);
    const count = grades.length;
    
    // Solo si tiene las 4 notas asignamos literal, si no, mostramos progreso
    if (count < 4) return { total, literal: 'En curso' };

    let literal = 'F';
    if (total >= 90) literal = 'A';
    else if (total >= 85) literal = 'B+';
    else if (total >= 80) literal = 'B';
    else if (total >= 75) literal = 'B-';
    else if (total >= 70) literal = 'C';
    else if (total >= 60) literal = 'D';

    return { total, literal };
  };

  const onAddGrade = handleGrade(async (data) => {
    // Validar duplicados en frontend
    const enrollment = enrollments.find(e => e._id === selectedEnrollmentId);
    if (enrollment?.grades.some((g: any) => g.note === data.note)) {
        return alert("El estudiante ya tiene una calificación para esta evaluación.");
    }

    try {
      await addGradeRequest({
        enrollmentId: selectedEnrollmentId,
        note: data.note,
        value: Number(data.value)
      });
      setIsGradeModalOpen(false);
      resetGrade();
      loadData();
    } catch (error) { alert("Error al guardar nota"); }
  });

  // --- OTRAS FUNCIONES (Enroll, Attendance, Withdraw) ---
  const onEnroll = handleEnroll(async (data) => {
    try {
      await enrollStudentRequest({ studentId: data.studentId, groupId: id! });
      setIsEnrollModalOpen(false);
      resetEnroll();
      loadData(); 
    } catch (error) { alert("Error al inscribir"); }
  });

  const submitAttendance = async () => {
    const records = Object.entries(attendanceBuffer).map(([enrollmentId, status]) => ({ enrollmentId, status }));
    try {
        await client.post('/finance/attendance', { groupId: id, date: new Date(), records });
        setIsAttendanceModalOpen(false);
        setAttendanceBuffer({});
        loadData();
        alert("Asistencia registrada");
    } catch (error) { alert("Error al registrar asistencia"); }
  };

  const handleWithdrawStudent = async (enrollmentId: string) => {
    if(!confirm("¿Retirar estudiante por inasistencia?")) return;
    try {
        await client.put('/finance/status', { enrollmentId, status: 'Retirado' });
        loadData();
    } catch (error) { alert("Error al retirar estudiante"); }
  };

  // Obtener el máximo de la evaluación seleccionada actualmente
  const currentMaxScore = EVALUATION_PLAN.find(e => e.name === selectedEvalType)?.max || 100;

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando...</div>;
  if (!group) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Grupo no encontrado</div>;

  return (
    <div className="animate-fade-in-up w-full">
      <button 
        onClick={() => navigate('/groups')} 
        className="flex items-center gap-2 bg-indigo-600 text-white hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400 mb-4 transition"
      >
        <ArrowLeft size={18} /> Volver a Grupos
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{group.program.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">Grupo: <span className="font-mono">{group.code}</span></p>
        </div>
        <button 
          onClick={() => setIsEnrollModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition active:scale-95"
        >
          + Inscribir
        </button>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button 
          onClick={() => setActiveTab('asistencia')} 
          className={`pb-3 px-4 font-medium transition flex items-center gap-2 
            ${activeTab === 'asistencia' 
              ? 'border-b-2 border-indigo-600 bg-white text-indigo-600 dark:bg-indigo-600 dark:text-gray-200 dark:border-indigo-400' 
              : 'text-white bg-indigo-400 dark:bg-white dark:text-indigo-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          <Users size={18} /> Listado y Asistencia
        </button>
        <button 
          onClick={() => setActiveTab('notas')} 
          className={`pb-3 px-4 font-medium transition flex items-center gap-2
            ${activeTab === 'notas' 
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:bg-indigo-600 dark:text-gray-200 dark:border-indigo-400' 
              : 'text-white bg-indigo-400 dark:bg-white dark:text-indigo-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          <GraduationCap size={18} /> Calificaciones
        </button>
      </div>

      {/* --- VISTA DE ASISTENCIA --- */}
      {activeTab === 'asistencia' && (
        <div className="animate-fade-in">
            <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setIsAttendanceModalOpen(true)} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition active:scale-95"
                >
                    <CheckSquare size={18} /> Pasar Lista Hoy
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 uppercase text-xs font-bold">
                          <tr>
                              <th className="p-4">Estudiante</th>
                              <th className="p-4 text-center">Asistencias</th>
                              <th className="p-4 text-center">Faltas</th>
                              <th className="p-4 text-center">Justificadas</th>
                              <th className="p-4 text-center">Estado</th>
                              <th className="p-4 text-center">Acciones</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {enrollments.map(e => {
                              const absences = e.attendance?.filter((a: any) => a.status === 'A').length || 0;
                              const justified = e.attendance?.filter((a: any) => a.status === 'J').length || 0;
                              const isAtRisk = absences >= 3;
                              return (
                                  <tr key={e._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${e.status === 'Retirado' ? 'bg-red-50 dark:bg-red-900/10 opacity-70' : ''}`}>
                                      <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{e.student.name} {e.student.lastName}</td>
                                      <td className="p-4 text-center text-green-600 dark:text-green-400 font-bold">{e.attendance?.filter((a: any) => a.status === 'P').length || 0}</td>
                                      <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded font-bold ${isAtRisk ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                          {absences}
                                        </span>
                                      </td>
                                      <td className="p-4 text-center text-yellow-600 dark:text-yellow-500 font-bold">{justified}</td>
                                      <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs 
                                          ${e.status === 'Retirado' 
                                            ? 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300' 
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}
                                        >
                                          {e.status}
                                        </span>
                                      </td>
                                      <td className="p-4 text-center">
                                          {e.status !== 'Retirado' && isAtRisk && (
                                              <button 
                                                onClick={() => handleWithdrawStudent(e._id)} 
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded text-xs font-bold flex items-center justify-center gap-1 mx-auto transition" 
                                                title="Retirar"
                                              >
                                                  <UserMinus size={14} /> Retirar
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
                </div>
            </div>
        </div>
      )}

      {/* --- VISTA DE NOTAS MEJORADA --- */}
      {activeTab === 'notas' && (
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map(e => {
                const { total, literal } = calculateTotalAndLiteral(e.grades || []);
                const isComplete = e.grades?.length === 4;

                return (
                    <div key={e._id} className="bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-xl shadow-sm border flex flex-col h-full transition hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="font-bold text-gray-800 dark:text-gray-200 text-lg">{e.student.name} {e.student.lastName}</div>
                            {isComplete ? (
                                <div className={`px-3 py-1 rounded text-sm font-bold 
                                  ${literal === 'F' || literal === 'D' 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
                                >
                                    {literal} ({total})
                                </div>
                            ) : (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded font-medium">
                                  En progreso: {total} pts
                                </span>
                            )}
                        </div>
                        
                        <div className="space-y-2 mb-4 flex-1">
                            {EVALUATION_PLAN.map(plan => {
                                const grade = e.grades?.find((g: any) => g.note === plan.name);
                                return (
                                    <div key={plan.id} className="flex justify-between text-sm items-center border-b border-gray-50 dark:border-gray-700 last:border-0 pb-1.5">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                                          {plan.name} <span className="text-gray-300 dark:text-gray-600">({plan.max})</span>
                                        </span>
                                        {grade ? (
                                            <span className="font-bold text-gray-800 dark:text-white">{grade.value}</span>
                                        ) : (
                                            <span className="text-xs text-gray-300 dark:text-gray-600 italic">-</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {!isComplete && (
                            <button 
                                onClick={() => { setSelectedEnrollmentId(e._id); setIsGradeModalOpen(true); }}
                                className="w-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 py-2.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-sm font-bold flex justify-center gap-2 transition"
                            >
                                <Plus size={16} /> Calificar
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
      )}

      {/* Modal Asistencia */}
      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title="Pasar Lista">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              Marca el estado de los estudiantes para hoy.
            </p>
            {enrollments.filter(e => e.status !== 'Retirado').map(e => (
                <div key={e._id} className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-800 dark:text-gray-200 text-sm">{e.student.name} {e.student.lastName}</span>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => setAttendanceBuffer({...attendanceBuffer, [e._id]: 'P'})} 
                          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs transition
                            ${attendanceBuffer[e._id] === 'P' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'}`}
                        >P</button>
                        <button 
                          onClick={() => setAttendanceBuffer({...attendanceBuffer, [e._id]: 'A'})} 
                          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs transition
                            ${attendanceBuffer[e._id] === 'A' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30'}`}
                        >A</button>
                        <button 
                          onClick={() => setAttendanceBuffer({...attendanceBuffer, [e._id]: 'J'})} 
                          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs transition
                            ${attendanceBuffer[e._id] === 'J' 
                              ? 'bg-yellow-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'}`}
                        >J</button>
                    </div>
                </div>
            ))}
            <button onClick={submitAttendance} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold mt-4 transition shadow-sm active:scale-95">Guardar Asistencia</button>
        </div>
      </Modal>

      {/* Modal Notas Mejorado */}
      <Modal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} title="Registrar Nota">
        <form onSubmit={onAddGrade} className="space-y-5">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-100 dark:border-yellow-900/30">
                Selecciona la evaluación. El sistema validará automáticamente el puntaje máximo permitido.
            </div>
            
            <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">Evaluación</label>
                <select 
                    {...registerGrade("note", {required:true})} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                    <option value="">Seleccionar...</option>
                    {EVALUATION_PLAN.map(plan => (
                        <option key={plan.id} value={plan.name}>
                            {plan.name} (Máx: {plan.max} pts)
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">Puntaje Obtenido</label>
                <div className="relative">
                    <input 
                        type="number" 
                        {...registerGrade("value", {
                            required: true, 
                            min: 0, 
                            max: { value: currentMaxScore, message: `Máximo permitido: ${currentMaxScore}` }
                        })} 
                        placeholder={`0 - ${currentMaxScore}`} 
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                    <span className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 text-sm font-medium">/ {currentMaxScore}</span>
                </div>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-500/30 active:scale-95">
                Guardar Calificación
            </button>
        </form>
      </Modal>

      {/* Modal Enroll */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title="Inscribir Estudiante">
         <form onSubmit={onEnroll} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">ESTUDIANTE DISPONIBLE</label>
              <select 
                {...registerEnroll("studentId", {required:true})} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                  <option value="">Seleccionar Estudiante...</option>
                  {availableStudents.map(s => <option key={s._id} value={s._id}>{s.name} {s.lastName}</option>)}
              </select>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm active:scale-95">Inscribir</button>
         </form>
      </Modal>
    </div>
  );
};