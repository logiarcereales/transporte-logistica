'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Search, DollarSign } from 'lucide-react';
import { createTarifa, updateTarifa, deleteTarifa } from '../actions';
import { toast } from 'sonner';

interface Tarifa {
    id: string;
    km_desde: number;
    km_hasta: number;
    precio_tonelada: number;
}

export default function TarifasClient({ initialTarifas }: { initialTarifas: any[] }) {
    const [tarifas, setTarifas] = useState<Tarifa[]>(initialTarifas);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTarifa, setCurrentTarifa] = useState<Partial<Tarifa>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const filteredTarifas = tarifas.filter(t =>
        t.km_desde.toString().includes(searchTerm) ||
        t.km_hasta.toString().includes(searchTerm)
    );

    const handleOpenCreate = () => {
        setCurrentTarifa({});
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (tarifa: Tarifa) => {
        setCurrentTarifa(tarifa);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const openDeleteModal = (id: string) => {
        setIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!idToDelete) return;
        setIsLoading(true);
        const res = await deleteTarifa(idToDelete);
        setIsLoading(false);
        setIsDeleteModalOpen(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Tarifa eliminada');
            window.location.reload();
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        // Basic validation
        const desde = parseInt(formData.get('km_desde') as string);
        const hasta = parseInt(formData.get('km_hasta') as string);

        if (desde >= hasta) {
            toast.error('El KM Hasta debe ser mayor al KM Desde');
            setIsLoading(false);
            return;
        }

        let res;
        if (isEditMode && currentTarifa.id) {
            res = await updateTarifa(currentTarifa.id, formData);
        } else {
            res = await createTarifa(formData);
        }

        setIsLoading(false);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(isEditMode ? 'Tarifa actualizada' : 'Tarifa creada');
            setIsModalOpen(false);
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">¡Tarifario!</h2>
                    <p className="text-gray-500">Configurá los precios por tonelada según distancias</p>
                </div>
                <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />} className="bg-emerald-600 hover:bg-emerald-700">
                    Nueva Tarifa
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Rango (KM)</th>
                            <th className="px-6 py-4">Precio / TN</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredTarifas.map((tarifa) => (
                            <tr key={tarifa.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {tarifa.km_desde} km - {tarifa.km_hasta} km
                                </td>
                                <td className="px-6 py-4 text-emerald-600 font-bold text-lg">
                                    ${Number(tarifa.precio_tonelada).toLocaleString('es-AR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleOpenEdit(tarifa)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => openDeleteModal(tarifa.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredTarifas.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        No hay tarifas cargadas.
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? "Editar Tarifa" : "Nueva Tarifa"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="km_desde"
                            label="KM Desde"
                            type="number"
                            defaultValue={currentTarifa.km_desde}
                            required
                        />
                        <Input
                            name="km_hasta"
                            label="KM Hasta"
                            type="number"
                            defaultValue={currentTarifa.km_hasta}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Input
                            name="precio_tonelada"
                            label="Precio por Tonelada"
                            type="number"
                            step="0.01"
                            defaultValue={currentTarifa.precio_tonelada}
                            required
                            className="pl-8"
                        />
                        <DollarSign className="w-4 h-4 absolute left-3 top-[38px] text-gray-400" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" isLoading={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                            {isEditMode ? "Guardar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Confirm Delete */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Tarifa">
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3">
                        <Trash2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">¿Estás seguro de eliminar esta tarifa?</h4>
                            <p className="text-sm opacity-90 mt-1">Esta acción no se puede deshacer.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmDelete} isLoading={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                            Sí, Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
