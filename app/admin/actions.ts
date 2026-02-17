'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

// --- CHOFERES ---

export async function createChofer(formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const telefono = formData.get('telefono') as string;
    const cuit = formData.get('cuit') as string;
    const patente = formData.get('patente') as string;
    const tipoCamion = formData.get('tipo_camion') as string;

    // 1. Crear Perfil
    const { data: perfil, error: errorPerfil } = await supabaseAdmin
        .from('perfil')
        .insert([{
            nombre,
            telefono,
            cuit
        }])
        .select()
        .single();

    if (errorPerfil) {
        console.error("Error creando perfil:", errorPerfil);
        return { error: "Error al crear el perfil. Verificá que el teléfono no exista." };
    }

    // 2. Asignar Rol
    const { error: errorRol } = await supabaseAdmin
        .from('rol_perfil')
        .insert([{ id_perfil: perfil.id, rol: 'TRANSPORTISTA' }]);

    if (errorRol) {
        console.error("Error asignando rol:", errorRol);
        return { error: "Error al asignar el rol." };
    }

    // 3. Registrar Camión (Si se ingresó patente)
    if (patente) {
        const { data: camion, error: errorCamion } = await supabaseAdmin
            .from('camion')
            .insert([{ patente, tipo_camion: tipoCamion || 'CHASIS_Y_ACOPLADO' }])
            .select()
            .single();

        if (!errorCamion) {
            await supabaseAdmin
                .from('transportista_camion')
                .insert([{ id_perfil: perfil.id, id_camion: camion.id }]);
        } else {
            console.error("Error creando camión:", errorCamion);
            // No fallamos todo si falla el camión, pero avisamos
        }
    }

    revalidatePath('/admin/choferes');
    return { success: true };
}

export async function deleteChofer(id: string) {
    // Al borrar el perfil, por cascada deberían borrarse roles y relaciones si la DB está bien configurada.
    // Si no, habría que borrar manualmente. Asumiremos cascada o borrado manual seguro.

    // Primero borramos relaciones para evitar errores de FK si no hay cascada
    await supabaseAdmin.from('rol_perfil').delete().eq('id_perfil', id);
    await supabaseAdmin.from('transportista_camion').delete().eq('id_perfil', id);

    const { error } = await supabaseAdmin
        .from('perfil')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error borrando chofer:", error);
        return { error: "Error al eliminar el chofer." };
    }

    revalidatePath('/admin/choferes');
    return { success: true };
}

export async function updateChofer(id: string, formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const telefono = formData.get('telefono') as string;
    const cuit = formData.get('cuit') as string;

    const { error } = await supabaseAdmin
        .from('perfil')
        .update({ nombre, telefono, cuit })
        .eq('id', id);

    if (error) {
        console.error("Error actualizando chofer:", error);
        return { error: "Error al actualizar el chofer." };
    }

    revalidatePath('/admin/choferes');
    return { success: true };
}


// --- PRODUCTORES ---

export async function createProductor(formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const telefono = formData.get('telefono') as string;
    const cuit = formData.get('cuit') as string;

    // 1. Crear Perfil
    const { data: perfil, error: errorPerfil } = await supabaseAdmin
        .from('perfil')
        .insert([{
            nombre,
            telefono,
            cuit
        }])
        .select()
        .single();

    if (errorPerfil) {
        console.error("Error creando perfil:", errorPerfil);
        return { error: "Error al crear el perfil." };
    }

    // 2. Asignar Rol
    const { error: errorRol } = await supabaseAdmin
        .from('rol_perfil')
        .insert([{ id_perfil: perfil.id, rol: 'PRODUCTOR' }]);

    if (errorRol) {
        console.error("Error asignando rol:", errorRol);
        return { error: "Error al asignar el rol." };
    }

    revalidatePath('/admin/productores');
    return { success: true };
}

