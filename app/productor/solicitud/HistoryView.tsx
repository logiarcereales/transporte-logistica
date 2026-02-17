'use client';

import { useState, useEffect } from 'react';
import { getProducerHistory } from '@/app/actions/producerActions';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, TrendingUp, Package, BarChart3 } from 'lucide-react';

interface HistoryViewProps {
    phone: string;
    onBack: () => void;
}

export default function HistoryView({ phone, onBack }: HistoryViewProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [phone]);

    async function loadHistory() {
        setLoading(true);
        const res = await getProducerHistory(phone);
        if (res.error) {
            toast.error(res.error);
        } else if (res.data) {
            setHistory(res.data);
        }
        setLoading(false);
    }

    // Calculate metrics
    const totalTrips = history.length;
    const totalTonnage = history
        .filter(v => v.estado === 'FINALIZADO')
        .reduce((sum, v) => sum + (v.toneladas || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans antialiased">
            {/* Subtle grid texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Historial de Viajes</h1>
                        <p className="text-slate-500">Registro completo de tus operaciones finalizadas</p>
                    </div>

                    {/* Simplified Metrics */}
                    {!loading && totalTrips > 0 && (
                        <div className="flex gap-4">
                            <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[120px]">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Viajes</span>
                                <span className="text-2xl font-bold text-slate-900">{totalTrips}</span>
                            </div>
                            <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[120px]">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">TN Movidas</span>
                                <span className="text-2xl font-bold text-slate-900">{totalTonnage.toFixed(0)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-20 bg-white animate-pulse rounded-xl border border-slate-200"></div>
                        ))}
                    </div>
                ) : totalTrips === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Sin historial disponible</h3>
                        <p className="text-slate-500">Aún no tienes viajes registrados en el historial.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">CTG</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Origen / Destino</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Carga</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((viaje) => (
                                        <tr key={viaje.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">
                                                        {viaje.fecha_carga ? new Date(viaje.fecha_carga).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {viaje.fecha_carga ? new Date(viaje.fecha_carga).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''} hs
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {viaje.ctg ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                        {viaje.ctg}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5 max-w-[240px]">
                                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                        <span className="truncate" title={viaje.origen?.nombre}>{viaje.origen?.nombre || 'Origen desconocido'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-900 font-medium">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                                                        <span className="truncate" title={viaje.destino?.nombre}>{viaje.destino?.nombre || 'Destino desconocido'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{viaje.cereal}</span>
                                                    <span className="text-sm text-slate-500">{viaje.toneladas} Toneladas</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${viaje.estado === 'FINALIZADO'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {viaje.estado === 'FINALIZADO' ? (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3" />
                                                    )}
                                                    {viaje.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {history.map((viaje) => (
                                <div key={viaje.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                {viaje.fecha_carga ? new Date(viaje.fecha_carga).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '-'}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-900 mt-0.5">
                                                {viaje.cereal} · {viaje.toneladas} Toneladas
                                            </span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${viaje.estado === 'FINALIZADO' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {viaje.estado}
                                        </span>
                                    </div>

                                    <div className="relative pl-3 border-l-2 border-slate-100 space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">Origen</p>
                                            <p className="text-sm text-slate-700 truncate">{viaje.origen?.nombre || 'Desconocido'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">Destino</p>
                                            <p className="text-sm font-medium text-slate-900 truncate">{viaje.destino?.nombre || 'Desconocido'}</p>
                                        </div>
                                    </div>

                                    {viaje.ctg && (
                                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Documentación</span>
                                            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                CTG: {viaje.ctg}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
