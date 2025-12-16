import { useEffect, useState } from 'react';
import { getDashboardStatsRequest } from '../api/reports';
import type { DashboardStats } from '../api/reports';
import {
  Users, BookOpen, DollarSign, TrendingUp,
  Activity, Calendar, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); 

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getDashboardStatsRequest();
        setStats(res.data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando métricas...</div>;
  if (!stats) return <div>Error al cargar datos.</div>;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500">Resumen general de la academia</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-full bg-blue-100 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Estudiantes Activos</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-full bg-indigo-100 text-indigo-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Grupos Abiertos</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.activeGroups}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-full bg-green-100 text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recaudo Total</p>
            <h3 className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-full bg-red-100 text-red-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cartera / Deuda</p>
            <h3 className="text-2xl font-bold text-gray-800">${stats.totalDebt.toLocaleString()}</h3>
            <p className="text-xs text-red-400">Pendiente de cobro</p>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Pagos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Actividad */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b flex items-center gap-2">
            <Activity size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-700">Últimos Pagos Registrados</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4">Estudiante</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Método</th>
                  <th className="p-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentPayments.length > 0 ? stats.recentPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">
                      {payment.enrollment?.student ?
                        `${payment.enrollment.student.name} ${payment.enrollment.student.lastName}` :
                        'Estudiante eliminado'}
                    </td>
                    <td className="p-4 text-gray-500 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <CreditCard size={14} /> {payment.method}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-green-600">
                      +${payment.amount}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      No hay actividad reciente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Lateral Informativo */}
        <div className="bg-indigo-600 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>

          <div>
            <h3 className="text-xl font-bold mb-2">Estado del Sistema</h3>
            <p className="text-indigo-100 text-sm mb-6">
              Tu sistema está operando correctamente. Recuerda revisar la cartera pendiente a fin de mes.
            </p>

            <div className="space-y-4">
              <div className="bg-indigo-700 bg-opacity-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm">Base de Datos</span>
                <span className="text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full font-bold">Conectada</span>
              </div>
              <div className="bg-indigo-700 bg-opacity-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm">Versión API</span>
                <span className="text-xs font-mono opacity-75">v1.0.0</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/reports')}
            className="mt-6 w-full bg-white text-indigo-700 ..."
          >
            Ver Reportes Completos
          </button>
        </div>
      </div>
    </div>
  );
};
