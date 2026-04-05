import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_impresiones: 0,
    total_clics: 0,
    avg_ctr: 0,
    total_ingresos: 0
  });
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('activo');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await axios.get(`${API_URL}/stats/dashboard/summary`, {
            headers: { 'x-auth-token': token }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const data = {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Ingresos ($)',
      data: [120, 190, 150, 250, 200, 300, 450], // Estos datos vendrán de una consulta histórica más adelante
      borderColor: '#3b82f6',
      tension: 0.3,
    }]
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Cargando métricas...</div>;

  return (
    <div className="space-y-8">
      {subscriptionStatus === 'suspendido' && (
        <div className="bg-red-600 p-4 rounded-lg flex justify-between items-center animate-pulse">
            <span className="font-bold">⚠️ Tu suscripción ha vencido. El rastreo de datos está suspendido.</span>
            <button className="bg-white text-red-600 px-4 py-1 rounded font-bold hover:bg-slate-100">Pagar Ahora</button>
        </div>
      )}

      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Global</h1>
        <button className="bg-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Añadir Dominio</button>
      </header>

      {/* Métricas Reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Impresiones" value={stats.total_impresiones || 0} color="blue" />
        <StatCard title="Clics" value={stats.total_clics || 0} color="emerald" />
        <StatCard title="CTR" value={`${parseFloat(stats.avg_ctr || 0).toFixed(2)}%`} color="amber" />
        <StatCard title="Ingresos" value={`$${parseFloat(stats.total_ingresos || 0).toFixed(2)}`} color="blue" />
      </div>

      {/* Gráfica */}
      <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Evolución de Ingresos</h3>
        <div className="h-80">
          <Line data={data} options={{ maintainAspectRatio: false, responsive: true }} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 hover:border-blue-500 transition-all shadow-lg">
    <p className="text-slate-400 text-sm font-medium">{title}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

export default Dashboard;
