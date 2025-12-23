 import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getStudentsRequest } from '../api/students';
import { addPaymentRequest, getRecentTransactionsRequest } from '../api/finance';
import type { Student } from '../types';
import { Modal } from '../components/ui/Modal';
import { 
  Search, CreditCard, DollarSign, User, CheckCircle, 
  History, TrendingUp, Calendar, ArrowRight, XCircle
} from 'lucide-react';
import client from '../api/axios';

export const FinancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  const { register, handleSubmit, reset } = useForm();

  // Carga inicial
  useEffect(() => {
    const init = async () => {
      try {
        const [studentsRes, transRes] = await Promise.all([
            getStudentsRequest(),
            getRecentTransactionsRequest()
        ]);
        setStudents(studentsRes.data);
        setRecentTransactions(transRes.data);
      } catch (error) { console.error(error); }
    };
    init();
  }, []);

  // Filtro de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
        setFilteredStudents([]);
        return;
    }
    const results = students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.documentId.includes(searchTerm)
    ).slice(0, 5); // Limitar a 5 resultados
    setFilteredStudents(results);
  }, [searchTerm, students]);

  const selectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setSearchTerm('');
    setFilteredStudents([]);
    try {
      // Nota: Idealmente usar un endpoint dedicado. Aquí reutilizamos el reporte de deudores.
      const res = await client.get('/reports/debtors'); 
      const myDebts = res.data.filter((d: any) => d.studentEmail === student.email);
      setStudentEnrollments(myDebts);
    } catch (error) { console.error(error); }
  };

  const onPay = handleSubmit(async (data) => {
    try {
      await addPaymentRequest({ 
        enrollmentId: selectedEnrollment.enrollmentId || selectedEnrollment._id,
        amount: Number(data.amount), 
        method: data.method 
      });
      setIsPayModalOpen(false);
      reset();
      alert("Pago exitoso");
      
      // Recargar datos
      if (selectedStudent) selectStudent(selectedStudent);
      const transRes = await getRecentTransactionsRequest();
      setRecentTransactions(transRes.data);
      
    } catch (error) { alert("Error al procesar pago"); }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      
      {/* COLUMNA IZQUIERDA: CAJA Y COBROS */}
      <div className="lg:col-span-2 space-y-8">
        
        <header>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <CreditCard className="text-indigo-600 dark:text-indigo-400" /> Terminal de Caja
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Procesa pagos y consulta estados de cuenta.</p>
        </header>

        {/* Buscador Estilizado */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700 relative z-20 transition-colors">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Cliente / Estudiante</label>
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-indigo-400" size={20} />
                <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 border focus:border-indigo-500 rounded-xl outline-none transition font-medium text-gray-700 dark:text-indigo-600 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Buscar por nombre, apellido o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Dropdown de Resultados */}
            {filteredStudents.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up z-30">
                    {filteredStudents.map(s => (
                        <button 
                            key={s._id}
                            onClick={() => selectStudent(s)}
                            className="w-full text-left p-4 hover:bg-indigo-50 dark:hover:bg-gray-700/50 flex items-center gap-4 transition border-b dark:border-gray-700 last:border-0"
                        >
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                                {s.name[0]}{s.lastName[0]}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-indigo-600">{s.name} {s.lastName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{s.documentId}</p>
                            </div>
                            <ArrowRight size={16} className="ml-auto text-gray-300 dark:text-gray-600" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Estado de Cuenta del Estudiante Seleccionado */}
        {selectedStudent ? (
            <div className="animate-fade-in space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Cuentas por Cobrar de <span className="text-indigo-600 dark:text-indigo-400">{selectedStudent.name}</span></h3>
                    <button onClick={() => setSelectedStudent(null)} className="text-sm text-red-500 hover:text-red-400 hover:underline flex items-center gap-1">
                        <XCircle size={14} /> Limpiar
                    </button>
                </div>

                {studentEnrollments.length > 0 ? studentEnrollments.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition">
                        <div>
                            <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded mb-2 inline-block font-mono">
                                {item.groupCode}
                            </span>
                            <h4 className="font-bold text-gray-800 dark:text-white text-lg">{item.programName}</h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex gap-4">
                                <span>Total: ${item.cost}</span>
                                <span className="text-green-600 dark:text-green-400">Abonado: ${item.totalPaid}</span>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2 w-full sm:w-auto">
                            {item.debt > 0 ? (
                                <>
                                    <div className="text-red-600 dark:text-red-400 font-bold text-xl">${item.debt}</div>
                                    <span className="text-xs text-red-400 dark:text-red-300/70">Pendiente</span>
                                    <button 
                                        onClick={() => { setSelectedEnrollment(item); setIsPayModalOpen(true); }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition w-full sm:w-auto flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <DollarSign size={18} /> Cobrar
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-100 dark:border-green-900/30">
                                    <CheckCircle size={24} className="mb-1" />
                                    <span className="font-bold text-sm">Pagado</span>
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500">
                        Este estudiante no tiene deudas pendientes registradas.
                    </div>
                )}
            </div>
        ) : (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-8 text-center transition-colors">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-500 dark:text-indigo-400">
                    <User size={32} />
                </div>
                <h3 className="text-indigo-900 dark:text-indigo-300 font-bold">Esperando Cliente</h3>
                <p className="text-indigo-600 dark:text-indigo-400/70 text-sm mt-2">Busca un estudiante arriba para ver su estado de cuenta.</p>
            </div>
        )}

      </div>

      {/* COLUMNA DERECHA: HISTORIAL Y MÉTRICAS */}
      <div className="space-y-6">
        
        {/* Tarjeta de Resumen Rápido */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Efecto de fondo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            
            <div className="flex items-center gap-3 mb-4 opacity-90">
                <TrendingUp size={20} />
                <span className="font-medium">Caja del Día</span>
            </div>
            {/* Valor calculado */}
            <div className="text-4xl font-bold mb-2">
                ${recentTransactions.filter(t => new Date(t.date).getDate() === new Date().getDate()).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-indigo-200 text-sm">Recaudo procesado hoy</p>
        </div>

        {/* Historial de Transacciones */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <History size={18} /> Últimos Movimientos
                </h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                {recentTransactions.map((t, i) => (
                    <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                                {t.enrollment?.student?.name} {t.enrollment?.student?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t.enrollment?.group?.program?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                                    {t.method}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(t.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-sm">
                            +${t.amount}
                        </span>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* Modal de Pago Estilizado */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Procesar Pago">
        <form onSubmit={onPay} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold mb-1">Concepto</p>
            <p className="text-gray-800 dark:text-white font-medium">{selectedEnrollment?.programName}</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-mono">{selectedEnrollment?.groupCode}</p>
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">Monto a Recibir</label>
            <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 dark:text-gray-500 font-bold">$</span>
                <input 
                  type="number" 
                  {...register("amount", {required:true, min: 1})} 
                  className="w-full pl-8 pr-4 py-3 border-2 border-indigo-100 dark:border-gray-600 dark:bg-gray-700 rounded-xl text-2xl font-bold text-gray-800 dark:text-white outline-none focus:border-indigo-500 transition"
                  placeholder="0.00"
                  autoFocus
                />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
                {['Efectivo', 'Tarjeta', 'Transferencia'].map(m => (
                    <label key={m} className="cursor-pointer">
                        <input type="radio" value={m} {...register("method", {required:true})} className="peer sr-only" />
                        <div className="text-center p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/30 peer-checked:border-indigo-500 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300 transition text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600">
                            {m}
                        </div>
                    </label>
                ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold flex justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-none transition transform active:scale-95">
            <CheckCircle size={20} /> Confirmar Transacción
          </button>
        </form>
      </Modal>

    </div>
  );
};