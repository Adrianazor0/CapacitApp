import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getGroupFinancialsRequest, enrollStudentRequest, addPaymentRequest } from '../api/finance';
import { getGroupsRequest } from '../api/groups';
import { getStudentsRequest } from '../api/students';
import { getProgramsRequest } from '../api/programs';
import type { Group, Enrollment, Student } from '../types';
import { Modal } from '../components/ui/Modal';
import { DollarSign, Users, ArrowLeft, CreditCard, Plus } from 'lucide-react';
import { addGradeRequest } from '../api/finance';
import { GraduationCap } from 'lucide-react';

export const GroupDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [group, setGroup] = useState<Group | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const { register: registerEnroll, handleSubmit: handleEnroll, reset: resetEnroll } = useForm();
    const { register: registerPay, handleSubmit: handlePay, reset: resetPay } = useForm();
    const { register: registerGrade, handleSubmit: handleGrade, reset: resetGrade } = useForm();

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [groupsRes, financeRes, studentsRes, programsRes] = await Promise.all([
                getGroupsRequest(),
                getGroupFinancialsRequest(id),
                getStudentsRequest(),
                getProgramsRequest()
            ]);

            const foundGroup = groupsRes.data.find(g => g._id === id);

            if (foundGroup) {
                if (!foundGroup.program.cost) {
                    const fullProgram = programsRes.data.find(p => p._id === foundGroup.program._id);
                    if (fullProgram) {
                        foundGroup.program.cost = fullProgram.cost;
                    }
                }
            }

            setGroup(foundGroup || null);
            const currentEnrollments = financeRes.data;
            setEnrollments(currentEnrollments);

            const allStudents = studentsRes.data;
            const enrolledStudentIds = new Set(currentEnrollments.map(e => e.student._id));
            const available = allStudents.filter(s =>
                s.isActive && !enrolledStudentIds.has(s._id)
            );

            setAvailableStudents(available);

        } catch (error) {
            console.error("Error cargando detalles del grupo", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id]);

    const onEnroll = handleEnroll(async (data) => {
        if (!id) return;
        try {
            await enrollStudentRequest({ studentId: data.studentId, groupId: id });
            setIsEnrollModalOpen(false);
            resetEnroll();
            loadData();
            alert("Estudiante inscrito correctamente");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Error al inscribir";
            alert(`Error: ${msg}`);
        }
    });

    const onAddGrade = handleGrade(async (data) => {
        try {
            await addGradeRequest({
                enrollmentId: selectedEnrollmentId,
                note: data.note,
                value: Number(data.value)
            });
            setIsGradeModalOpen(false);
            resetGrade();
            loadData();
            alert("Nota registrada correctamente");
        } catch (error) {
            alert("Error al registrar nota");
        }
    });

    const onPay = handlePay(async (data) => {
        try {
            console.log("Enviando pago...", {
                enrollmentId: selectedEnrollmentId,
                amount: Number(data.amount),
                method: data.method
            });

            await addPaymentRequest({
                enrollmentId: selectedEnrollmentId,
                amount: Number(data.amount),
                method: data.method
            });
            setIsPayModalOpen(false);
            resetPay();
            loadData();
            alert("Pago registrado con éxito");
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Error desconocido al registrar pago";
            alert(`No se pudo registrar el pago: ${msg}`);
        }
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando gestión del grupo...</div>;
    if (!group) return <div className="p-8 text-center text-red-500">Grupo no encontrado.</div>;

    const programCost = group.program.cost || 0;

    return (
        <div>
            <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-4 transition">
                <ArrowLeft size={18} /> Volver a Grupos
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{group.program.name}</h1>
                    <p className="text-gray-500">Grupo: {group.code} | Costo: <span className="font-bold text-indigo-600">${programCost}</span></p>
                </div>
                <button
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm"
                >
                    <Plus size={20} /> Inscribir Estudiante
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
                    <Users size={18} className="text-gray-500" />
                    <span className="font-semibold text-gray-700">Listado de Estudiantes y Estado de Cuenta</span>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white text-gray-600 text-sm border-b">
                        <tr>
                            <th className="p-4">Estudiante</th>
                            <th className="p-4 text-right">Pagado</th>
                            <th className="p-4 text-right">Deuda</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {enrollments.map(enrol => {
                            const debt = programCost - enrol.totalPaid;
                            const isPaidOff = debt <= 0;

                            return (
                                <tr key={enrol._id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{enrol.student.name} {enrol.student.lastName}</div>
                                        <div className="text-xs text-gray-400">{enrol.student.email}</div>
                                    </td>
                                    <td className="p-4 text-right text-green-600 font-medium">
                                        ${enrol.totalPaid}
                                    </td>
                                    <td className="p-4 text-right text-red-500 font-bold">
                                        ${debt > 0 ? debt : 0}
                                    </td>
                                    <td className="p-4 text-center">
                                        {isPaidOff ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Paz y Salvo</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">Pendiente</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {!isPaidOff && (
                                            <button
                                                onClick={() => {
                                                    setSelectedEnrollmentId(enrol._id);
                                                    setIsPayModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 w-full"
                                            >
                                                <DollarSign size={16} /> Abonar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedEnrollmentId(enrol._id);
                                                setIsGradeModalOpen(true);
                                            }}
                                            className="text-purple-600 hover:bg-purple-50 p-2 rounded-lg text-sm font-medium flex flex-col items-center justify-center "
                                            title="Agregar Nota"
                                        >
                                            <GraduationCap size={16} /> Agregar Nota
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {enrol.grades?.map((g, i) => (
                                                <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded" title={g.note}>
                                                    {g.value}
                                                </span>
                                            ))}
                                            {(!enrol.grades || enrol.grades.length === 0) && <span className="text-xs text-gray-400">-</span>}
                                        </div>
                                    </td>
                                </tr>

                            );
                        })}
                        {enrollments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No hay estudiantes inscritos en este grupo aún.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Inscribir */}
            <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title="Inscribir Estudiante">
                <form onSubmit={onEnroll} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Seleccionar Estudiante</label>
                        <select {...registerEnroll("studentId", { required: true })} className="w-full border p-2 rounded mt-1">
                            <option value="">Buscar...</option>
                            {availableStudents.map(s => (
                                <option key={s._id} value={s._id}>{s.name} {s.lastName} - {s.documentId}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            {availableStudents.length === 0
                                ? "No hay estudiantes disponibles para inscribir."
                                : "Solo se muestran estudiantes activos y no inscritos."}
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={availableStudents.length === 0}
                        className={`w-full text-white p-2 rounded font-bold ${availableStudents.length === 0 ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        Confirmar Inscripción
                    </button>
                </form>
            </Modal>

            {/* Modal Pagar */}
            <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Registrar Pago">
                <form onSubmit={onPay} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Monto a Abonar ($)</label>
                        <input
                            type="number"
                            {...registerPay("amount", { required: true, min: 1 })}
                            className="w-full border p-2 rounded mt-1 text-lg font-bold text-gray-800"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Método de Pago</label>
                        <select {...registerPay("method", { required: true })} className="w-full border p-2 rounded mt-1">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                            <option value="Transferencia">Transferencia Bancaria</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 flex justify-center gap-2">
                        <CreditCard size={20} /> Procesar Pago
                    </button>
                </form>
            </Modal>


            <Modal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} title="Registrar Calificación">
                <form onSubmit={onAddGrade} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Concepto</label>
                        <input
                            {...registerGrade("note", { required: true })}
                            className="w-full border p-2 rounded mt-1"
                            placeholder="Ej. Parcial 1, Examen Final..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Calificación (0-100)</label>
                        <input
                            type="number"
                            {...registerGrade("value", { required: true, min: 0, max: 100 })}
                            className="w-full border p-2 rounded mt-1 font-bold"
                            placeholder="0"
                        />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded font-bold hover:bg-purple-700 flex justify-center gap-2">
                        <GraduationCap size={20} /> Guardar Nota
                    </button>
                </form>
            </Modal>
        </div>
    );
};