export async function deleteProductor(id: string) {
    await supabaseAdmin.from('rol_perfil').delete().eq('id_perfil', id);

    const { error } = await supabaseAdmin
        .from('perfil')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error borrando productor:", error);
        return { error: "Error al eliminar el productor." };
    }

    revalidatePath('/admin/productores');
    return { success: true };
}

export async function updateProductor(id: string, formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const telefono = formData.get('telefono') as string;
    const cuit = formData.get('cuit') as string;

    const { error } = await supabaseAdmin
        .from('perfil')
        .update({ nombre, telefono, cuit })
        .eq('id', id);

    if (error) {
        console.error("Error actualizando productor:", error);
        return { error: "Error al actualizar el productor." };
    }

    revalidatePath('/admin/productores');
    return { success: true };
}

// --- VIAJES ---

export async function cancelTrip(id: string) {
    const { error } = await supabaseAdmin
        .from('viaje')
        .update({ estado: 'CANCELADO' })
        .eq('id', id);

    if (error) {
        console.error("Error cancelando viaje:", error);
        return { error: "Error al cancelar el viaje." };
    }

    revalidatePath('/admin/viajes');
    return { success: true };
}

export async function deleteViaje(id: string) {
    // 1. Eliminar ofertas asociadas (si no hay cascade)
    await supabaseAdmin.from('oferta').delete().eq('id_viaje', id);

    // 2. Eliminar el viaje
    const { error } = await supabaseAdmin
        .from('viaje')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error eliminando viaje:", error);
        return { error: "Error al eliminar el viaje." };
    }

    revalidatePath('/admin/viajes');
    return { success: true };
}

export async function assignDriver(viajeId: string, choferId: string) {
    // 1. Obtener tarifa base del viaje para usarla como tarifa ofertada
    const { data: viaje } = await supabaseAdmin
        .from('viaje')
        .select('tarifa_base')
        .eq('id', viajeId)
        .single();

    const tarifa = viaje?.tarifa_base || 0;

    // 2. Actualizar estado del viaje y camión
    const { error } = await supabaseAdmin
        .from('viaje')
        .update({
            estado: 'ASIGNADO',
            id_camionero: choferId
        })
        .eq('id', viajeId);

    // 3. Crear oferta aceptada para simular asignación (Satisfacer constraint NOT NULL de tarifa_ofertada)
    const { error: errorOferta } = await supabaseAdmin
        .from('oferta')
        .insert([{
            id_viaje: viajeId,
            id_camionero: choferId,
            estado: 'ACEPTADA',
            tarifa_ofertada: tarifa
        }]);

    if (errorOferta) {
        console.error("Error asignando chofer (crear oferta):", errorOferta);
        return { error: "Error al asignar el chofer." };
    }

    revalidatePath('/admin/viajes');
    return { success: true };
}

