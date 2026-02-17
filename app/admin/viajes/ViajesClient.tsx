'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, User, Truck, XCircle, CheckCircle, ArrowRight, Clock, Edit2, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { createViaje, cancelTrip, assignDriver, updateTripStatus, deleteViaje } from '../actions';
import { toast } from 'sonner';

interface Viaje {
    id: string;
    cereal: string;
    toneladas: number;
    estado: string;
    ctg?: string;
    fecha_carga?: string;
    tarifa_base?: number;
    productor: { nombre: string };
    origen: { nombre: string };
    destino: { nombre: string };
    camionero?: { nombre: string; telefono: string };
    id_camionero?: string;
}

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

const QUICK_FILTERS = [
    { label: 'Todos', value: 'TODOS', count: 0 },
    { label: 'Pendientes', value: 'SOLICITADO', count: 0, highlight: true },
    { label: 'En Curso', value: 'EN_VIAJE', count: 0 },
    { label: 'Completados', value: 'FINALIZADO', count: 0 },
];

export default function ViajesClient({
    initialViajes,
    choferesDisponibles,
    productores,
    ubicaciones,
    tarifas = [],
    initialFilterStatus
}: {
    initialViajes: any[],
    choferesDisponibles: any[],
    productores: any[],
    ubicaciones: any[],
    tarifas: any[],
    initialFilterStatus?: string
}) {
    const [viajes, setViajes] = useState(initialViajes);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState(initialFilterStatus || 'TODOS');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Set filter from URL param on mount
    useEffect(() => {
        if (initialFilterStatus) {
            setFilterStatus(initialFilterStatus);
        }
    }, [initialFilterStatus]);

    // Modal States
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedViajeId, setSelectedViajeId] = useState<string | null>(null);
    const [selectedChoferId, setSelectedChoferId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [tripToCancelId, setTripToCancelId] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tripToDeleteId, setTripToDeleteId] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [isEditTariffModalOpen, setIsEditTariffModalOpen] = useState(false);
    const [tariffToEdit, setTariffToEdit] = useState<{ id: string, valor: number } | null>(null);

    const [newTrip, setNewTrip] = useState({
        id_productor: '',
        id_origen: '',
        id_destino: '',
        tarifa_base: 0
    });
    const [filterByProducer, setFilterByProducer] = useState(true);

    // Derived Logic
    const selectedProductor = productores.find(p => p.id === newTrip.id_productor);
    const filteredOrigins = (filterByProducer && selectedProductor?.ubicaciones && selectedProductor.ubicaciones.length > 0)
        ? ubicaciones.filter(u => selectedProductor.ubicaciones.some((linked: any) => linked.id === u.id))
        : ubicaciones;

    // Auto-calculate tariff
    useEffect(() => {
        if (newTrip.id_origen && newTrip.id_destino) {
            const matchingTariff = tarifas.find(
                (t: any) => t.id_origen === newTrip.id_origen && t.id_destino === newTrip.id_destino
            );
            if (matchingTariff) {
                setNewTrip(prev => ({ ...prev, tarifa_base: matchingTariff.valor }));
            }
        }
    }, [newTrip.id_origen, newTrip.id_destino, tarifas]);

    // Filtering Logic
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

    // Status count for quick filters
    const statusCounts = QUICK_FILTERS.map(filter => ({
        ...filter,
        count: filter.value === 'TODOS' ? viajes.length : viajes.filter(v => v.estado === filter.value).length
    }));

    // Handlers
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

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Viaje cancelado');
            setIsCancelModalOpen(false);
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

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Viaje eliminado');
            setIsDeleteModalOpen(false);
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

    const openEditTariffModal = (id: string, currentTariff: number) => {
        setTariffToEdit({ id, valor: currentTariff });
        setIsEditTariffModalOpen(true);
    };

    const handleUpdateTariff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tariffToEdit) return;

        setIsLoading(true);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Subtle texture overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Gestión de Viajes</h2>
                        <p className="text-slate-500 mt-1">Monitorea y asigna las cargas solicitadas</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Viaje
                    </Button>
                </div>

                {/* Quick Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {statusCounts.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === filter.value
                                    ? filter.highlight
                                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-sm'
                                        : 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {filter.label}
                            <span className={`ml-2 ${filterStatus === filter.value ? 'opacity-100' : 'opacity-50'}`}>
                                ({filter.count})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por cereal, productor, CTG..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Desde:</span>
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Hasta:</span>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Mostrando <span className="font-semibold text-slate-900">{filteredViajes.length}</span> viaje{filteredViajes.length !== 1 ? 's' : ''}
                    </p>
                    {(searchTerm || filterStatus !== 'TODOS' || dateFrom || dateTo) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('TODOS');
                                setDateFrom('');
                                setDateTo('');
                            }}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Trips Table (Desktop) / Cards (Mobile) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CTG/ID</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Productor</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruta</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Carga</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chofer</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarifa</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredViajes.map((viaje) => (
                                    <tr key={viaje.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-3 px-4">
                                            {viaje.ctg ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {viaje.ctg}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">#{viaje.id.slice(0, 8)}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[viaje.estado] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                {viaje.estado}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-medium text-slate-900">{viaje.productor?.nombre || '-'}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-0.5 max-w-[180px]">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                    <span className="truncate">{viaje.origen?.nombre || 'Origen'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-900 font-medium">
                                                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                                    <span className="truncate">{viaje.destino?.nombre || 'Destino'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900">{viaje.cereal}</span>
                                                <span className="text-xs text-slate-500">{viaje.toneladas} TN</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {viaje.camionero?.nombre ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-900">{viaje.camionero.nombre}</span>
                                                    <span className="text-xs text-slate-500">{viaje.camionero.telefono}</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openAssignModal(viaje.id)}
                                                    className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                                                >
                                                    <User className="w-3 h-3" />
                                                    Asignar
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {viaje.tarifa_base ? (
                                                <button
                                                    onClick={() => openEditTariffModal(viaje.id, viaje.tarifa_base)}
                                                    className="text-sm font-mono font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                                                >
                                                    ${viaje.tarifa_base}
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {viaje.fecha_carga ? new Date(viaje.fecha_carga).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openStatusModal(viaje.id, viaje.estado)}
                                                    className="px-2 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all"
                                                    title="Cambiar Estado"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                {viaje.estado !== 'CANCELADO' && viaje.estado !== 'FINALIZADO' && (
                                                    <button
                                                        onClick={() => openCancelModal(viaje.id)}
                                                        className="px-2 h-7 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                                                        title="Cancelar Viaje"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openDeleteModal(viaje.id)}
                                                    className="px-2 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-slate-100">
                        {filteredViajes.map((viaje) => (
                            <div key={viaje.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[viaje.estado]}`}>
                                                {viaje.estado}
                                            </span>
                                            {viaje.ctg && (
                                                <span className="text-xs font-mono text-slate-500">CTG: {viaje.ctg}</span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-slate-900">{viaje.productor?.nombre}</p>
                                        <p className="text-sm text-slate-600">{viaje.cereal} · {viaje.toneladas} TN</p>
                                    </div>
                                    {viaje.tarifa_base && (
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Tarifa</p>
                                            <p className="text-lg font-bold text-emerald-700">${viaje.tarifa_base}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>{viaje.origen?.nombre} → {viaje.destino?.nombre}</span>
                                    </div>
                                    {viaje.camionero?.nombre && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Truck className="w-4 h-4 flex-shrink-0" />
                                            <span>{viaje.camionero.nombre} ({viaje.camionero.telefono})</span>
                                        </div>
                                    )}
                                    {viaje.fecha_carga && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span>{new Date(viaje.fecha_carga).toLocaleDateString('es-AR')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {!viaje.camionero && (
                                        <Button size="sm" onClick={() => openAssignModal(viaje.id)} className="flex-1">
                                            <User className="w-3 h-3 mr-1" />
                                            Asignar
                                        </Button>
                                    )}
                                    <Button size="sm" variant="secondary" onClick={() => openStatusModal(viaje.id, viaje.estado)} className="flex-1">
                                        <Edit2 className="w-3 h-3 mr-1" />
                                        Estado
                                    </Button>
                                    {viaje.estado !== 'CANCELADO' && viaje.estado !== 'FINALIZADO' && (
                                        <Button size="sm" variant="secondary" onClick={() => openCancelModal(viaje.id)}>
                                            <XCircle className="w-3 h-3" />
                                        </Button>
                                    )}
                                    <Button size="sm" variant="secondary" onClick={() => openDeleteModal(viaje.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredViajes.length === 0 && (
                        <div className="p-12 text-center">
                            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium mb-1">No se encontraron viajes</p>
                            <p className="text-sm text-slate-400">Probá ajustando los filtros o creando un nuevo viaje</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Asignar Chofer">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Seleccioná un chofer de la lista para asignarle esta carga.</p>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Chofer</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={selectedChoferId}
                            onChange={(e) => setSelectedChoferId(e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            {choferesDisponibles.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre} ({c.telefono})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAssign} isLoading={isLoading} disabled={!selectedChoferId}>
                            Confirmar Asignación
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Actualizar Estado del Viaje">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Cambiar manualmente el estado del viaje.</p>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Nuevo Estado</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={statusToUpdate}
                            onChange={(e) => setStatusToUpdate(e.target.value)}
                        >
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
                        <Button variant="secondary" onClick={() => setIsStatusModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateStatus} isLoading={isLoading}>
                            Guardar
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nuevo Viaje">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Productor</label>
                        <select
                            name="id_productor"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={newTrip.id_productor}
                            onChange={(e) => setNewTrip(prev => ({ ...prev, id_productor: e.target.value, id_origen: '' }))}
                        >
                            <option value="">Seleccionar...</option>
                            {productores.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Cereal</label>
                            <select name="cereal" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option value="">Seleccionar...</option>
                                {['SOJA', 'MAIZ', 'TRIGO', 'GIRASOL', 'CEBADA', 'SORGO'].map(c => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Toneladas</label>
                            <input
                                type="number"
                                name="toneladas"
                                required
                                min="1"
                                step="0.1"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700">Origen</label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filterByProducer}
                                        onChange={(e) => setFilterByProducer(e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3 h-3"
                                    />
                                    <span className="text-xs text-emerald-600">Filtrar por Productor</span>
                                </label>
                            </div>
                            <select
                                name="id_origen"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                value={newTrip.id_origen}
                                onChange={(e) => setNewTrip(prev => ({ ...prev, id_origen: e.target.value }))}
                            >
                                <option value="">Seleccionar...</option>
                                {filteredOrigins.map((u: any) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Destino</label>
                            <select
                                name="id_destino"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                value={newTrip.id_destino}
                                onChange={(e) => setNewTrip(prev => ({ ...prev, id_destino: e.target.value }))}
                            >
                                <option value="">Seleccionar...</option>
                                {ubicaciones.map((u: any) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Tarifa ($ / TN)</label>
                        <input
                            type="number"
                            name="tarifa_base"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-lg font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={newTrip.tarifa_base}
                            onChange={(e) => setNewTrip(prev => ({ ...prev, tarifa_base: parseFloat(e.target.value) }))}
                        />
                        {newTrip.tarifa_base > 0 && (
                            <p className="text-xs text-slate-500">
                                Total estimado: ${(newTrip.tarifa_base * 30).toFixed(2)} (base en 30 TN)
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Crear Viaje
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditTariffModalOpen} onClose={() => setIsEditTariffModalOpen(false)} title="Editar Tarifa del Viaje">
                <form onSubmit={handleUpdateTariff} className="space-y-4">
                    <p className="text-sm text-slate-600">Modificar el precio base por tonelada para este viaje.</p>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Tarifa ($ / TN)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancelar Viaje">
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-lg flex items-start gap-3">
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">¿Estás seguro de cancelar este viaje?</h4>
                            <p className="text-sm opacity-90 mt-1">Esta acción finalizará el viaje inmediatamente. No se podrá deshacer.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
                            No, volver
                        </Button>
                        <Button onClick={handleConfirmCancel} isLoading={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                            Sí, Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Viaje">
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3">
                        <Trash2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">¿Estás seguro de eliminar este viaje?</h4>
                            <p className="text-sm opacity-90 mt-1">
                                Esta acción borrará el registro de la base de datos permanentemente.
                                <br />
                                Si solo querés anularlo, usá "Cancelar".
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmDelete} isLoading={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                            Sí, Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
