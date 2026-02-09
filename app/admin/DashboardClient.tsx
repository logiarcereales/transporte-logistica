'use client';

import React from 'react';
import { Truck, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dynamic from 'next/dynamic';

// Dynamically import the MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400">Cargando mapa...</div>
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardClient({
    stats,
    ubicaciones
}: {
    stats: any,
    ubicaciones: any[]
}) {
    const { kpis, charts } = stats;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard de Control</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Viajes Activos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{kpis.totalActive}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Truck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pendientes Asignación</p>
                        <h3 className="text-2xl font-bold text-gray-900">{kpis.pendingAssignment}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">En Curso</p>
                        <h3 className="text-2xl font-bold text-gray-900">{kpis.tripsInProgress}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Toneladas Totales</p>
                        <h3 className="text-2xl font-bold text-gray-900">{kpis.totalTons.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Package className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Charts & Maps Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Volume Chart */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Volumen por Cereal (TN)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.volumeByCereal}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Chart */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Estados</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {charts.statusDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs font-medium text-gray-500 mt-2 flex-wrap">
                            {charts.statusDistribution.map((entry: any, index: number) => (
                                <div key={entry.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Map */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mapa de Operaciones</h3>
                <div className="h-[400px] rounded-lg overflow-hidden relative z-0">
                    <MapComponent ubicaciones={ubicaciones} />
                </div>
            </div>
        </div>
    );
}
