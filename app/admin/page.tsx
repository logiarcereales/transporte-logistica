import { getDashboardStats } from '@/services/dashboardService';
import { obtenerTodasLasUbicaciones } from '@/services/userService';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const stats = await getDashboardStats();
    const ubicaciones = await obtenerTodasLasUbicaciones();

    return <DashboardClient stats={stats} ubicaciones={ubicaciones || []} />;
}
