import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';



import { searchTripByCtg } from '@/app/actions/producerActions';

interface TrackingViewProps {
    onBack: () => void;
}

export default function TrackingView({ onBack }: TrackingViewProps) {
    const [ctg, setCtg] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ctg.trim()) return;

        setLoading(true);
        setSearched(false);
        setResult(null);

        try {
            const data = await searchTripByCtg(ctg);
            setResult(data);
            setSearched(true);
        } catch (error) {
            console.error(error);
            toast.error('Error al buscar el viaje.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Seguimiento</h1>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">CTG / Carta de Porte</label>
                            <Input
                                value={ctg}
                                onChange={(e) => setCtg(e.target.value)}
                                placeholder="Ingresá el código..."
                                className="h-14 text-lg bg-slate-50 border-transparent focus:bg-white focus:border-green-500/20"
                            />
                        </div>
                        <Button type="submit" isLoading={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                            Buscar Viaje
                        </Button>
                    </form>
                </div>

                {searched && !result && (
                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <h3 className="font-bold text-red-900">No encontrado</h3>
                        <p className="text-sm text-red-600 mt-1">No existe ningún viaje con ese CTG.</p>
                    </div>
                )}

                {result && (
                    <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 animate-in fade-in slide-in-from-bottom-4 space-y-4">
                        {/* Status Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado Actual</span>
                                <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(result.estado)}`}>
                                    {result.estado}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CTG</span>
                                <p className="font-mono text-gray-900 font-bold">{result.ctg}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-4"></div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chofer</span>
                                <p className="font-bold text-gray-900">{result.chofer?.nombre || 'Sin asignar'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camión</span>
                                <p className="font-bold text-gray-900">{result.camion?.patente || '---'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl mt-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 min-w-[10px] h-[10px] rounded-full bg-green-500"></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Origen</p>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{result.origen?.nombre}</p>
                                </div>
                            </div>
                            <div className="ml-[5px] w-[2px] h-6 bg-gray-200 my-1"></div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 min-w-[10px] h-[10px] rounded-full bg-red-500"></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Destino</p>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{result.destino?.nombre}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'SOLICITADO': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'ASIGNADO': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'EN_CURSO': return 'bg-green-50 text-green-700 border-green-200';
        case 'FINALIZADO': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'CANCELADO': return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
}
