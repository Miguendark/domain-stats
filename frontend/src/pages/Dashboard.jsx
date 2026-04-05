import { useState } from 'react';
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

const Dashboard = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState('activo'); // Esto vendría de la API

  const data = {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Ingresos ($)',
      data: [120, 190, 150, 250, 200, 300, 450],
      borderColor: '#3b82f6',
      tension: 0.3,
    }]
  };

  return (
    <div className="space-y-8">
      {subscriptionStatus === 'suspendido' && (
        <div className="bg-red-600 p-4 rounded-lg flex justify-between items-center animate-pulse">
            <span className="font-bold">⚠️ Tu suscripción ha vencido. El rastreo de datos está suspendido.</span>
            <button className="bg-white text-red-600 px-4 py-1 rounded font-bold hover:bg-slate-100">Pagar Ahora</button>
        </div>
      )}

      {subscriptionStatus === 'advertencia' && (
        <div className="bg-amber-500 p-4 rounded-lg flex justify-between items-center text-slate-900">
            <span className="font-bold">ℹ️ Tu suscripción vence en 3 días. Por favor, revisa tus métodos de pago.</span>
            <button className="bg-slate-900 text-white px-4 py-1 rounded font-bold hover:bg-slate-800">Renovar</button>
        </div>
      )}

      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Global</h1>
        <button className="bg-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Añadir Dominio</button>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Impresiones" value="1.2M" color="blue" />
        <StatCard title="Clics" value="45.3K" color="emerald" />
        <StatCard title="CTR" value="3.7%" color="amber" />
        <StatCard title="Ingresos" value="$12,450" color="blue" />
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
