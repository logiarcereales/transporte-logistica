'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addCamionToChofer, deleteCamion } from '../actions';

interface Camion {
    id: string;
    patente: string;
    tipo_camion: string;
    nombre_fantasia?: string;
    link_id?: string; // ID de la relación transportista_camion
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

    const handleAddTruck = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const res = await addCamionToChofer(choferId, formData);

        if (res?.error) {
            alert(res.error);
        } else {
            setIsAdding(false);
            onUpdate(); // Recargar datos
        }
        setIsLoading(false);
    };

    const handleDeleteTruck = async (camionId: string, linkId?: string) => {
        if (!confirm('¿Seguro que querés eliminar este camión?')) return;

        setIsLoading(true);
        const res = await deleteCamion(camionId, linkId);

        if (res?.error) {
            alert(res.error);
        } else {
            onUpdate();
        }
        setIsLoading(false);
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
                                onClick={() => handleDeleteTruck(truck.id, truck.link_id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar camión"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
