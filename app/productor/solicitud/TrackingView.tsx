'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { searchTripByCtg, getActiveTrips } from '@/app/actions/producerActions';
import { ArrowRight, Search, Truck, Phone, Package, Calendar, MapPin, User, Check } from 'lucide-react';

interface TrackingViewProps {
    onBack: () => void;
    phone: string;
}

export default function TrackingView({ onBack, phone }: TrackingViewProps) {
    const [ctg, setCtg] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [searchResult, setSearchResult] = useState<any | null>(null);
    const [searched, setSearched] = useState(false);
    const [loadingActive, setLoadingActive] = useState(false);
    const [hasLoadedActive, setHasLoadedActive] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const TRIPS_PER_PAGE = 5;

    // Pagination calculations
    const totalPages = Math.ceil(activeTrips.length / TRIPS_PER_PAGE);
    const startIndex = (currentPage - 1) * TRIPS_PER_PAGE;
    const endIndex = startIndex + TRIPS_PER_PAGE;
    const paginatedTrips = activeTrips.slice(startIndex, endIndex);

    // Load active trips manually when button is clicked
    const handleLoadActiveTrips = async () => {
        setLoadingActive(true);
        try {
            const response = await getActiveTrips(phone);
            if (response.error) {
                console.error('Error loading active trips:', response.error);
                toast.error(`Error: ${response.error}`);
            } else if (response.data) {
                setActiveTrips(response.data);
                setHasLoadedActive(true);
                setCurrentPage(1); // Reset to first page
            }
        } catch (error) {
            console.error('Error loading active trips:', error);
            toast.error('Error al cargar viajes en curso');
        } finally {
            setLoadingActive(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ctg.trim()) return;

        setLoading(true);
        setSearched(false);
        setSearchResult(null);

        try {
            const data = await searchTripByCtg(ctg);
            setSearchResult(data);
            setSearched(true);
            if (!data) {
                toast.error('No se encontró ningún viaje con ese CTG.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al buscar el viaje.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E8EDF2] font-sans antialiased">
            {/* Grid texture */}
            <div className="fixed inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 0.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            {/* Header */}
            <div className="relative z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center text-slate-400 hover:text-slate-800 font-medium transition-colors group gap-2">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        <span className="text-sm">Volver</span>
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Seguimiento</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Search Section */}
                <div className="bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-200">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Buscar por CTG / Carta de Porte</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={ctg}
                                    onChange={(e) => setCtg(e.target.value)}
                                    placeholder="Ingresá el código CTG..."
                                    className="block w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Buscando...' : 'Buscar Viaje'}
                        </button>
                    </form>
                </div>

                {/* Search Result */}
                {searched && searchResult && (
                    <div className="space-y-2">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resultado de Búsqueda</h2>
                        <TripCard trip={searchResult} />
                    </div>
                )}

                {searched && !searchResult && (
                    <div className="bg-red-50 p-6 border border-red-100 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-md mx-auto mb-3 flex items-center justify-center text-red-500">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-red-900">No encontrado</h3>
                        <p className="text-sm text-red-600 mt-1">No existe ningún viaje con ese CTG.</p>
                    </div>
                )}

                {/* Active Trips Section */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viajes en Curso</h2>

                    {!hasLoadedActive ? (
                        <div className="bg-white p-6 border border-slate-200 text-center">
                            <button
                                onClick={handleLoadActiveTrips}
                                disabled={loadingActive}
                                className="w-full h-14 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loadingActive ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        <Truck className="w-5 h-5" />
                                        Buscar Viajes en Curso
                                    </>
                                )}
                            </button>
                        </div>
                    ) : activeTrips.length === 0 ? (
                        <div className="bg-slate-50 p-8 border border-slate-200 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-md mx-auto mb-3 flex items-center justify-center text-slate-400">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-700">No hay viajes en curso</h3>
                            <p className="text-sm text-slate-500 mt-1">Actualmente no tienes viajes activos.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {paginatedTrips.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="bg-white border border-slate-200 p-4 flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 font-medium rounded transition-colors disabled:cursor-not-allowed"
                                    >
                                        ← Anterior
                                    </button>

                                    <div className="text-sm text-slate-600 font-medium">
                                        Página <span className="font-bold text-slate-900">{currentPage}</span> de <span className="font-bold text-slate-900">{totalPages}</span>
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 font-medium rounded transition-colors disabled:cursor-not-allowed"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </main>
        </div>
    );
}

function TripCard({ trip }: { trip: any }) {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Sin fecha';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    // Progress calculation based on estado
    const getProgress = (estado: string) => {
        switch (estado) {
            case 'SOLICITADO': return { step: 1, percent: 14, label: 'Solicitado', desc: 'Solicitud creada' };
            case 'ASIGNADO': return { step: 2, percent: 28, label: 'Asignado', desc: 'Transportista asignado' };
            case 'CARGADO': return { step: 3, percent: 42, label: 'Cargado', desc: 'Mercadería cargada' };
            case 'EN_VIAJE': return { step: 4, percent: 57, label: 'En Tránsito', desc: 'En camino al destino' };
            case 'EN_DESTINO': return { step: 5, percent: 71, label: 'En Destino', desc: 'Llegó al destino' };
            case 'DESCARGADO': return { step: 6, percent: 85, label: 'Descargado', desc: 'Mercadería descargada' };
            case 'FINALIZADO': return { step: 7, percent: 100, label: 'Finalizado', desc: 'Proceso completado' };
            case 'CANCELADO': return { step: 0, percent: 0, label: 'Cancelado', desc: 'Viaje cancelado' };
            default: return { step: 1, percent: 14, label: estado, desc: 'Estado actual' };
        }
    };

    const progress = getProgress(trip.estado);

    return (
        <div className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-200">
            {/* Header with CTG */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Tu envío está {progress.label === 'En Tránsito' ? 'en camino' : 'en proceso'}</h3>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">CTG</p>
                    <p className="text-sm font-mono font-bold text-slate-900">{trip.ctg || 'Pendiente'}</p>
                </div>
            </div>

            {/* Progress Bar - 5 Key Milestones */}
            <div className="px-6 py-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    {/* Step 1: Solicitado */}
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${progress.step >= 1 ? 'bg-teal-500' : 'bg-slate-200'}`}>
                            {progress.step >= 1 && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <p className={`text-[10px] font-medium text-center ${progress.step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Solicitado</p>
                    </div>

                    {/* Connector 1 */}
                    <div className="flex-1 h-1 mx-2 mb-8 rounded-full overflow-hidden bg-slate-200">
                        <div className={`h-full ${progress.step >= 3 ? 'bg-teal-500' : 'bg-slate-200'} transition-all duration-300`}></div>
                    </div>

                    {/* Step 2: Cargado */}
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${progress.step >= 3 ? 'bg-teal-500' : 'bg-slate-200'}`}>
                            {progress.step >= 3 && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <p className={`text-[10px] font-medium text-center ${progress.step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>Cargado</p>
                    </div>

                    {/* Connector 2 */}
                    <div className="flex-1 h-1 mx-2 mb-8 rounded-full overflow-hidden bg-slate-200">
                        <div className={`h-full ${progress.step >= 4 ? 'bg-teal-500' : 'bg-slate-200'} transition-all duration-300`}></div>
                    </div>

                    {/* Step 3: En Tránsito */}
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${progress.step >= 4 ? 'bg-teal-500' : 'bg-slate-200'}`}>
                            {progress.step >= 4 ? <Truck className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <p className={`text-[10px] font-medium text-center ${progress.step >= 4 ? 'text-slate-900' : 'text-slate-400'}`}>En Tránsito</p>
                    </div>

                    {/* Connector 3 */}
                    <div className="flex-1 h-1 mx-2 mb-8 rounded-full overflow-hidden bg-slate-200">
                        <div className={`h-full ${progress.step >= 5 ? 'bg-teal-500' : 'bg-slate-200'} transition-all duration-300`}></div>
                    </div>

                    {/* Step 4: En Destino */}
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${progress.step >= 5 ? 'bg-teal-500' : 'bg-slate-200'}`}>
                            {progress.step >= 5 && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <p className={`text-[10px] font-medium text-center ${progress.step >= 5 ? 'text-slate-900' : 'text-slate-400'}`}>En Destino</p>
                    </div>

                    {/* Connector 4 */}
                    <div className="flex-1 h-1 mx-2 mb-8 rounded-full overflow-hidden bg-slate-200">
                        <div className={`h-full ${progress.step >= 6 ? 'bg-teal-500' : 'bg-slate-200'} transition-all duration-300`}></div>
                    </div>

                    {/* Step 5: Descargado */}
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${progress.step >= 6 ? 'bg-teal-500' : 'bg-slate-200'}`}>
                            {progress.step >= 6 && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <p className={`text-[10px] font-medium text-center ${progress.step >= 6 ? 'text-slate-900' : 'text-slate-400'}`}>Descargado</p>
                    </div>
                </div>
            </div>

            {/* Trip Details */}
            <div className="px-6 py-5 space-y-4">

                {/* Cereal & Tonnage */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider mb-1">Cereal</p>
                        <p className="text-sm font-bold text-slate-900">{trip.cereal || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider mb-1">Toneladas</p>
                        <p className="text-lg font-bold text-slate-900">{trip.toneladas || 0}<span className="text-sm text-slate-400 ml-1">TN</span></p>
                    </div>
                </div>

                {/* Route */}
                <div className="bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <div className="w-0.5 h-12 bg-slate-300 my-1"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wide mb-0.5">Origen</p>
                                <p className="text-sm font-bold text-slate-700">{trip.origen?.nombre || 'No especificado'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wide mb-0.5">Destino</p>
                                <p className="text-sm font-bold text-slate-700">{trip.destino?.nombre || 'No especificado'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Driver & Truck Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider mb-2">Conductor</p>
                        {trip.chofer ? (
                            <>
                                <p className="text-sm font-bold text-slate-900 mb-1">{trip.chofer.nombre}</p>
                                {trip.chofer.telefono && (
                                    <a href={`tel:${trip.chofer.telefono}`} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {trip.chofer.telefono}
                                    </a>
                                )}
                            </>
                        ) : (
                            <p className="text-xs text-slate-400">No asignado</p>
                        )}
                    </div>

                    <div className="bg-slate-50 p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider mb-2">Camión</p>
                        {trip.camion ? (
                            <>
                                <p className="text-sm font-bold text-slate-900">{trip.camion.patente}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{trip.camion.tipo_camion?.replace('_', ' ')}</p>
                            </>
                        ) : (
                            <p className="text-xs text-slate-400">No asignado</p>
                        )}
                    </div>
                </div>

                {/* Timestamp */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Estado Actual</p>
                        <p className="text-sm font-bold text-slate-700">{progress.label}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Fecha Carga</p>
                        <p className="text-xs font-bold text-slate-700">{formatDate(trip.fecha_carga)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
