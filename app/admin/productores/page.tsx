import { obtenerTodosLosProductores, obtenerTodasLasUbicaciones } from '@/services/userService';
import ProductoresClient from './ProductoresClient';

export const dynamic = 'force-dynamic';

export default async function ProductoresPage() {
    const productores = await obtenerTodosLosProductores();
    const ubicaciones = await obtenerTodasLasUbicaciones();

    return (
        <ProductoresClient
            initialProductores={productores || []}
            allUbicaciones={ubicaciones || []}
        />
    );
}
