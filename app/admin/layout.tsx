import Link from 'next/link';
import { LayoutDashboard, Users, Truck, Settings, LogOut, Map, MapPin, DollarSign } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        LogiAr Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group">
                        <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link href="/admin/viajes" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group">
                        <Map className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Viajes</span>
                    </Link>

                    <Link href="/admin/choferes" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group">
                        <Truck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Choferes</span>
                    </Link>

                    <Link href="/admin/productores" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group">
                        <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Productores</span>
                    </Link>

                    <Link href="/admin/ubicaciones" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group">
                        <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Ubicaciones</span>
                    </Link>

                    <Link href="/admin/tarifas" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group">
                        <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Tarifas</span>
                    </Link>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <Link href="/admin/configuracion" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group">
                            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Configuración</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
