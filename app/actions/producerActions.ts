'use server';

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function registerProducer(prevState: any, formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const telefono = formData.get('telefono') as string;

    if (!nombre || !telefono) {
        return { error: 'Nombre y teléfono son requeridos.' };
    }

    // 1. Check if user exists
    const { data: existingUser } = await supabase
        .from('perfil')
        .select('*')
        .eq('telefono', telefono)
        .single();

    let userId;

    if (existingUser) {
        // Update existing
        const { error } = await supabase
            .from('perfil')
            .update({ nombre })
            .eq('telefono', telefono);

        if (error) return { error: 'Error actualizando perfil.' };
        userId = existingUser.id;
    } else {
        // Create new
        const { data: newUser, error } = await supabase
            .from('perfil')
            .insert([{ telefono, nombre }])
            .select()
            .single();

        if (error) {
            console.error("Error creating profile:", error);
            return { error: 'Error creando perfil.' };
        }
        userId = newUser.id;
    }

    // 2. Ensure role is PRODUCTOR
    const { error: roleError } = await supabase
        .from('rol_perfil')
        .upsert(
            [{ id_perfil: userId, rol: 'PRODUCTOR' }],
            { onConflict: 'id_perfil, rol', ignoreDuplicates: true }
        );

    if (roleError) return { error: 'Error asignando rol.' };

    redirect('/productor/solicitud?telefono=' + telefono);
}

export async function checkProducer(telefono: string) {
    // 1. Limpiar el input: sacar todo lo que no sea número
    const limpio = telefono.replace(/\D/g, '');

    // 2. Generar variaciones posibles para buscar en la DB
    // La DB suele tener el formato 549... pero a veces no. 
    // Buscaremos las formas más comunes.
    const variaciones = new Set<string>();

    variaciones.add(limpio); // El número tal cual (limpio)

    // Si no empieza con 54, probamos agregando
    if (!limpio.startsWith('54')) {
        variaciones.add(`54${limpio}`);
        variaciones.add(`549${limpio}`);
    }

    // Si empieza con 54 pero no tiene el 9 (ej: 54358...)
    if (limpio.startsWith('54') && !limpio.startsWith('549')) {
        const sin54 = limpio.substring(2);
        variaciones.add(`549${sin54}`);
    }

    // Si empieza con 0 (ej: 0358...)
    if (limpio.startsWith('0')) {
        const sinCero = limpio.substring(1);
        variaciones.add(sinCero);
        variaciones.add(`54${sinCero}`);
        variaciones.add(`549${sinCero}`);
    }

    // Si empieza con 15 (celular local sin prefijo o algo asi) - caso raro pero posible
    // Mejor nos limitamos a los más standard para no traer falsos positivos locos.

    const listaPosibles = Array.from(variaciones);

    const { data: perfil } = await supabase
        .from('perfil')
        .select(`*, roles:rol_perfil(rol)`)
        .in('telefono', listaPosibles)
        .maybeSingle(); // Usamos maybeSingle porque podría haber duplicados teóricos, pero el teléfono debería ser unique.
    // Si hay varios, esto podría fallar si devuelve más de uno. 
    // En ese caso mejor usar .limit(1) y tomar el primero.

    // Corrección: .in() puede devolver varios registros si la DB está sucia.
    // Hagamos select normal y filtremos en codigo o tomemos el primero.
    const { data: perfiles } = await supabase
        .from('perfil')
        .select(`*, roles:rol_perfil(rol)`)
        .in('telefono', listaPosibles);

    if (!perfiles || perfiles.length === 0) return null;

    // Tomamos el primero que encontremos (asumiendo que es el mismo usuario)
    const encontrado = perfiles[0];

    const isProducer = encontrado.roles.some((r: any) => r.rol === 'PRODUCTOR');
    return isProducer ? encontrado : null;
}

