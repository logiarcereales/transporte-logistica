'use client';

import { useState, useEffect } from 'react';
import { getProducerHistory } from '@/app/actions/producerActions';
import { toast } from 'sonner';

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

    return (
        <div className="min-h-screen bg-[#F3F4F6] py-8 px-4 sm:px-6 lg:px-8 font-sans animate-in fade-in slide-in-from-right-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-bold transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Volver al inicio
                </button>

                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Mis Viajes Recientes</h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Sin historial</h3>
                            <p className="text-gray-500">No tienes viajes registrados recientemente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((viaje) => (
                                <div key={viaje.id} className="relative group bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#2F5C3B]/30 hover:shadow-md transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                <span>{new Date(viaje.fecha_carga).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className={
                                                    viaje.estado === 'SOLICITADO' ? 'text-yellow-500' :
                                                        viaje.estado === 'EN_CURSO' ? 'text-blue-500' :
                                                            viaje.estado === 'FINALIZADO' ? 'text-green-500' : 'text-gray-500'
                                                }>
                                                    {viaje.estado}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {viaje.cereal} <span className="text-gray-400 font-medium text-sm">({viaje.toneladas} TN)</span>
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                                <span className="font-medium">{viaje.origen?.nombre || 'Origen desconocido'}</span>
                                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                                </svg>
                                                <span className="font-medium">{viaje.destino?.nombre || 'Destino desconocido'}</span>
                                            </div>
                                            {viaje.ctg && (
                                                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-xs font-mono font-bold text-slate-600 border border-slate-200">
                                                    CTG: {viaje.ctg}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
