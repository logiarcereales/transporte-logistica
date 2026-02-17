'use client';

import React, { useState } from 'react';
import { Search, Filter, MapPin, Calendar, User, Truck, XCircle, CheckCircle, ArrowRight, Clock, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { createViaje, cancelTrip, assignDriver, updateTripStatus, deleteViaje } from '../actions';
import { toast } from 'sonner';

interface Viaje {
    id: string;
    cereal: string;
    toneladas: number;
    estado: string;
    fecha_carga?: string;
    productor: { nombre: string };
    origen: { nombre: string };
    destino: { nombre: string };
    camionero?: { nombre: string; telefono: string };
    id_camionero?: string;
}

export default function ViajesClient({
    initialViajes,
    choferesDisponibles,
    productores,
    ubicaciones,
    tarifas = []
}: {
    initialViajes: any[],
    choferesDisponibles: any[],
    productores: any[],
    ubicaciones: any[],
    tarifas: any[]
}) {
    const [viajes, setViajes] = useState(initialViajes);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('TODOS');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal Asignación
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedViajeId, setSelectedViajeId] = useState<string | null>(null);
    const [selectedChoferId, setSelectedChoferId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Modal Estado
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    // Modal Cancelar State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [tripToCancelId, setTripToCancelId] = useState<string | null>(null);

    // Modal Eliminar State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tripToDeleteId, setTripToDeleteId] = useState<string | null>(null);

    // Modal Nuevo Viaje State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Modal Edit Tariff
    const [isEditTariffModalOpen, setIsEditTariffModalOpen] = useState(false);
    const [tariffToEdit, setTariffToEdit] = useState<{ id: string, valor: number } | null>(null);

    const openEditTariffModal = (id: string, currentTariff: number) => {
        setTariffToEdit({ id, valor: currentTariff });
        setIsEditTariffModalOpen(true);
    };

    const handleUpdateTariff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tariffToEdit) return;

        setIsLoading(true);
        // Dynamically import to avoid circular dependencies if any, or just use the imported one
        const { updateTripTariff } = await import('../actions');

        const res = await updateTripTariff(tariffToEdit.id, tariffToEdit.valor);

        setIsLoading(false);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Tarifa actualizada correctamente');
            setIsEditTariffModalOpen(false);
            window.location.reload();
        }
    };
    // ... existing derived logic ...
    const [newTrip, setNewTrip] = useState({
        id_productor: '',
        id_origen: '',
        id_destino: '',
        tarifa_base: 0
    });
    const [filterByProducer, setFilterByProducer] = useState(true); // Toggle state

    // Derived Logic for New Trip
    const selectedProductor = productores.find(p => p.id === newTrip.id_productor);

    // Filter Origins logic
    const filteredOrigins = (filterByProducer && selectedProductor?.ubicaciones && selectedProductor.ubicaciones.length > 0)
        ? ubicaciones.filter(u => selectedProductor.ubicaciones.some((linked: any) => linked.id === u.id))
        : ubicaciones;


    const filteredViajes = viajes.filter((v) => {
        const matchesSearch =
            v.cereal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.productor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'TODOS' || v.estado === filterStatus;

        let matchesDate = true;
        if (dateFrom || dateTo) {
            if (!v.fecha_carga) return false;

            const viajeDate = new Date(v.fecha_carga);
            if (dateFrom) {
                matchesDate = matchesDate && viajeDate >= new Date(dateFrom);
            }
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59);
                matchesDate = matchesDate && viajeDate <= endDate;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const res = await createViaje(formData);

        setIsLoading(false);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Viaje creado con éxito');
            setIsCreateModalOpen(false);
            window.location.reload();
        }
    };

    const openCancelModal = (id: string) => {
        setTripToCancelId(id);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!tripToCancelId) return;

        setIsLoading(true);
        const res = await cancelTrip(tripToCancelId);
        setIsLoading(false);
        setIsCancelModalOpen(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Viaje cancelado correctamente');
            window.location.reload();
        }
    };

    const openDeleteModal = (id: string) => {
        setTripToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!tripToDeleteId) return;

        setIsLoading(true);
        const res = await deleteViaje(tripToDeleteId);
        setIsLoading(false);
        setIsDeleteModalOpen(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Viaje eliminado correctamente');
            window.location.reload();
        }
    };

    const openAssignModal = (id: string) => {
        setSelectedViajeId(id);
        setSelectedChoferId('');
        setIsAssignModalOpen(true);
    };

    const handleAssign = async () => {
        if (!selectedViajeId || !selectedChoferId) return;

        setIsLoading(true);
        const res = await assignDriver(selectedViajeId, selectedChoferId);
        setIsLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Chofer asignado correctamente');
            setIsAssignModalOpen(false);
            window.location.reload();
        }
    };

    const openStatusModal = (id: string, currentStatus: string) => {
        setSelectedViajeId(id);
        setStatusToUpdate(currentStatus);
        setIsStatusModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedViajeId || !statusToUpdate) return;
        setIsLoading(true);
        const res = await updateTripStatus(selectedViajeId, statusToUpdate);
        setIsLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Estado actualizado');
            setIsStatusModalOpen(false);
            window.location.reload();
        }
    };

    const getStatusStyles = (estado: string) => {
        switch (estado) {
            case 'SOLICITADO': return 'text-yellow-700 border-yellow-200 bg-yellow-50';
            case 'ASIGNADO': return 'text-blue-700 border-blue-200 bg-blue-50';
            case 'CARGADO': return 'text-indigo-700 border-indigo-200 bg-indigo-50';
            case 'EN_VIAJE': return 'text-purple-700 border-purple-200 bg-purple-50';
            case 'EN_DESTINO': return 'text-cyan-700 border-cyan-200 bg-cyan-50';
            case 'DESCARGADO': return 'text-teal-700 border-teal-200 bg-teal-50';
            case 'FINALIZADO': return 'text-green-700 border-green-200 bg-green-50';
            case 'CANCELADO': return 'text-red-700 border-red-200 bg-red-50';
            default: return 'text-gray-700 border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Viajes</h2>
                    <p className="text-gray-500">Monitorea y asigna las cargas solicitadas</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-white">
                    Nuevo Viaje
                </Button>
            </div>

            {/* Search & Filters Container */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cereal o productor..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm font-medium text-gray-700 w-full lg:w-auto"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="TODOS">Todos los Estados</option>
                        <option value="SOLICITADO">Solicitado</option>
                        <option value="ASIGNADO">Asignado</option>
                        <option value="CARGADO">Cargado</option>
                        <option value="EN_VIAJE">En Viaje</option>
                        <option value="EN_DESTINO">En Destino</option>
                        <option value="DESCARGADO">Descargado</option>
                        <option value="FINALIZADO">Finalizado</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>

                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap"> Desde:</span>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap"> Hasta:</span>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-3">
                {filteredViajes.map((viaje: any) => (
                    <div key={viaje.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors group">
                        <div className="flex flex-col md:flex-row justify-between gap-6">

                            {/* Left Section: Main Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-2.5 py-0.5 rounded border text-[10px] font-bold tracking-wider uppercase ${getStatusStyles(viaje.estado)}`}>
                                            {viaje.estado}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">#{viaje.id.slice(0, 6)}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {viaje.fecha_carga ? new Date(viaje.fecha_carga).toLocaleDateString('es-AR') : '-'}
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 leading-none mb-1">{viaje.cereal}</h2>
                                    <span className="text-sm font-medium text-gray-500">{viaje.toneladas} Toneladas</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            <User className="w-3 h-3" /> Productor
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{viaje.productor?.nombre || 'Desconocido'}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            <MapPin className="w-3 h-3" /> Ruta
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span>{viaje.origen?.nombre || 'Origen'}</span>
                                            <ArrowRight className="w-3 h-3 text-gray-300" />
                                            <span>{viaje.destino?.nombre || 'Destino'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 col-span-1 sm:col-span-2 pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            <span>Tarifa Base</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-emerald-600">
                                                $ {Number(viaje.tarifa_base || 0).toLocaleString('es-AR')}
                                            </span>
                                            <button
                                                onClick={() => openEditTariffModal(viaje.id, viaje.tarifa_base || 0)}
                                                className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                                                title="Editar Tarifa"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider on Mobile / Vertical Line on Desktop */}
                            <div className="h-px w-full md:h-auto md:w-px bg-gray-100" />

                            {/* Right Section: Driver & Actions */}
                            <div className="flex flex-col justify-between gap-4 md:w-48">
                                <div className={`rounded-lg p-3 border ${viaje.camionero ? 'bg-gray-50 border-gray-200' : 'bg-white border-dashed border-gray-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Truck className={`w-3.5 h-3.5 ${viaje.camionero ? 'text-gray-700' : 'text-gray-400'}`} />
                                        <span className={`text-xs font-semibold uppercase tracking-wide ${viaje.camionero ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {viaje.camionero ? 'Chofer' : 'Vacante'}
                                        </span>
                                    </div>
                                    {viaje.camionero ? (
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 truncate" title={viaje.camionero.nombre}>{viaje.camionero.nombre}</div>
                                            <div className="text-xs text-gray-500">{viaje.camionero.telefono}</div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-400 italic">Sin asignar</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Button size="sm" variant="secondary" onClick={() => openAssignModal(viaje.id)} className="w-full justify-center text-xs h-8 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700">
                                        {viaje.id_camionero ? 'Reasignar' : 'Asignar Chofer'}
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => openStatusModal(viaje.id, viaje.estado)} className="flex-1 justify-center text-xs h-8 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700">
                                            Estado
                                        </Button>
                                        {viaje.estado !== 'CANCELADO' && (
                                            <button onClick={() => openCancelModal(viaje.id)} className="px-2 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded border border-transparent hover:border-orange-100 transition-all" title="Cancelar Viaje">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => openDeleteModal(viaje.id)} className="px-2 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-all" title="Eliminar Viaje">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Asignar */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Asignar Chofer Manualmente">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Seleccioná un chofer de la lista para asignarle esta carga inmediatamente.</p>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Chofer</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={selectedChoferId} onChange={(e) => setSelectedChoferId(e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {choferesDisponibles.map((c: any) => <option key={c.id} value={c.id}>{c.nombre} ({c.telefono})</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAssign} isLoading={isLoading} disabled={!selectedChoferId}>Confirmar Asignación</Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Estado */}
            <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Actualizar Estado del Viaje">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Cambiar manualmente el estado del viaje.</p>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Nuevo Estado</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={statusToUpdate} onChange={(e) => setStatusToUpdate(e.target.value)}>
                            <option value="SOLICITADO">SOLICITADO</option>
                            <option value="ASIGNADO">ASIGNADO</option>
                            <option value="CARGADO">CARGADO</option>
                            <option value="EN_VIAJE">EN_VIAJE</option>
                            <option value="EN_DESTINO">EN_DESTINO</option>
                            <option value="DESCARGADO">DESCARGADO</option>
                            <option value="FINALIZADO">FINALIZADO</option>
                            <option value="CANCELADO">CANCELADO</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setIsStatusModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateStatus} isLoading={isLoading}>Guardar</Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Create Trip */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nuevo Viaje">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Productor</label>
                        <select
                            name="id_productor"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={newTrip.id_productor}
                            onChange={(e) => setNewTrip(prev => ({ ...prev, id_productor: e.target.value, id_origen: '' }))}
                        >
                            <option value="">Seleccionar...</option>
                            {productores.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Cereal</label>
                            <select name="cereal" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">Seleccionar...</option>
                                {['SOJA', 'MAIZ', 'TRIGO', 'GIRASOL', 'CEBADA', 'SORGO'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Toneladas</label>
                            <input type="number" name="toneladas" required min="1" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Origen</label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filterByProducer}
                                        onChange={(e) => setFilterByProducer(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                                    />
                                    <span className="text-xs text-indigo-600">Filtrar por Productor</span>
                                </label>
                            </div>
                            <select
                                name="id_origen"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={newTrip.id_origen}
                                onChange={(e) => setNewTrip(prev => ({ ...prev, id_origen: e.target.value }))}
                            >
                                <option value="">Seleccionar...</option>
                                {filteredOrigins.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Destino</label>
                            <select
                                name="id_destino"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={newTrip.id_destino}
                                onChange={(e) => setNewTrip(prev => ({ ...prev, id_destino: e.target.value }))}
                            >
                                <option value="">Seleccionar...</option>
                                {/* Usually destination is not filtered by producer, but could be. For now show all. */}
                                {ubicaciones.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Tarifa ($ / TN)
                        </label>
                        <input
                            type="number"
                            name="tarifa_base"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                            value={newTrip.tarifa_base}
                            onChange={(e) => setNewTrip(prev => ({ ...prev, tarifa_base: parseFloat(e.target.value) }))}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" isLoading={isLoading}>Crear Viaje</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Tariff */}
            <Modal
                isOpen={isEditTariffModalOpen}
                onClose={() => setIsEditTariffModalOpen(false)}
                title="Editar Tarifa del Viaje"
            >
                <form onSubmit={handleUpdateTariff} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Modificar el precio base por tonelada para este viaje.
                    </p>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tarifa ($ / TN)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold text-emerald-700"
                            value={tariffToEdit?.valor || ''}
                            onChange={(e) => setTariffToEdit(prev => prev ? { ...prev, valor: parseFloat(e.target.value) } : null)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsEditTariffModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Modal>
            {/* Modal Confirmar Cancelación */}
            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancelar Viaje">
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3">
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">¿Estás seguro de cancelar este viaje?</h4>
                            <p className="text-sm opacity-90 mt-1">Esta acción finalizará el viaje inmediatamente y notificará a las partes involucradas. No se podrá deshacer.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>No, volver</Button>
                        <Button onClick={handleConfirmCancel} isLoading={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                            Sí, Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Confirmar Eliminación */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Viaje permanentemente">
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3">
                        <Trash2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">¿Estás seguro de eliminar este viaje?</h4>
                            <p className="text-sm opacity-90 mt-1">
                                Esta acción borrará el registro de la base de datos permanentemente.
                                <br />Si solo querés anularlo, usá "Cancelar".
                            </p>
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
        </div>
    );
}
