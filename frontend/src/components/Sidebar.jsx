import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-[#0f172a] border-r border-slate-800 p-6 flex flex-col gap-8">
      <div className="text-2xl font-bold text-blue-500">DomainStats</div>
      
      <nav className="flex flex-col gap-4">
        <Link to="/" className="hover:text-blue-400 transition-colors">Dashboard</Link>
        <Link to="/perfil" className="hover:text-blue-400 transition-colors">Mi Perfil</Link>
        <Link to="/stats" className="hover:text-blue-400 transition-colors">Mis Estadísticas</Link>
        <Link to="/soporte" className="hover:text-blue-400 transition-colors">Soporte</Link>
      </nav>

      <div className="mt-auto">
        <button className="text-red-400 hover:text-red-500">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default Sidebar;
