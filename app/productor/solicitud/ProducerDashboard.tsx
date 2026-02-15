import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ProducerDashboardProps {
    producerName: string;
    onNavigate: (view: 'NEW_REQUEST' | 'TRACKING' | 'HISTORY') => void;
}

export default function ProducerDashboard({ producerName, onNavigate }: ProducerDashboardProps) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-[#2F5C3B] text-white py-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>

                <div className="max-w-md mx-auto relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border border-white/30">
                            {producerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-green-100 text-sm font-medium">Bienvenido back,</p>
                            <h1 className="text-2xl font-bold tracking-tight">{producerName}</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="max-w-md mx-auto px-6 -mt-6 relative z-20 space-y-4">

                {/* Solicitar Carga - Featured Card */}
                <button
                    onClick={() => onNavigate('NEW_REQUEST')}
                    className="w-full bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-[#2F5C3B] group-hover:bg-[#2F5C3B] group-hover:text-white transition-colors duration-300">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">Solicitar Carga</h3>
                            <p className="text-sm text-gray-400 font-medium">Nuevo pedido de camiones</p>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-[#2F5C3B] group-hover:text-[#2F5C3B] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </button>

                <div className="grid grid-cols-2 gap-4">
                    {/* Estado de Viaje */}
                    <button
                        onClick={() => onNavigate('TRACKING')}
                        className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-40"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-900">Seguimiento</h3>
                            <p className="text-xs text-gray-400">Por CTG / Carta de Porte</p>
                        </div>
                    </button>

                    {/* Mis Viajes */}
                    <button
                        onClick={() => onNavigate('HISTORY')}
                        className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-40"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-900">Historial</h3>
                            <p className="text-xs text-gray-400">Mis últimos viajes</p>
                        </div>
                    </button>
                </div>

                {/* Soporte / Ayuda */}
                <button className="w-full bg-white/50 p-4 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-500 hover:bg-white hover:text-[#2F5C3B] hover:border-[#2F5C3B] transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <span className="font-semibold text-sm">Necesito Ayuda</span>
                </button>

            </div>
        </div>
    );
}
