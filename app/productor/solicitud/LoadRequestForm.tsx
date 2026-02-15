'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { createLoadRequest, checkProducer } from '@/app/actions/producerActions';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import ProducerDashboard from './ProducerDashboard';
import TrackingView from './TrackingView';

import HistoryView from './HistoryView';

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Cargando Mapa...</div>
});

type ViewState = 'PHONE' | 'DASHBOARD' | 'NEW_REQUEST' | 'TRACKING' | 'HISTORY';

export default function LoadRequestForm({ initialPhone }: { initialPhone?: string }) {
    const searchParams = useSearchParams();

    // Si viene telefono por URL (del redirect), usalo.
    const urlPhone = searchParams.get('telefono') || initialPhone || '';

    const [view, setView] = useState<ViewState>('PHONE');
    const [phone, setPhone] = useState(urlPhone);
    const [loading, setLoading] = useState(false);
    const [producerName, setProducerName] = useState('');
    const router = useRouter();

    // Form Stats
    const [formData, setFormData] = useState({
        cantidad_camiones: '',
        toneladas: '',
        cereal: '',
        destino: '',
    });
    const [origen, setOrigen] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (urlPhone) {
            // Si ya tenemos telefono, intentamos verificarlo automágicamente o pre-llenamos
            // verifyPhone(urlPhone); // Opcional: auto-login
        }
    }, [urlPhone]);

    async function verifyPhone(msgPhone: string) {
        setLoading(true);
        try {
            const producer = await checkProducer(msgPhone);
            if (producer) {
                setProducerName(producer.nombre);
                setView('DASHBOARD');
            } else {
                toast.error('No encontramos un productor con ese teléfono. Redirigiendo a registro...');
                // Redirect to register with phone pre-filled
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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!origen) {
            toast.error('Por favor selecciona un origen en el mapa.');
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
                // Reset form and go back to dashboard
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

    // RENDER LOGIC

    if (view === 'PHONE') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#2F5C3B] to-slate-50 opacity-10"></div>

                <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#2F5C3B] mb-6 shadow-lg shadow-green-900/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            {/* Placeholder Logo for LogiAr */}
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">LogiAr</h2>
                        <p className="text-gray-500 mt-3 font-medium">Gestión inteligente de cargas</p>
                    </div>
                    <form onSubmit={handlePhoneSubmit} className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tu número de WhatsApp</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="text-gray-400 font-bold text-lg group-focus-within:text-[#2F5C3B] transition-colors">+54 9</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="358 412 3456"
                                    required
                                    className="block w-full py-4 pl-20 pr-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-bold text-lg placeholder-gray-300 focus:bg-white focus:border-[#2F5C3B]/20 focus:ring-4 focus:ring-[#2F5C3B]/10 outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full h-14 text-lg font-bold bg-[#2F5C3B] hover:bg-[#1a3522] text-white shadow-xl shadow-green-900/20 hover:shadow-2xl hover:shadow-green-900/30 hover:-translate-y-0.5 transition-all rounded-2xl">
                            Ingresar
                        </Button>
                        <div className="text-center">
                            <a href="/productor/registro" className="text-sm font-semibold text-gray-400 hover:text-[#2F5C3B] transition-colors">
                                No tengo cuenta
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (view === 'DASHBOARD') {
        return (
            <ProducerDashboard
                producerName={producerName}
                onNavigate={(target) => {
                    setView(target);
                }}
            />
        );
    }

    if (view === 'TRACKING') {
        return <TrackingView onBack={() => setView('DASHBOARD')} />;
    }

    if (view === 'HISTORY') {
        return <HistoryView phone={phone} onBack={() => setView('DASHBOARD')} />;
    }

    // view === 'NEW_REQUEST'
    return (
        <div className="min-h-screen bg-[#F3F4F6] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#F4C430]/30 animate-in fade-in slide-in-from-right-8">
            <div className="max-w-5xl mx-auto">

                {/* Back Button */}
                <button onClick={() => setView('DASHBOARD')} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-bold transition-colors">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Volver al inicio
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Form (8 cols) */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Solicitar Transporte</h1>
                                <p className="text-sm sm:text-base text-gray-500 font-medium">Completa los detalles del viaje.</p>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-gray-100 self-start sm:self-auto">
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#2F5C3B] font-bold text-sm border border-gray-100 shadow-sm">
                                    {producerName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{producerName}</span>
                            </div>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">

                            {/* Card: Carga */}
                            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2F5C3B] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-green-900/20">1</div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">¿Qué transportamos?</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                    <div className="col-span-1 sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Producto</label>
                                        <div className="relative">
                                            <select
                                                name="cereal"
                                                value={formData.cereal}
                                                onChange={handleChange}
                                                className="block w-full h-12 sm:h-14 pl-5 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-[#2F5C3B] focus:ring-4 focus:ring-[#2F5C3B]/10 outline-none transition-all appearance-none cursor-pointer text-sm sm:text-base"
                                                required
                                            >
                                                <option value="">Seleccionar Cereal...</option>
                                                <option value="MAIZ">Maíz</option>
                                                <option value="SOJA">Soja</option>
                                                <option value="TRIGO">Trigo</option>
                                                <option value="GIRASOL">Girasol</option>
                                                <option value="SORGO">Sorgo</option>
                                                <option value="OTROS">Otros</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Camiones</label>
                                        <input
                                            name="cantidad_camiones"
                                            type="number"
                                            min="1"
                                            value={formData.cantidad_camiones}
                                            onChange={handleChange}
                                            required
                                            className="block w-full h-12 sm:h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-[#2F5C3B] focus:ring-4 focus:ring-[#2F5C3B]/10 outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
                                            placeholder="Ej: 2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Toneladas</label>
                                        <input
                                            name="toneladas"
                                            type="number"
                                            step="0.1"
                                            value={formData.toneladas}
                                            onChange={handleChange}
                                            required
                                            className="block w-full h-12 sm:h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-[#2F5C3B] focus:ring-4 focus:ring-[#2F5C3B]/10 outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
                                            placeholder="Ej: 60"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card: Ruta */}
                            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2F5C3B] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-green-900/20">2</div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Hoja de Ruta</h3>
                                </div>

                                <div className="space-y-6 sm:space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Origen</label>
                                            {origen ? (
                                                <span className="flex items-center text-[#2F5C3B] text-xs font-bold bg-green-50 px-2 py-1 rounded-md animate-pulse">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                    Definido
                                                </span>
                                            ) : (
                                                <span className="text-red-400 text-xs font-bold bg-red-50 px-2 py-1 rounded-md">Requerido</span>
                                            )}
                                        </div>
                                        <div className={`h-[300px] sm:h-[350px] w-full rounded-2xl overflow-hidden relative transition-all duration-300 ${origen ? 'ring-2 ring-[#2F5C3B] ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-300'}`}>
                                            <MapPicker onLocationSelect={(loc) => setOrigen(loc)} />
                                            {!origen && (
                                                <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none z-[400]">
                                                    <span className="bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg animate-bounce">
                                                        📍 Selecciona en el mapa
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Destino Final</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                            </span>
                                            <input
                                                name="destino"
                                                value={formData.destino}
                                                onChange={handleChange}
                                                placeholder="Ej: Puerto General San Martín"
                                                required
                                                className="block w-full h-12 sm:h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-2xl text-gray-900 font-bold focus:bg-white focus:border-[#2F5C3B] focus:ring-4 focus:ring-[#2F5C3B]/10 outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Sticky Summary & Action (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Ticket/Resumen Card */}
                        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-6">

                            <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                                <span className="bg-green-50 p-2 rounded-lg mr-3 text-[#2F5C3B]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                </span>
                                Resumen
                            </h3>

                            <div className="space-y-6">
                                <div className="flex justify-between items-baseline border-b border-gray-50 pb-4">
                                    <span className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Carga</span>
                                    <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                            {formData.toneladas || 0} <span className="text-xs sm:text-sm font-medium text-gray-400">TN</span>
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
                                            {formData.cereal || "---"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline border-b border-gray-50 pb-4">
                                    <span className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Logística</span>
                                    <div className="text-right">
                                        <div className="text-lg sm:text-xl font-bold text-gray-900">
                                            {formData.cantidad_camiones || 0} <span className="text-xs sm:text-sm font-medium text-gray-400">Camiones</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start pt-2">
                                    <span className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide mt-1">Destino</span>
                                    <div className="text-right max-w-[60%]">
                                        <span className="text-sm sm:text-base font-bold text-gray-900 block truncate leading-tight">
                                            {formData.destino || "A definir"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8">
                                <button
                                    onClick={handleFormSubmit}
                                    disabled={loading}
                                    className="w-full bg-[#2F5C3B] hover:bg-[#254a2f] text-white font-bold h-12 sm:h-14 rounded-xl shadow-lg shadow-green-900/10 hover:shadow-xl hover:shadow-green-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    {loading ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            CONFIRMAR
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed px-4">
                                    Al confirmar, aceptas los términos de servicio de LogiAr.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
