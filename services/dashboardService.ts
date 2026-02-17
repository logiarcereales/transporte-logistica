import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function getDashboardStats() {
    // 1. Fetch active trips (not cancelled, not completed)
    const { data: activeTrips, error: errorActive } = await supabase
        .from('viaje')
        .select('id, estado, toneladas, cereal, fecha_carga')
        .neq('estado', 'CANCELADO')
        .neq('estado', 'FINALIZADO');

    if (errorActive) throw errorActive;

    // 2. Fetch all trips for volume stats (e.g. last 30 days or all time)
    const { data: allTrips, error: errorAll } = await supabase
        .from('viaje')
        .select('id, estado, toneladas, cereal')
        .neq('estado', 'CANCELADO');

    if (errorAll) throw errorAll;

    // KPIs
    const totalActive = activeTrips?.length || 0;
    const pendingAssignment = activeTrips?.filter(t => t.estado === 'SOLICITADO').length || 0;
    const tripsInProgress = activeTrips?.filter(t => t.estado === 'EN_VIAJE').length || 0;

    // Total Volume (All time)
    const totalTons = allTrips?.reduce((acc, curr) => acc + (curr.toneladas || 0), 0) || 0;

    // Chart Data: Volume by Cereal
    const volumeByCerealMap = new Map<string, number>();
    allTrips?.forEach(t => {
        const cereal = t.cereal || 'Otro';
        volumeByCerealMap.set(cereal, (volumeByCerealMap.get(cereal) || 0) + (t.toneladas || 0));
    });

    const volumeByCereal = Array.from(volumeByCerealMap.entries()).map(([name, value]) => ({
        name,
        value
    }));

    // Chart Data: Status Distribution
    const statusMap = new Map<string, number>();
    allTrips?.forEach(t => {
        const estado = t.estado || 'Desconocido';
        statusMap.set(estado, (statusMap.get(estado) || 0) + 1);
    });

    const statusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({
        name,
        value
    }));

    return {
        kpis: {
            totalActive,
            pendingAssignment,
            tripsInProgress,
            totalTons
        },
        charts: {
            volumeByCereal,
            statusDistribution
        }
    };
}

export async function getRecentTrips(limit = 5) {
    const { data: trips, error } = await supabase
        .from('viaje')
        .select(`
            id,
            ctg,
            estado,
            cereal,
            toneladas,
            fecha_carga,
            productor:perfil!id_productor(nombre),
            origen:ubicacion!id_origen(nombre),
            destino:ubicacion!id_destino(nombre),
            chofer:perfil!id_camionero(nombre)
        `)
        .order('fecha_carga', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent trips:', error);
        return [];
    }

    return trips || [];
}
