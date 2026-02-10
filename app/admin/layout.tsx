import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto pt-16 md:pt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}

