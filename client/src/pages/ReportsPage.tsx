import { useState, useEffect } from 'react';
import { getPaymentsReportRequest, getDebtorsReportRequest } from '../api/reports';
import { DollarSign, Printer, Search, FileText, AlertCircle } from 'lucide-react';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'ingresos' | 'deudores'>('ingresos');
  
  const [payments, setPayments] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Hoy
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);     // Hoy
  
  const [debtors, setDebtors] = useState<any[]>([]);

  const loadPayments = async () => {
    try {
      const res = await getPaymentsReportRequest(startDate, endDate);
      setPayments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDebtors = async () => {
    try {
      const res = await getDebtorsReportRequest();
      setDebtors(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === 'ingresos') loadPayments();
    else loadDebtors();
  }, [activeTab]);

  const totalIngresos = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCartera = debtors.reduce((acc, d) => acc + d.debt, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reportes Detallados</h1>
          <p className="text-gray-500">Consulta histórica y auditoría financiera</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition print:hidden"
        >
          <Printer size={20} /> Imprimir Reporte
        </button>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('ingresos')}
          className={`pb-3 px-4 font-medium flex items-center gap-2 transition ${
            activeTab === 'ingresos' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} /> Reporte de Ingresos
        </button>
        <button 
          onClick={() => setActiveTab('deudores')}
          className={`pb-3 px-4 font-medium flex items-center gap-2 transition ${
            activeTab === 'deudores' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertCircle size={18} /> Cartera / Deudores
        </button>
      </div>

      {activeTab === 'ingresos' && (
        <div className="animate-fade-in-up space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap items-end gap-4 print:hidden">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Desde</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Hasta</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded-lg text-sm"
              />
            </div>
            <button 
              onClick={loadPayments}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 h-10"
            >
              <Search size={18} /> Filtrar
            </button>
          </div>

          <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center">
            <span className="text-green-800 font-medium flex items-center gap-2">
              <DollarSign size={20} /> Total Recaudado (Selección):
            </span>
            <span className="text-2xl font-bold text-green-700">${totalIngresos.toLocaleString()}</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Estudiante</th>
                  <th className="p-4">Concepto / Grupo</th>
                  <th className="p-4">Método</th>
                  <th className="p-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="p-4">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium">
                      {p.enrollment?.student?.name} {p.enrollment?.student?.lastName}
                      <div className="text-xs text-gray-400">{p.enrollment?.student?.documentId}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {p.enrollment?.group?.program?.name} <br/>
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-1 rounded">
                        {p.enrollment?.group?.code}
                      </span>
                    </td>
                    <td className="p-4">{p.method}</td>
                    <td className="p-4 text-right font-bold text-gray-800">${p.amount}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">No hay pagos en este rango.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'deudores' && (
        <div className="animate-fade-in-up space-y-6">
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex justify-between items-center">
            <span className="text-red-800 font-medium flex items-center gap-2">
              <AlertCircle size={20} /> Cartera Vencida Total:
            </span>
            <span className="text-2xl font-bold text-red-700">${totalCartera.toLocaleString()}</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">Estudiante</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Programa / Grupo</th>
                  <th className="p-4 text-right">Costo Total</th>
                  <th className="p-4 text-right">Pagado</th>
                  <th className="p-4 text-right text-red-600">Deuda Pendiente</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {debtors.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{d.studentName}</td>
                    <td className="p-4 text-gray-500">
                      <div>{d.studentEmail}</div>
                      <div className="text-xs">{d.studentPhone}</div>
                    </td>
                    <td className="p-4">
                      {d.programName} <br/>
                      <span className="text-xs text-gray-400">{d.groupCode}</span>
                    </td>
                    <td className="p-4 text-right">${d.cost}</td>
                    <td className="p-4 text-right text-green-600">${d.totalPaid}</td>
                    <td className="p-4 text-right font-bold text-red-600 bg-red-50">${d.debt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};