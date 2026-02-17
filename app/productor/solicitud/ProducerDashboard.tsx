'use client';

import { ArrowRight, Truck, MapPin, Clock, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProducerDashboardProps {
    producerName: string;
    onNavigate: (view: 'NEW_REQUEST' | 'TRACKING' | 'HISTORY') => void;
    onLogout: () => void;
}

export default function ProducerDashboard({ producerName, onNavigate, onLogout }: ProducerDashboardProps) {
    const [greeting, setGreeting] = useState('Buen día');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Buen día');
        else if (hour < 20) setGreeting('Buenas tardes');
        else setGreeting('Buenas noches');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            {/* Subtle texture overlay */}
            <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {producerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Productor</p>
                            <p className="text-base font-semibold text-slate-900">{producerName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all text-sm font-medium shadow-sm flex items-center gap-2"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>

                {/* Hero Greeting */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">{greeting}, {producerName.split(' ')[0]}</h1>
                    <p className="text-lg text-slate-500">¿Qué necesitás hacer hoy?</p>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Nueva Solicitud - Primary */}
                    <button
                        onClick={() => onNavigate('NEW_REQUEST')}
                        className="group text-left bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                <Truck className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Solicitar Carga</h3>
                                <p className="text-sm text-slate-500">Crear nueva solicitud de transporte</p>
                                <div className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                                    Comenzar
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Seguimiento */}
                    <button
                        onClick={() => onNavigate('TRACKING')}
                        className="group text-left bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Seguimiento</h3>
                                <p className="text-sm text-slate-500">Rastrear viaje por CTG / Carta de Porte</p>
                                <div className="mt-4 inline-flex items-center text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                    Buscar
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Historial */}
                    <button
                        onClick={() => onNavigate('HISTORY')}
                        className="group text-left bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 md:col-span-2"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
                                <Clock className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Historial de Viajes</h3>
                                <p className="text-sm text-slate-500">Ver mis últimos viajes y estadísticas</p>
                                <div className="mt-4 inline-flex items-center text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                    Ver historial
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-center gap-2">
                        <img src="/logiar-logo.png" alt="LogiAr" className="h-6" />
                        <span className="text-slate-400 text-sm">·</span>
                        <p className="text-sm text-slate-500">Plataforma de Transporte Agrícola</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
