import { getDashboardStats, getRecentTrips } from '@/services/dashboardService';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const stats = await getDashboardStats();
    const recentTrips = await getRecentTrips(15);

    return <DashboardClient stats={stats} recentTrips={recentTrips} />;
}
