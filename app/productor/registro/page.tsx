'use client';

import { useActionState, useState } from 'react';
import { registerProducer } from '@/app/actions/producerActions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const initialState = {
    error: '',
};

export default function RegisterProducerPage() {
    const [state, formAction, isPending] = useActionState(registerProducer, initialState);
    const [phone, setPhone] = useState('');

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-[440px] w-full bg-white p-8 sm:p-12 shadow-2xl rounded-sm sm:rounded-md border-t-8 border-[--primary]">

                <div className="flex items-center gap-2 mb-6">
                    {/* Logo placeholder or Icon */}
                    <svg className="w-8 h-8 text-[--primary]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3" fill="#F4C430"></circle>
                    </svg>
                    <span className="text-xl font-semibold text-gray-700">LogiAr</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear una cuenta</h2>
                <p className="text-gray-600 mb-8 text-sm">Ingresá tus datos para comenzar a operar.</p>

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="telefono" value={`549${phone}`} />

                    <div className="space-y-5">
                        <Input
                            label="Nombre Completo"
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            placeholder="Ej: Juan Perez"
                            className="h-11 border-b-2 border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 px-0 focus:ring-0 focus:border-[--primary] transition-colors bg-transparent placeholder-gray-400"
                        />

                        <div className="relative">
                            <label htmlFor="phone_input" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <div className="flex items-end">
                                <span className="text-gray-500 font-medium pb-2 border-b-2 border-gray-300 mr-2">+54 9</span>
                                <input
                                    id="phone_input"
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="358 412 3456"
                                    className="flex-1 h-11 border-b-2 border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 px-0 focus:ring-0 focus:border-[--primary] transition-colors bg-transparent placeholder-gray-400 text-lg outline-none w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {state?.error && (
                        <div className="text-red-600 text-sm mt-2">
                            {state.error}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" isLoading={isPending} className="px-8 py-2 bg-[--primary] hover:bg-[#254e30] text-white font-medium rounded-sm shadow-sm text-base transition-all">
                            Registrarme
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