export async function createLoadRequest(formData: any) {
    // formData is likely a plain object if coming from a client component using server actions directly, 
    // or FormData if using a form. We'll assume object for flexibility or handle FormData.
    // Let's design for object since we'll likely use a client component for the map.

    const {
        telefono,
        cantidad_camiones,
        toneladas,
        cereal,
        origen,
        destino
    } = formData;

    const perfil = await checkProducer(telefono);
    if (!perfil) return { error: 'Productor no encontrado.' };

    // 1. Handle Origin
    let id_origen;
    if (origen.id) {
        id_origen = origen.id;
    } else if (origen.lat && origen.lng) {
        // Create new origin
        const { data: newOrigin, error: originError } = await supabase
            .from('ubicacion')
            .insert([{
                nombre: origen.nombre || 'Origen Personalizado',
                latitud: origen.lat,
                longitud: origen.lng,
                tipo: 'CAMPO'
            }])
            .select()
            .single();

        if (originError) return { error: 'Error guardando origen.' };
        id_origen = newOrigin.id;
    } else {
        return { error: 'Origen inválido.' };
    }

    // 2. Handle Destination
    // Destino is just text string usually, but system expects an ID in `viaje`.
    // We search if it exists by name, or create a new one.
    // The user wants a text input for destination.

    let id_destino;
    const { data: existingDest } = await supabase
        .from('ubicacion')
        .select('*')
        .ilike('nombre', destino) // Case insensitive match
        .single();

    if (existingDest) {
        id_destino = existingDest.id;
    } else {
        const { data: newDest, error: destError } = await supabase
            .from('ubicacion')
            .insert([{
                nombre: destino,
                tipo: 'OTRO' // Default type
            }])
            .select()
            .single();

        if (destError) return { error: 'Error guardando destino.' };
        id_destino = newDest.id;
    }

    // 3. Create Viaje
    // Iterate for number of trucks? Or just one record?
    // "Cantidad de camiones" implies multiple trips or one request for multiple trucks.
    // The schema has `viaje` which seems to be one trip.
    // If multiple trucks, we might need to create multiple records or handling it as a "batch".
    // For now, let's assume we create one request representing the batch, OR multiple individual requests.
    // The schema `viaje` links to `id_camionero` (nullable initially).
    // Let's create multiple entries if quantity > 1, or just one entry with a "note"?
    // The schema doesn't have "cantidad_camiones" on `viaje`. It has `toneladas`.
    // If I have 100 tons and 3 trucks, maybe I make 3 trips of 33 tons?
    // User asked for "Cantidad de camiones".
    // I will simply loop and create N "viaje" records.

    const cantCamiones = parseInt(cantidad_camiones) || 1;
    const errors = [];

    for (let i = 0; i < cantCamiones; i++) {
        const { error } = await supabase
            .from('viaje')
            .insert([{
                id_productor: perfil.id,
                cereal: cereal,
                id_origen: id_origen,
                id_destino: id_destino,
                toneladas: parseFloat(toneladas) / cantCamiones, // Distribute tons? Or is "toneladas" per truck? Usually tons is total. 
                // Let's assume tons is TOTAL for the request.
                estado: 'SOLICITADO',
                fecha_carga: new Date().toISOString()
            }]);

        if (error) errors.push(error);
    }

    if (errors.length > 0) return { error: 'Hubo errores al crear algunas solicitudes.' };

    return { success: true };
}

export async function searchTripByCtg(ctg: string) {
    const { data: viaje, error } = await supabase
        .from('viaje')
        .select(`
            *,
            origen:ubicacion!id_origen(nombre),
            destino:ubicacion!id_destino(nombre),
            chofer:perfil!id_camionero(nombre, telefono),
            camion:camion(patente)
        `)
        .eq('ctg', ctg) // Searching by CTG
        .single();

    if (error || !viaje) return null;

    return viaje;
}

export async function getProducerHistory(telefono: string) {
    const perfil = await checkProducer(telefono);
    if (!perfil) return { error: 'Productor no encontrado' };

    const { data: viajes, error } = await supabase
        .from('viaje')
        .select(`
            id,
            fecha_carga,
            cereal,
            toneladas,
            estado,
            ctg,
            origen:ubicacion!id_origen(nombre),
            destino:ubicacion!id_destino(nombre)
        `)
        .eq('id_productor', perfil.id)
        .order('fecha_carga', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching history:', error);
        return { error: 'Error al obtener historial' };
    }

    return { success: true, data: viajes };
}