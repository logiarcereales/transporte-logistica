'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Truck,
    Settings,
    LogOut,
    Map,
    MapPin,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedCollapsed = localStorage.getItem('sidebarCollapsed');
        if (storedCollapsed === 'true') {
            setIsCollapsed(true);
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    const toggleMobile = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Helper to determine if link is active
    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    // Shared navigation items
    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { href: '/admin/viajes', icon: Map, label: 'Viajes' },
        { href: '/admin/choferes', icon: Truck, label: 'Choferes' },
        { href: '/admin/productores', icon: Users, label: 'Productores' },
        { href: '/admin/ubicaciones', icon: MapPin, label: 'Ubicaciones' },
        { href: '/admin/tarifas', icon: DollarSign, label: 'Tarifas' },
    ];

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleMobile}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md text-gray-600 hover:text-blue-600 border border-gray-200"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed md:relative z-50 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                    w-64
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between h-16">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
                            LogiAr Admin
                        </h1>
                    )}
                    {isCollapsed && (
                        <div className="w-full flex justify-center">
                            <span className="text-xl font-bold text-blue-600">LA</span>
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    <button onClick={toggleMobile} className="md:hidden text-gray-500 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = item.exact ? pathname === item.href : isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group
                                    ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon
                                    className={`
                                        transition-transform
                                        ${active ? 'scale-110' : 'group-hover:scale-110'}
                                        ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
                                    `}
                                />
                                {!isCollapsed && (
                                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-2 mt-2 border-t border-gray-100">
                        <Link
                            href="/admin/configuracion"
                            onClick={() => setIsMobileOpen(false)}
                            className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group
                                ${isActive('/admin/configuracion') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                            title={isCollapsed ? 'Configuración' : undefined}
                        >
                            <Settings
                                className={`
                                    transition-transform group-hover:scale-110
                                    ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
                                `}
                            />
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap">Configuración</span>
                            )}
                        </Link>
                    </div>
                </nav>

                {/* Footer / Logout / Toggle */}
                <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
                    <button
                        className={`
                            flex items-center gap-3 px-3 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? 'Cerrar Sesión' : undefined}
                    >
                        <LogOut className={`w-5 h-5 ${isCollapsed ? 'w-6 h-6' : ''}`} />
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">Cerrar Sesión</span>}
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:flex items-center justify-center p-2 mt-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </aside>
        </>
    );
}
