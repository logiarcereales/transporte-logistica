'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MapPin, Plus, Edit2, Trash2, Search, Navigation } from 'lucide-react';
import { createUbicacion, updateUbicacion, deleteUbicacion } from '../actions';

interface Ubicacion {
    id: string;
    nombre: string;
    instrucciones_llegada?: string; // Usamos esto como dirección
    tipo: string;
    latitud?: number;
    longitud?: number;
}

export default function UbicacionesClient({ initialUbicaciones }: { initialUbicaciones: any[] }) {
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>(initialUbicaciones);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State (could be separate component, but keeping simple here)
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'CAMPO',
        instrucciones_llegada: '',
        latitud: '',
        longitud: ''
    });

    const filteredUbicaciones = ubicaciones.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ nombre: '', tipo: 'CAMPO', instrucciones_llegada: '', latitud: '', longitud: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (u: Ubicacion) => {
        setEditingId(u.id);
        setFormData({
            nombre: u.nombre,
            tipo: u.tipo || 'CAMPO',
            instrucciones_llegada: u.instrucciones_llegada || '',
            latitud: u.latitud?.toString() || '',
            longitud: u.longitud?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('tipo', formData.tipo);
        data.append('instrucciones_llegada', formData.instrucciones_llegada);
        if (formData.latitud) data.append('latitud', formData.latitud);
        if (formData.longitud) data.append('longitud', formData.longitud);

        let res;
        if (editingId) {
            res = await updateUbicacion(editingId, data);
        } else {
            res = await createUbicacion(data);
        }

        setIsLoading(false);

        if (res?.error) {
            alert(res.error);
        } else {
            setIsModalOpen(false);
            window.location.reload(); // Simple reload to refresh data
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return;
        setIsLoading(true);
        const res = await deleteUbicacion(id);
        setIsLoading(false);
        if (res?.error) {
            alert(res.error);
        } else {
            window.location.reload();
        }
    };

    const getTypeColor = (tipo: string) => {
        switch (tipo) {
            case 'PUERTO': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ACOPIO': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'PLANTA': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'CAMPO': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ubicaciones</h2>
                    <p className="text-gray-500">Administra puertos, acopios y campos</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-gray-900 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Nueva Ubicación
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ubicación o tipo..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUbicaciones.map((u) => (
                    <div key={u.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`px-2 py-1 rounded border text-[10px] font-bold tracking-wider uppercase ${getTypeColor(u.tipo)}`}>
                                {u.tipo}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenEdit(u)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(u.id)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            {u.nombre}
                        </h3>

                        <div className="space-y-2 text-sm text-gray-600">
                            {u.instrucciones_llegada ? (
                                <p className="line-clamp-2" title={u.instrucciones_llegada}>
                                    {u.instrucciones_llegada}
                                </p>
                            ) : (
                                <p className="text-gray-400 italic">Sin dirección / instrucciones</p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-50 mt-2">
                                <Navigation className="w-3 h-3" />
                                {u.latitud && u.longitud ? (
                                    <span className="font-mono">{u.latitud.toFixed(4)}, {u.longitud.toFixed(4)}</span>
                                ) : (
                                    <span className="text-gray-400">Sin coordenadas</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Editar Ubicación' : 'Nueva Ubicación'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:outline-none"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:outline-none"
                            value={formData.tipo}
                            onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                        >
                            <option value="CAMPO">Campo</option>
                            <option value="PUERTO">Puerto</option>
                            <option value="ACOPIO">Acopio</option>
                            <option value="PLANTA">Planta</option>
                            <option value="OTRO">Otro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Instrucciones</label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:outline-none"
                            value={formData.instrucciones_llegada}
                            onChange={e => setFormData({ ...formData, instrucciones_llegada: e.target.value })}
                            placeholder="Ej: Ruta 9 km 150, acceso por camino de tierra..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                value={formData.latitud}
                                onChange={e => setFormData({ ...formData, latitud: e.target.value })}
                                placeholder="-34.6037"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                value={formData.longitud}
                                onChange={e => setFormData({ ...formData, longitud: e.target.value })}
                                placeholder="-58.3816"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" isLoading={isLoading}>
                            {editingId ? 'Guardar Cambios' : 'Crear Ubicación'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
