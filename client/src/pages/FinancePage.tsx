import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getStudentsRequest } from '../api/students';
import { addPaymentRequest } from '../api/finance';
import type { Student } from '../types';
import { Modal } from '../components/ui/Modal';
import { Search, CreditCard, DollarSign, User, CheckCircle } from 'lucide-react';
import client from '../api/axios'; // Necesitaremos llamar a un endpoint custom para traer deudas del estudiante

export const FinancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]); // Enrollments poblados
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  const { register, handleSubmit, reset } = useForm();

  // 1. Cargar Estudiantes para el buscador
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await getStudentsRequest();
        setStudents(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadStudents();
  }, []);

  // 2. Buscar Estudiantes (Filtrado)
  const filteredStudents = students.filter(s => 
    searchTerm && (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.documentId.includes(searchTerm)
    )
  );

  // 3. Cargar Deudas de un Estudiante
  const selectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setSearchTerm(''); // Limpiar búsqueda
    try {
      // Endpoint improvisado: Usamos el reporte de deudores y filtramos, 
      // o idealmente crearíamos un endpoint `GET /finance/student/:id`
      // Por ahora, usaremos una llamada directa a enrollments filtrando en cliente (menos eficiente pero rápido)
      // O MEJOR: Reutilicemos getGroupFinancialsRequest iterando? No.
      // Vamos a crear un fetch custom rápido aquí o asumir que el backend tiene endpoint.
      // Usemos el endpoint de reportes de deudores que ya tenemos y filtremos:
      const res = await client.get('/reports/debtors'); 
      const myDebts = res.data.filter((d: any) => d.studentEmail === student.email); // Usamos email como ID único temp
      
      // NOTA: El endpoint de deudores es una agregación, no devuelve el ID del enrollment para pagar.
      // NECESITAMOS UN ENDPOINT NUEVO EN BACKEND PARA ESTO: "Obtener Inscripciones por Estudiante"
      // Como workaround rápido para no tocar backend ahora:
      // Vamos a buscar en TODOS los grupos (ineficiente) o pedirle al usuario seleccionar grupo.
      // SOLUCIÓN CORRECTA: Vamos a agregar un endpoint rápido en el frontend que busque el enrollment ID.
      // O asumimos que tenemos el ID en el reporte de deudores (deberíamos agregarlo en Fase 13).
      
      // SIMULACIÓN (Para que funcione ya): 
      // Vamos a suponer que el endpoint de reportes ahora devuelve enrollmentId.
      // (Si no, deberías agregar `enrollmentId: '$_id'` en el $project del controller getDebtorsReport)
      
      setStudentEnrollments(myDebts);
    } catch (error) {
      console.error(error);
    }
  };
  
  // FIX RÁPIDO: Para que esto funcione bien, necesitamos actualizar el Backend Report Controller
  // Agrega "enrollmentId: '$_id'" en el $project de getDebtorsReport en server/src/controllers/report.controller.ts

  const onPay = handleSubmit(async (data) => {
    try {
      await addPaymentRequest({ 
        enrollmentId: selectedEnrollment.enrollmentId || selectedEnrollment._id, // Ajustar según backend
        amount: Number(data.amount), 
        method: data.method 
      });
      setIsPayModalOpen(false);
      reset();
      alert("Pago registrado con éxito");
      if (selectedStudent) selectStudent(selectedStudent); // Recargar
    } catch (error) {
      alert("Error al pagar");
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Caja y Facturación</h1>

      {/* Buscador Central */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Estudiante a Cobrar</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
            placeholder="Nombre o Cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Resultados de Búsqueda Flotantes */}
        {searchTerm && (
          <div className="mt-2 border rounded-lg overflow-hidden bg-white shadow-lg absolute w-full max-w-3xl z-10">
            {filteredStudents.map(s => (
              <button 
                key={s._id}
                onClick={() => selectStudent(s)}
                className="w-full text-left p-3 hover:bg-indigo-50 flex justify-between items-center border-b last:border-0"
              >
                <div>
                  <p className="font-bold text-gray-800">{s.name} {s.lastName}</p>
                  <p className="text-xs text-gray-500">{s.documentId}</p>
                </div>
                <User size={18} className="text-indigo-400" />
              </button>
            ))}
            {filteredStudents.length === 0 && <div className="p-3 text-gray-400 text-sm">No encontrado.</div>}
          </div>
        )}
      </div>

      {/* Panel del Estudiante Seleccionado */}
      {selectedStudent && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
              {selectedStudent.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name} {selectedStudent.lastName}</h2>
              <p className="text-sm text-indigo-600">{selectedStudent.documentId} | {selectedStudent.email}</p>
            </div>
          </div>

          <h3 className="font-bold text-gray-700 mb-3">Estados de Cuenta Activos</h3>
          
          <div className="grid gap-4">
            {studentEnrollments.length > 0 ? studentEnrollments.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{item.programName}</h4>
                  <p className="text-sm text-gray-500">Grupo: {item.groupCode}</p>
                  <div className="mt-2 text-sm">
                    <span className="mr-3">Costo: <b>${item.cost}</b></span>
                    <span className="text-green-600 mr-3">Pagado: <b>${item.totalPaid}</b></span>
                    <span className="text-red-600">Debe: <b>${item.debt}</b></span>
                  </div>
                </div>
                
                {item.debt > 0 ? (
                  <button 
                    onClick={() => {
                      setSelectedEnrollment(item);
                      setIsPayModalOpen(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm"
                  >
                    <DollarSign size={18} /> Cobrar
                  </button>
                ) : (
                  <div className="text-green-600 flex items-center gap-1 font-bold bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle size={18} /> Pagado
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                Este estudiante no tiene deudas pendientes registradas en el reporte de morosos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Pago (Reutilizado) */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Registrar Pago en Caja">
        <form onSubmit={onPay} className="space-y-4">
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-600 mb-4">
            Recibiendo pago para: <br/>
            <strong>{selectedEnrollment?.programName}</strong>
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700">Monto a Recibir ($)</label>
            <input 
              type="number" 
              {...register("amount", {required:true, min: 1})} 
              className="w-full border-2 border-indigo-100 p-3 rounded-lg mt-1 text-2xl font-bold text-gray-800 outline-none focus:border-indigo-500 transition"
              placeholder="0.00"
              autoFocus
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Método de Pago</label>
            <select {...register("method", {required:true})} className="w-full border p-2 rounded mt-1">
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
              <option value="Transferencia">Transferencia Bancaria</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 flex justify-center gap-2 mt-4">
            <CreditCard size={20} /> Confirmar Pago
          </button>
        </form>
      </Modal>
    </div>
  );
};
