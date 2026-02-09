'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Truck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addCamionToChofer, deleteCamion } from '../actions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';

interface Camion {
    id: string;
    patente: string;
    tipo_camion: string;
    nombre_fantasia?: string;
    link_id?: string;
}

interface TrucksManagerProps {
    choferId: string;
    initialTrucks: Camion[];
    onUpdate: () => void; // Para recargar la lista principal
}

export default function TrucksManager({ choferId, initialTrucks, onUpdate }: TrucksManagerProps) {
    const [trucks, setTrucks] = useState<Camion[]>(initialTrucks);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modal Delete State for Truck
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [truckToDelete, setTruckToDelete] = useState<{ id: string, linkId?: string } | null>(null);

    const handleAddTruck = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const res = await addCamionToChofer(choferId, formData);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Camión agregado');
            setIsAdding(false);
            onUpdate(); // Recargar datos
        }
        setIsLoading(false);
    };

    const openDeleteTruckModal = (camionId: string, linkId?: string) => {
        setTruckToDelete({ id: camionId, linkId });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDeleteTruck = async () => {
        if (!truckToDelete) return;

        setIsLoading(true);
        const res = await deleteCamion(truckToDelete.id, truckToDelete.linkId);
        setIsLoading(false);
        setIsDeleteModalOpen(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Camión eliminado');
            onUpdate();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Flota Asignada
                </h3>
                {!isAdding && (
                    <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)} icon={<Plus className="w-3 h-3" />}>
                        Agregar Camión
                    </Button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAddTruck} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                        <Input name="patente" placeholder="Patente (AA123BB)" required autoFocus />
                        <select
                            name="tipo_camion"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="CHASIS_Y_ACOPLADO">Chasis y Acoplado</option>
                            <option value="BATEA">Batea</option>
                            <option value="TOLVA">Tolva</option>
                            <option value="SEMIREMOLQUE">Semiremolque</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" isLoading={isLoading}>
                            Guardar
                        </Button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {trucks.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No hay camiones asignados.
                    </p>
                ) : (
                    trucks.map((truck) => (
                        <div key={truck.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-100 transition-colors">
                            <div>
                                <p className="font-medium text-gray-900">{truck.patente}</p>
                                <p className="text-xs text-gray-500 capitalize">{truck.tipo_camion.replace(/_/g, ' ').toLowerCase()}</p>
                            </div>
                            <button
                                onClick={() => openDeleteTruckModal(truck.id, truck.link_id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar camión"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Confirm Delete Truck */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Camión">
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3">
                        <Trash2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">¿Estás seguro de eliminar este camión?</h4>
                            <p className="text-sm opacity-90 mt-1">Se borrará de la flota del chofer.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmDeleteTruck} isLoading={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                            Sí, Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
