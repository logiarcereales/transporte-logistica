import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { obtenerTodosLosCamioneros, obtenerTodosLosProductores, obtenerTodasLasUbicaciones } from '@/services/userService';
import { obtenerTarifas } from '@/app/admin/actions';
import ViajesClient from './ViajesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ViajesPage({ searchParams }: { searchParams: { status?: string; page?: string } }) {
    // 1. Obtener Viajes con relaciones (pagination optional - fetch all, client handles display)
    const { data: viajes, error } = await supabaseAdmin
        .from('viaje')
        .select(`
      *,
      productor:perfil!id_productor ( nombre ),
      camionero:perfil!id_camionero ( nombre, telefono ),
      origen:ubicacion!id_origen ( nombre ),
      destino:ubicacion!id_destino ( nombre )
    `)
        .order('fecha_carga', { ascending: false });

    if (error) {
        console.error("Error fetching viajes:", error);
    }

    // 2. Obtener Choferes para el selector de asignación
    const choferes = await obtenerTodosLosCamioneros();

    // 3. Obtener Productores y Ubicaciones para "Nuevo Viaje"
    const productores = await obtenerTodosLosProductores();
    const ubicaciones = await obtenerTodasLasUbicaciones();

    // 4. Obtener Tarifas para cálculo automático
    const tarifas = await obtenerTarifas();

    return (
        <ViajesClient
            initialViajes={viajes || []}
            choferesDisponibles={choferes}
            productores={productores}
            ubicaciones={ubicaciones}
            tarifas={tarifas || []}
            initialFilterStatus={searchParams?.status}
        />
    );
}
