'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { createLoadRequest, checkProducer } from '@/app/actions/producerActions';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    Wheat,
    Leaf,
    Sun,
    Sprout,
    MapPin,
    Truck,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Weight,
    Package,
    Navigation,
    Calendar,
    Search
} from 'lucide-react';

import ProducerDashboard from './ProducerDashboard';
import TrackingView from './TrackingView';
import HistoryView from './HistoryView';

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full bg-slate-50 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
            <MapPin className="w-8 h-8 opacity-20" />
            <span className="text-sm font-medium">Cargando Mapa...</span>
        </div>
    )
});

type ViewState = 'PHONE' | 'DASHBOARD' | 'NEW_REQUEST' | 'CONFIRM_REQUEST' | 'TRACKING' | 'HISTORY';

const CEREAL_OPTIONS = [
    { id: 'MAIZ', label: 'Maíz', icon: Wheat },
    { id: 'SOJA', label: 'Soja', icon: Leaf },
    { id: 'TRIGO', label: 'Trigo', icon: Wheat },
    { id: 'GIRASOL', label: 'Girasol', icon: Sun },
    { id: 'SORGO', label: 'Sorgo', icon: Sprout },
    { id: 'OTROS', label: 'Otros', icon: Package },
];

export default function LoadRequestForm({ initialPhone }: { initialPhone?: string }) {
    const searchParams = useSearchParams();
    const urlPhone = searchParams.get('telefono') || initialPhone || '';
    const router = useRouter();

    const [view, setView] = useState<ViewState>('PHONE');
    const [phone, setPhone] = useState(urlPhone);
    const [loading, setLoading] = useState(false);
    const [producerName, setProducerName] = useState('');

    // Form Stats
    const [formData, setFormData] = useState({
        cantidad_camiones: '',
        toneladas: '',
        cereal: '',
        destino: '',
    });
    const [origen, setOrigen] = useState<{ lat: number; lng: number } | null>(null);

    // Session persistence with localStorage
    useEffect(() => {
        // Try to restore session from localStorage first
        const savedPhone = localStorage.getItem('producer_phone');
        const savedName = localStorage.getItem('producer_name');

        if (savedPhone && savedName) {
            // Restore from localStorage
            setPhone(savedPhone);
            setProducerName(savedName);
            setView('DASHBOARD');
        } else if (urlPhone) {
            // If URL has phone, verify it
            verifyPhone(urlPhone);
        }
    }, [urlPhone]);

    async function verifyPhone(msgPhone: string) {
        setLoading(true);
        try {
            const producer = await checkProducer(msgPhone);
            if (producer) {
                setProducerName(producer.nombre);
                setPhone(msgPhone);
                setView('DASHBOARD');

                // Save to localStorage for session persistence
                localStorage.setItem('producer_phone', msgPhone);
                localStorage.setItem('producer_name', producer.nombre);
            } else {
                toast.error('No encontramos un productor con ese teléfono.');
                setTimeout(() => {
                    const params = new URLSearchParams();
                    params.set('telefono', msgPhone);
                    router.push(`/productor/registro?${params.toString()}`);
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error verificando teléfono.');
        } finally {
            setLoading(false);
        }
    }

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verifyPhone(phone);
    };

    const handleContinueToConfirm = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cereal) {
            toast.error('Selecciona un tipo de cereal.');
            return;
        }
        if (!formData.cantidad_camiones || !formData.toneladas) {
            toast.error('Completa la información de carga.');
            return;
        }
        if (!origen) {
            toast.error('Por favor selecciona un origen en el mapa.');
            return;
        }

        setView('CONFIRM_REQUEST');
    };

    const handleFinalSubmit = async () => {
        if (!origen) {
            toast.error('Error: ubicación no definida');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                telefono: phone,
                ...formData,
                origen: {
                    lat: origen.lat,
                    lng: origen.lng
                }
            };

            const result = await createLoadRequest(payload);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Solicitud enviada con éxito!');
                setFormData({
                    cantidad_camiones: '',
                    toneladas: '',
                    cereal: '',
                    destino: '',
                });
                setOrigen(null);
                setView('DASHBOARD');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error enviando solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper for selecting cereal
    const selectCereal = (cerealId: string) => {
        setFormData(prev => ({ ...prev, cereal: cerealId }));
    };

    // RENDER LOGIC

    if (view === 'PHONE') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 font-sans">
                <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-lg shadow-sm border border-slate-200">
                    <div className="text-center mb-8">
                        {/* LogiAr Logo */}
                        <div className="mb-6">
                            <img
                                src="/logiar-logo.png"
                                alt="LogiAr"
                                className="h-16 mx-auto"
                            />
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Acceso de Productores</h2>
                        <p className="text-sm text-slate-500">Ingrese su número de celular para continuar</p>
                    </div>
                    <form onSubmit={handlePhoneSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Número de Celular</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="text-slate-500 font-medium">+54</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="358 123 4567"
                                    required
                                    className="block w-full h-12 pl-16 pr-4 bg-white border border-slate-300 rounded-md text-slate-900 font-medium placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-sm transition-colors">
                            Ingresar
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // Logout handler - clear localStorage and return to login
    const handleLogout = () => {
        localStorage.removeItem('producer_phone');
        localStorage.removeItem('producer_name');
        setPhone('');
        setProducerName('');
        setView('PHONE');
        toast.success('Sesión cerrada');
    };

    if (view === 'DASHBOARD') {
        return (
            <ProducerDashboard
                producerName={producerName}
                onNavigate={(target) => {
                    setView(target);
                }}
                onLogout={handleLogout}
            />
        );
    }

    if (view === 'TRACKING') {
        return <TrackingView phone={phone} onBack={() => setView('DASHBOARD')} />;
    }

    if (view === 'HISTORY') {
        return <HistoryView phone={phone} onBack={() => setView('DASHBOARD')} />;
    }

    if (view === 'CONFIRM_REQUEST') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] font-sans flex items-center justify-center p-4">
                <div className="max-w-lg w-full">
                    {/* Simplified Confirmation View */}
                    <div className="bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-200 relative overflow-hidden">

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-emerald-50 mb-4 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900">Confirmar Solicitud</h2>
                            <p className="text-slate-500 font-medium">Revisa los detalles antes de enviar.</p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Metric Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100 rounded-none p-4">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Cereal</p>
                                    <p className="text-lg font-bold text-slate-900 truncate">
                                        {formData.cereal ? CEREAL_OPTIONS.find(c => c.id === formData.cereal)?.label : '---'}
                                    </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-none p-4">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Carga Estimada</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {formData.toneladas || 0} <span className="text-sm font-semibold text-slate-400">TN</span>
                                    </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-none p-4 col-span-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Logística Requeria</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {formData.cantidad_camiones || 0} <span className="text-sm font-semibold text-slate-400">Camiones</span>
                                        </p>
                                    </div>
                                    <Truck className="w-8 h-8 text-slate-200" />
                                </div>
                            </div>

                            {/* Destination Route */}
                            <div className="bg-slate-50 border border-slate-100 rounded-none p-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center mt-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                        <div className="w-0.5 h-10 bg-slate-300 my-1"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-0.5">Origen</p>
                                            <p className="text-sm font-bold text-slate-700 line-clamp-1">
                                                {origen ? 'Ubicación seleccionada en mapa' : 'Sin seleccionar'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-amber-600 font-bold uppercase tracking-wide mb-0.5">Destino</p>
                                            <p className="text-sm font-bold text-slate-700 line-clamp-1">
                                                {formData.destino || 'Sin definir'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 relative z-10">
                            <div className="bg-amber-50 border border-amber-100 p-4 mb-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                    <strong>Atención:</strong> Verifica la información antes de enviar. Al confirmar, se notificará automáticamente a los camioneros disponibles en la zona.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={loading}
                                    className="w-full h-14 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-lg shadow-lg shadow-slate-900/10 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Procesando...' : (
                                        <>
                                            Confirmar Solicitud
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setView('NEW_REQUEST')}
                                    className="w-full h-12 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                                >
                                    Volver y Editar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // view === 'NEW_REQUEST'
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E8EDF2] font-sans antialiased">
            {/* Subtle grid texture */}
            <div className="fixed inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 0.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            {/* Navbar */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <button onClick={() => setView('DASHBOARD')} className="flex items-center text-slate-400 hover:text-slate-800 font-medium transition-colors group gap-2">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        <span className="text-sm">Volver</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] text-slate-400 uppercase font-medium tracking-[0.15em]">Productor</p>
                            <p className="text-sm font-semibold text-slate-800">{producerName}</p>
                        </div>
                        <div className="h-9 w-9 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {producerName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="space-y-8">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Nueva Solicitud</h1>
                        <p className="text-slate-500 mt-2 text-lg">Configura el transporte para tu carga.</p>
                    </div>

                    <form id="load-request-form" onSubmit={handleContinueToConfirm} className="space-y-8">

                        {/* SECTION 1: Cereal Selection */}
                        <section className="bg-white p-6 sm:p-7 border border-slate-200 rounded-lg">
                            <div className="mb-5">
                                <h3 className="text-base font-semibold text-slate-900 mb-1">Tipo de Cereal</h3>
                                <p className="text-sm text-slate-500">Seleccione el producto a transportar</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                {CEREAL_OPTIONS.map((option) => {
                                    const isSelected = formData.cereal === option.id;
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => selectCereal(option.id)}
                                            className={`
                                                    relative flex flex-col items-center justify-center p-4 border transition-all duration-150 h-24 group rounded-md
                                                    ${isSelected
                                                    ? `bg-slate-900 border-slate-900`
                                                    : 'bg-white border-slate-200 hover:border-slate-400'
                                                }
                                                `}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 text-white">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                            <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* SECTION 2: Capacity / Quantity */}
                        {/* SECTION 2: Carga y Capacidad (Swapped order - Trucks First) */}
                        <section className="bg-white p-6 sm:p-7 border border-slate-200 rounded-lg">
                            <div className="mb-5">
                                <h3 className="text-base font-semibold text-slate-900 mb-1">Capacidad y Carga</h3>
                                <p className="text-sm text-slate-500">Especifique cantidad y tonelaje</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {/* Trucks Input (First) */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">Cantidad de Camiones</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Truck className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="cantidad_camiones"
                                            value={formData.cantidad_camiones}
                                            onChange={handleChange}
                                            placeholder="Ej. 2"
                                            className="block w-full h-12 pl-12 pr-4 bg-white border border-slate-200 text-slate-900 font-medium focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-md outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Tonnage Input (Second, no slider) */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">Toneladas estimadas</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Weight className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="toneladas"
                                            value={formData.toneladas}
                                            onChange={handleChange}
                                            placeholder="Ej. 60"
                                            className="block w-full h-12 pl-12 pr-4 bg-white border border-slate-200 text-slate-900 font-medium focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-md outline-none transition-all"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-bold text-slate-400">TN</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 3: Logistics (Map) */}
                        <section className="bg-white p-6 sm:p-7 border border-slate-200 rounded-lg relative overflow-hidden">
                            <div className="mb-5 relative z-10">
                                <h3 className="text-base font-semibold text-slate-900 mb-1">Logística de Carga</h3>
                                <p className="text-sm text-slate-500">Defina origen y destino</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                {/* Map Container */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-bold text-slate-700">Punto de Origen</label>
                                        {origen ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Ubicación definida
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Seleccionar en mapa
                                            </span>
                                        )}
                                    </div>
                                    <div className={`h-[400px] w-full overflow-hidden relative border rounded-md transition-all duration-200 ${origen ? 'border-slate-400' : 'border-slate-200'}`}>
                                        <MapPicker onLocationSelect={(loc) => setOrigen(loc)} />
                                    </div>
                                </div>

                                {/* Destination Input */}
                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Destino Final</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Navigation className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="destino"
                                            value={formData.destino}
                                            onChange={handleChange}
                                            placeholder="Ingresa el puerto o acopio de destino..."
                                            className="block w-full h-12 pl-12 pr-4 bg-white border border-slate-200 text-slate-900 font-medium focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-md outline-none transition-all placeholder:font-normal"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={handleContinueToConfirm}
                                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                Solicitar Carga
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </form>
                </div>

            </main >
        </div >
    );
}
