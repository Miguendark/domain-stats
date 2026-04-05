import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Datos API, 2: Pago
    const [formData, setFormData] = useState({
        nombre: '', correo: '', password: '', 
        api_client_id: '', api_client_secret: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAPIValidation = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/register`, formData);
            localStorage.setItem('tempToken', res.data.token);
            setStep(2); 
        } catch (err) {
            setError(err.response?.data?.error || 'Error al validar API');
        }
    };

    const handlePayment = async (plan) => {
        const token = localStorage.getItem('tempToken');
        try {
            await axios.post(`${API_URL}/payments/confirm`, 
                { plan, session_id: 'fake_stripe_id' },
                { headers: { 'x-auth-token': token } }
            );
            alert('¡Cuenta activada con éxito!');
            navigate('/login');
        } catch (err) {
            setError('Error al procesar el pago');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
            <div className="bg-[#0f172a] p-8 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-6">Unirse a DomainStats</h2>
                {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
                {step === 1 ? (
                    <form onSubmit={handleAPIValidation} className="space-y-4">
                        <input type="text" placeholder="Nombre completo" className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-blue-500 outline-none" 
                            onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                        <input type="email" placeholder="Correo electrónico" className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-blue-500 outline-none"
                            onChange={e => setFormData({...formData, correo: e.target.value})} required />
                        <input type="password" placeholder="Contraseña" className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-blue-500 outline-none"
                            onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <div className="pt-4 border-t border-slate-800">
                            <p className="text-sm text-slate-400 mb-2 font-semibold">Credenciales Google Ad Manager API</p>
                            <input type="text" placeholder="API Client ID" className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-blue-500 outline-none mb-3"
                                onChange={e => setFormData({...formData, api_client_id: e.target.value})} required />
                            <input type="password" placeholder="API Client Secret" className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-blue-500 outline-none"
                                onChange={e => setFormData({...formData, api_client_secret: e.target.value})} required />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition">Validar y Continuar</button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <p className="text-center text-slate-400">API Validada ✅ Selecciona un plan:</p>
                        <PlanCard name="Básico" price="$29" limit="1 Dominio" onSelect={() => handlePayment('basico')} />
                        <PlanCard name="Pro" price="$99" limit="5 Dominios" onSelect={() => handlePayment('pro')} />
                        <PlanCard name="Premium" price="$199" limit="Ilimitado" onSelect={() => handlePayment('premium')} />
                    </div>
                )}
            </div>
        </div>
    );
};

const PlanCard = ({ name, price, limit, onSelect }) => (
    <div className="border border-slate-800 p-4 rounded-lg hover:border-blue-500 transition cursor-pointer flex justify-between items-center group" onClick={onSelect}>
        <div>
            <h4 className="font-bold text-lg">{name}</h4>
            <p className="text-slate-400 text-sm">{limit}</p>
        </div>
        <div className="text-right">
            <p className="text-blue-500 font-bold">{price}/mes</p>
            <span className="text-xs text-slate-500 group-hover:text-blue-400">Seleccionar →</span>
        </div>
    </div>
);

export default Register;