export async function updateTripStatus(viajeId: string, nuevoEstado: string) {
    // Prepare update data
    const updateData: any = { estado: nuevoEstado };

    // If changing to CARGADO and fecha_carga is not set, set it to now
    if (nuevoEstado === 'CARGADO') {
        updateData.fecha_carga = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
        .from('viaje')
        .update(updateData)
        .eq('id', viajeId);

    if (error) {
        console.error("Error actualizando estado del viaje:", error);
        return { error: "Error al actualizar el estado." };
    }

    revalidatePath('/admin/viajes');
    return { success: true };
}

export async function updateTripTariff(viajeId: string, nuevaTarifa: number) {
    const { error } = await supabaseAdmin
        .from('viaje')
        .update({ tarifa_base: nuevaTarifa })
        .eq('id', viajeId);

    if (error) {
        console.error("Error actualizando tarifa del viaje:", error);
        return { error: "Error al actualizar la tarifa." };
    }

    revalidatePath('/admin/viajes');
    return { success: true };
}

// --- TRIP CREATION ---

export async function createViaje(formData: FormData) {
    const cereal = formData.get('cereal') as string;
    const toneladas = parseFloat(formData.get('toneladas') as string);
    const idProductor = formData.get('id_productor') as string;
    const idOrigen = formData.get('id_origen') as string;
    const idDestino = formData.get('id_destino') as string;
    const tarifaBase = formData.get('tarifa_base') ? parseFloat(formData.get('tarifa_base') as string) : 0;

    const { error } = await supabaseAdmin
        .from('viaje')
        .insert([{
            cereal,
            toneladas,
            id_productor: idProductor,
            id_origen: idOrigen,
            id_destino: idDestino,
            tarifa_base: tarifaBase,
            estado: 'SOLICITADO'
            // fecha_carga will be set automatically when estado changes to CARGADO
        }]);

    if (error) {
        console.error("Error creando viaje:", error);
        return { error: "Error al crear el viaje." };
    }

    revalidatePath('/admin/viajes');
    return { success: true };
}

// --- UBICACIONES ---

export async function createUbicacion(formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const instrucciones_llegada = formData.get('instrucciones_llegada') as string;
    const tipo = formData.get('tipo') as string;
    const latitud = formData.get('latitud') ? parseFloat(formData.get('latitud') as string) : null;
    const longitud = formData.get('longitud') ? parseFloat(formData.get('longitud') as string) : null;

    const { error } = await supabaseAdmin
        .from('ubicacion')
        .insert([{
            nombre,
            instrucciones_llegada,
            tipo,
            latitud,
            longitud
        }]);

    if (error) {
        console.error("Error creando ubicación:", error);
        return { error: "Error al crear la ubicación." };
    }

    revalidatePath('/admin/ubicaciones');
    return { success: true };
}

export async function updateUbicacion(id: string, formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const instrucciones_llegada = formData.get('instrucciones_llegada') as string;
    const tipo = formData.get('tipo') as string;
    const latitud = formData.get('latitud') ? parseFloat(formData.get('latitud') as string) : null;
    const longitud = formData.get('longitud') ? parseFloat(formData.get('longitud') as string) : null;

    const { error } = await supabaseAdmin
        .from('ubicacion')
        .update({
            nombre,
            instrucciones_llegada,
            tipo,
            latitud,
            longitud
        })
        .eq('id', id);

    if (error) {
        console.error("Error actualizando ubicación:", error);
        return { error: "Error al actualizar la ubicación." };
    }

    revalidatePath('/admin/ubicaciones');
    return { success: true };
}

export async function deleteUbicacion(id: string) {
    const { error } = await supabaseAdmin
        .from('ubicacion')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error borrando ubicación:", error);
        return { error: "Error al eliminar la ubicación. Puede estar referenciada en viajes o usuarios." };
    }

    revalidatePath('/admin/ubicaciones');
    return { success: true };
}



// --- RELACIONES (Ubicaciones - Personas) ---

export async function linkUbicacionToPerfil(idPerfil: string, idUbicacion: string) {
    const { error } = await supabaseAdmin
        .from('ubicacion_persona')
        .insert([{ id_perfil: idPerfil, id_ubicacion: idUbicacion }]);

    if (error) {
        console.error("Error vinculando ubicación:", error);
        return { error: "Error al vincular ubicación." };
    }

    revalidatePath('/admin/productores');
    return { success: true };
}

export async function unlinkUbicacionFromPerfil(idPerfil: string, idUbicacion: string) {
    const { error } = await supabaseAdmin
        .from('ubicacion_persona')
        .delete()
        .eq('id_perfil', idPerfil)
        .eq('id_ubicacion', idUbicacion);

    if (error) {
        console.error("Error desvinculando ubicación:", error);
        return { error: "Error al desvincular ubicación." };
    }

    revalidatePath('/admin/productores');
    return { success: true };
}



// --- TARIFAS (Tarifarios) ---

