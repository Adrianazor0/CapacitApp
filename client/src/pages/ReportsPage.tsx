import { useState, useEffect } from 'react';
import { getPaymentsReportRequest, getDebtorsReportRequest } from '../api/reports';
import { DollarSign, Printer, Search, FileText, AlertCircle, Calendar } from 'lucide-react';

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
    <div className="space-y-8 animate-fade-in-up w-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reportes Detallados</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Consulta histórica y auditoría financiera</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-indigo-600 dark:bg-gray-700 text-white dark:text-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 transition print:hidden font-medium"
        >
          <Printer size={20} /> Imprimir Reporte
        </button>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('ingresos')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition border-b-2
            ${activeTab === 'ingresos' 
              ? 'border-indigo-600 text-indigo-600 dark:bg-indigo-600 dark:border-indigo-400 dark:text-white' 
              : 'border-transparent bg-indigo-600 text-white dark:bg-white dark:text-indigo-600 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
          <FileText size={18} /> Reporte de Ingresos
        </button>
        <button 
          onClick={() => setActiveTab('deudores')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition border-b-2
            ${activeTab === 'deudores' 
              ? 'border-indigo-600 text-indigo-600 dark:bg-indigo-600 dark:border-indigo-400 dark:text-white' 
              : 'border-transparent bg-indigo-600 text-white dark:bg-white dark:text-indigo-600 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
          <AlertCircle size={18} /> Cartera / Deudores
        </button>
      </div>

      {/* --- REPORTE DE INGRESOS --- */}
      {activeTab === 'ingresos' && (
        <div className="animate-fade-in space-y-6">
          
          {/* Barra de Filtros */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-end gap-4 print:hidden transition-colors">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Fecha Inicio</label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Fecha Fin</label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
              </div>
            </div>
            <button 
              onClick={loadPayments}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 h-[38px] font-medium transition active:scale-95 shadow-sm"
            >
              <Search size={18} /> Filtrar
            </button>
          </div>

          {/* Tarjeta de Total */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-5 rounded-xl flex justify-between items-center transition-colors">
            <span className="text-green-800 dark:text-green-300 font-medium flex items-center gap-2">
              <DollarSign size={24} className="bg-green-200 dark:bg-green-800 p-1 rounded-full" /> 
              Total Recaudado (Selección):
            </span>
            <span className="text-3xl font-bold text-green-700 dark:text-green-400">${totalIngresos.toLocaleString()}</span>
          </div>

          {/* Tabla de Resultados */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                    <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Estudiante</th>
                    <th className="p-4">Concepto / Grupo</th>
                    <th className="p-4">Método</th>
                    <th className="p-4 text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="p-4 whitespace-nowrap">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium">
                            <div className="text-gray-900 dark:text-white">{p.enrollment?.student?.name} {p.enrollment?.student?.lastName}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{p.enrollment?.student?.documentId}</div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">
                            {p.enrollment?.group?.program?.name} 
                            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded ml-2 font-mono">
                                {p.enrollment?.group?.code}
                            </span>
                        </td>
                        <td className="p-4">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{p.method}</span>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900 dark:text-white">+${p.amount}</td>
                    </tr>
                    ))}
                    {payments.length === 0 && (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 dark:text-gray-500 italic">No hay pagos registrados en este rango de fechas.</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      )}

      {/* --- REPORTE DE DEUDORES --- */}
      {activeTab === 'deudores' && (
        <div className="animate-fade-in space-y-6">
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-5 rounded-xl flex justify-between items-center transition-colors">
            <span className="text-red-800 dark:text-red-300 font-medium flex items-center gap-2">
              <AlertCircle size={24} className="bg-red-200 dark:bg-red-800 p-1 rounded-full" /> 
              Cartera Vencida Total:
            </span>
            <span className="text-3xl font-bold text-red-700 dark:text-red-400">${totalCartera.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                    <tr>
                    <th className="p-4">Estudiante</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Programa / Grupo</th>
                    <th className="p-4 text-right">Costo Total</th>
                    <th className="p-4 text-right">Pagado</th>
                    <th className="p-4 text-right text-red-600 dark:text-red-400">Deuda Pendiente</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {debtors.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{d.studentName}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400">
                            <div>{d.studentEmail}</div>
                            <div className="text-xs mt-0.5">{d.studentPhone || 'Sin teléfono'}</div>
                        </td>
                        <td className="p-4">
                            {d.programName} <br/>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{d.groupCode}</span>
                        </td>
                        <td className="p-4 text-right font-mono">${d.cost}</td>
                        <td className="p-4 text-right text-green-600 dark:text-green-400 font-mono">${d.totalPaid}</td>
                        <td className="p-4 text-right">
                            <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold px-2 py-1 rounded font-mono">
                                ${d.debt}
                            </span>
                        </td>
                    </tr>
                    ))}
                    {debtors.length === 0 && (
                        <tr><td colSpan={6} className="p-10 text-center text-gray-400 dark:text-gray-500 italic">¡Excelente! No hay deudores registrados.</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};