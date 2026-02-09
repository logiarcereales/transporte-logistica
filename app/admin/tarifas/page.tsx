import { obtenerTarifas } from '@/app/admin/actions';
import TarifasClient from './TarifasClient';

export const dynamic = 'force-dynamic';

export default async function TarifasPage() {
    const tarifas = await obtenerTarifas();
    return <TarifasClient initialTarifas={tarifas || []} />;
}
