import { Settings, Server, ShieldCheck, Database } from 'lucide-react';

export default function ConfiguracionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
                <p className="text-gray-500">Estado y parámetros generales de la plataforma</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Status Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Server className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-medium text-green-900">Bot de WhatsApp</span>
                            </div>
                            <span className="text-sm text-green-700 font-medium">Activo</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-900">Base de Datos</span>
                            </div>
                            <span className="text-sm text-green-700 font-medium">Conectada</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Database className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-700">Versión</span>
                            </div>
                            <span className="text-sm text-gray-500 font-mono">v1.0.2</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
