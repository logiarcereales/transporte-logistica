'use client';

import React from 'react';
import { Truck, AlertCircle, TrendingUp, Package, Users, MapPin, Clock, ArrowRight, Plus, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
    'SOLICITADO': 'bg-amber-50 text-amber-700 border-amber-200',
    'ASIGNADO': 'bg-blue-50 text-blue-700 border-blue-200',
    'CARGADO': 'bg-purple-50 text-purple-700 border-purple-200',
    'EN_VIAJE': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'EN_DESTINO': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'DESCARGADO': 'bg-teal-50 text-teal-700 border-teal-200',
    'FINALIZADO': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'CANCELADO': 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function DashboardClient({
    stats,
    recentTrips
}: {
    stats: any,
    recentTrips: any[]
}) {
    const { kpis, charts } = stats;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            {/* Subtle texture overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard de Control</h1>
                    <p className="text-slate-500">Gestión centralizada de operaciones logísticas</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Link href="/admin/viajes" className="group">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all hover:-translate-y-0.5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Viajes Activos</p>
                            <h3 className="text-3xl font-bold text-slate-900">{kpis.totalActive}</h3>
                        </div>
                    </Link>

                    <Link href="/admin/viajes?status=SOLICITADO" className="group">
                        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all hover:-translate-y-0.5 bg-gradient-to-br from-white to-amber-50/30">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-200 transition-colors">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-4 h-4 text-amber-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1">Pendientes</p>
                            <h3 className="text-3xl font-bold text-slate-900">{kpis.pendingAssignment}</h3>
                            <p className="text-xs text-amber-600 mt-1">Requieren asignación</p>
                        </div>
                    </Link>

                    <Link href="/admin/viajes" className="group">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all hover:-translate-y-0.5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">En Curso</p>
                            <h3 className="text-3xl font-bold text-slate-900">{kpis.tripsInProgress}</h3>
                        </div>
                    </Link>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Toneladas Totales</p>
                        <h3 className="text-3xl font-bold text-slate-900">{kpis.totalTons.toLocaleString()}</h3>
                        <p className="text-xs text-slate-500 mt-1">Gestionadas</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/admin/viajes" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Asignar Viaje</span>
                        </Link>

                        <Link href="/admin/choferes" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Ver Choferes</span>
                        </Link>

                        <Link href="/admin/ubicaciones" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group">
                            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">Ubicaciones</span>
                        </Link>

                        <Link href="/admin/productores" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all group">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-200 transition-colors">
                                <Eye className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Productores</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Trips Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Viajes Recientes</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Últimas operaciones registradas</p>
                            </div>
                            <Link href="/admin/viajes" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                Ver todos
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">CTG</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Productor</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruta</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Carga</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chofer</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentTrips.slice(0, 10).map((trip: any) => (
                                    <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-3 px-6">
                                            {trip.ctg ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {trip.ctg}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[trip.estado] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                {trip.estado}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className="text-sm font-medium text-slate-900">{trip.productor?.nombre || '-'}</span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex flex-col gap-0.5 max-w-[200px]">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                    <span className="truncate">{trip.origen?.nombre || 'Origen'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-900 font-medium">
                                                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                                    <span className="truncate">{trip.destino?.nombre || 'Destino'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900">{trip.cereal}</span>
                                                <span className="text-xs text-slate-500">{trip.toneladas} TN</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className="text-sm text-slate-700">{trip.chofer?.nombre || <span className="text-slate-400 italic">Sin asignar</span>}</span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {trip.fecha_carga ? new Date(trip.fecha_carga).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Volumen por Cereal (TN)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.volumeByCereal}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