export async function createTarifa(formData: FormData) {
    const km_desde = parseInt(formData.get('km_desde') as string);
    const km_hasta = parseInt(formData.get('km_hasta') as string);
    const precio_tonelada = parseFloat(formData.get('precio_tonelada') as string);

    const { error } = await supabaseAdmin
        .from('tarifa')
        .insert([{ km_desde, km_hasta, precio_tonelada }]);

    if (error) {
        console.error("Error creando tarifa:", error);
        return { error: "Error al crear tarifa." };
    }

    revalidatePath('/admin/tarifas');
    return { success: true };
}

export async function updateTarifa(id: string, formData: FormData) {
    const km_desde = parseInt(formData.get('km_desde') as string);
    const km_hasta = parseInt(formData.get('km_hasta') as string);
    const precio_tonelada = parseFloat(formData.get('precio_tonelada') as string);

    const { error } = await supabaseAdmin
        .from('tarifa')
        .update({ km_desde, km_hasta, precio_tonelada })
        .eq('id', id);

    if (error) {
        console.error("Error actualizando tarifa:", error);
        return { error: "Error al actualizar tarifa." };
    }

    revalidatePath('/admin/tarifas');
    return { success: true };
}

export async function deleteTarifa(id: string) {
    const { error } = await supabaseAdmin
        .from('tarifa')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error eliminando tarifa:", error);
        return { error: "Error al eliminar tarifa." };
    }

    revalidatePath('/admin/tarifas');
    return { success: true };
}

export async function obtenerTarifas() {
    const { data, error } = await supabaseAdmin
        .from('tarifa')
        .select('*')
        .order('km_desde', { ascending: true });

    if (error) {
        console.error("Error obteniendo tarifas:", error);
        return [];
    }
    return data;
}

// --- CAMIONES ---

export async function addCamionToChofer(choferId: string, formData: FormData) {
    const patente = formData.get('patente') as string;
    const tipoCamion = formData.get('tipo_camion') as string;

    // 1. Crear Camión
    const { data: camion, error: errorCamion } = await supabaseAdmin
        .from('camion')
        .insert([{ patente, tipo_camion: tipoCamion }])
        .select()
        .single();

    if (errorCamion) {
        console.error("Error creando camión:", errorCamion);
        return { error: "Error al crear el camión. Verificá la patente." };
    }

    // 2. Vincular
    const { error: errorVinculo } = await supabaseAdmin
        .from('transportista_camion')
        .insert([{ id_perfil: choferId, id_camion: camion.id }]);

    if (errorVinculo) {
        console.error("Error vinculando camión:", errorVinculo);
        return { error: "Error al vincular el camión." };
    }

    revalidatePath('/admin/choferes');
    return { success: true };
}

export async function deleteCamion(camionId: string, linkId?: string) {
    // Si pasamos linkId (id de transportista_camion), borramos el vínculo.
    // Si queremos borrar el camión físico, borramos de 'camion'.

    // Primero desvincular (cascade debería encargarse pero por seguridad)
    if (linkId) {
        await supabaseAdmin.from('transportista_camion').delete().eq('id', linkId);
    }

    const { error } = await supabaseAdmin
        .from('camion')
        .delete()
        .eq('id', camionId);

    if (error) {
        console.error("Error borrando camión:", error);
        return { error: "Error al eliminar el camión." };
    }

    revalidatePath('/admin/choferes');
    return { success: true };
}

export async function updateCamion(camionId: string, formData: FormData) {
    const patente = formData.get('patente') as string;
    const tipoCamion = formData.get('tipo_camion') as string;

    const { error } = await supabaseAdmin
        .from('camion')
        .update({ patente, tipo_camion: tipoCamion })
        .eq('id', camionId);

    if (error) {
        console.error("Error actualizando camión:", error);
        return { error: "Error al actualizar el camión." };
    }

    revalidatePath('/admin/choferes');
    return { success: true };
}
