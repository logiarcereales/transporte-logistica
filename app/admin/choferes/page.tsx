import { obtenerTodosLosCamioneros } from '@/services/userService';
import ChoferesClient from './ChoferesClient';

export default async function ChoferesPage() {
    const choferes = await obtenerTodosLosCamioneros();

    return <ChoferesClient initialChoferes={choferes} />;
}
