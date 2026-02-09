import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { obtenerTodasLasUbicaciones } from '@/services/userService';
import UbicacionesClient from './UbicacionesClient';

export default async function UbicacionesPage() {
    // Reutilizamos la función del servicio que ya trae todas ordenadas por nombre
    const ubicaciones = await obtenerTodasLasUbicaciones();

    return <UbicacionesClient initialUbicaciones={ubicaciones || []} />;
}
