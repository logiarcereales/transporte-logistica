'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Truck, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createChofer, updateChofer, deleteChofer } from '../actions';
import TrucksManager from './TrucksManager';

interface Chofer {
    id: string;
    nombre: string;
    telefono: string;
    cuit: string;
    camiones?: any[];
}

export default function ChoferesClient({ initialChoferes }: { initialChoferes: any[] }) {
    const [choferes, setChoferes] = useState(initialChoferes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTrucksModalOpen, setIsTrucksModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentChofer, setCurrentChofer] = useState<Partial<Chofer>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrado simple
    const filteredChoferes = choferes.filter((c) =>
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefono?.includes(searchTerm) ||
        c.cuit?.includes(searchTerm)
    );

    const handleOpenCreate = () => {
        setCurrentChofer({});
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (chofer: Chofer) => {
        setCurrentChofer(chofer);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleManageTrucks = (chofer: Chofer) => {
        setCurrentChofer(chofer);
        setIsTrucksModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este chofer?')) return;

        setIsLoading(true);
        const res = await deleteChofer(id);
        setIsLoading(false);

        if (res?.error) {
            alert(res.error);
        } else {
            // Optimistic update or refresh
            window.location.reload();
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        let res;
        if (isEditMode && currentChofer.id) {
            res = await updateChofer(currentChofer.id, formData);
        } else {
            res = await createChofer(formData);
        }

        setIsLoading(false);

        if (res?.error) {
            alert(res.error);
        } else {
            setIsModalOpen(false);
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Choferes</h2>
                    <p className="text-gray-500">Administra la flota de transportistas registrados</p>
                </div>
                <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
                    Nuevo Chofer
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, patente o teléfono..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Teléfono</th>
                                <th className="px-6 py-4">CUIT</th>
                                <th className="px-6 py-4">Camiones</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredChoferes.map((chofer: any) => (
                                <tr key={chofer.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {chofer.nombre ? chofer.nombre.substring(0, 2).toUpperCase() : 'NN'}
                                            </div>
                                            {chofer.nombre || 'Sin Nombre'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{chofer.telefono}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{chofer.cuit || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">
                                                {chofer.camiones?.length || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(chofer)}
                                                className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleManageTrucks(chofer)}
                                                className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                                                title="Gestionar Camiones"
                                            >
                                                <Truck className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(chofer.id)}
                                                className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredChoferes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron choferes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? "Editar Chofer" : "Nuevo Chofer"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        name="nombre"
                        label="Nombre Completo"
                        defaultValue={currentChofer.nombre}
                        required
                    />
                    <Input
                        name="telefono"
                        label="Teléfono (con 549)"
                        defaultValue={currentChofer.telefono}
                        required
                        placeholder="549351..."
                    />
                    <Input
                        name="cuit"
                        label="CUIT"
                        defaultValue={currentChofer.cuit}
                    />

                    {!isEditMode && (
                        <>
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Datos del Camión</h4>
                                <Input
                                    name="patente"
                                    label="Patente"
                                    placeholder="AA123BB"
                                />
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Camión</label>
                                    <select
                                        name="tipo_camion"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="CHASIS_Y_ACOPLADO">Chasis y Acoplado</option>
                                        <option value="BATEA">Batea</option>
                                        <option value="TOLVA">Tolva</option>
                                        <option value="SEMIREMOLQUE">Semiremolque</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {isEditMode ? "Guardar Cambios" : "Crear Chofer"}
                        </Button>
                    </div>
                </form>
            </Modal>


            {/* Trucks Modal */}
            <Modal
                isOpen={isTrucksModalOpen}
                onClose={() => setIsTrucksModalOpen(false)}
                title={`Gestionar Camiones - ${currentChofer.nombre}`}
            >
                {currentChofer.id && (
                    <TrucksManager
                        choferId={currentChofer.id}
                        initialTrucks={currentChofer.camiones || []}
                        onUpdate={() => window.location.reload()}
                    />
                )}
            </Modal>
        </div >
    );
}
