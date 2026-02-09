// services/viajeService.ts
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

// Crea un registro de viaje inicial vinculado al productor
export async function crearViajeVacio(productorId: string) {
  const { data, error } = await supabase
    .from('viaje')
    .insert([{
      id_productor: productorId,
      estado: 'EN_CURSO',
      fecha_carga: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error("Error al crear viaje vacío:", error);
    throw error;
  }
  return data;
}

// Busca el viaje actual en estado 'SOLICITADO' para este productor
export async function obtenerViajeEnCurso(productorId: string) {
  // console.log(`DEBUG: Buscando viaje EN_CURSO para productor ${productorId}`);
  const { data, error } = await supabase
    .from('viaje')
    .select('*')
    .eq('id_productor', productorId)
    .eq('estado', 'EN_CURSO')
    .order('fecha_carga', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error buscando viaje en curso:", error);
  }

  // if (!data) console.log(`DEBUG: No se encontró viaje EN_CURSO para ${productorId}`);
  // else console.log(`DEBUG: Viaje encontrado: ${data.id}`);

  return data;
}

// Actualiza cualquier campo del viaje
export async function actualizarViaje(viajeId: string | number, datos: any) {
  const { data, error } = await supabase
    .from('viaje')
    .update(datos)
    .eq('id', viajeId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar viaje:", error);
    throw error;
  }
  return data;
}

// Crea una ubicación y devuelve su ID
export async function crearUbicacion(nombre: string, lat?: number, long?: number, tipo: string = 'CAMPO') {
  const { data, error } = await supabase
    .from('ubicacion')
    .insert([{
      nombre: nombre,
      latitud: lat || null,
      longitud: long || null,
      tipo: tipo, // User provided or Default
      // es_origen: true -- REMOVED as per user instruction
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creando ubicación:", error);
    throw error;
  }
  return data;
}

export async function obtenerUbicacion(id: string) {
  const { data, error } = await supabase
    .from('ubicacion')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
  if (error) return null;
  return data;
}

export async function actualizarUbicacion(id: string, datos: any) {
  const { data, error } = await supabase
    .from('ubicacion')
    .update(datos)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando ubicación:", error);
    throw error;
  }
  return data;
}

export async function buscarUbicacionPorNombre(nombre: string) {
  const { data, error } = await supabase
    .from('ubicacion')
    .select('*')
    .ilike('nombre', `%${nombre}%`)
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

// Obtiene los últimos viajes del productor (excluyendo el que está editando en curso)
export async function obtenerHistorialViajes(productorId: string) {
  const { data, error } = await supabase
    .from('viaje')
    .select(`
      id,
      fecha_carga,
      cereal,
      toneladas,
      estado,
      origen:ubicacion!id_origen(nombre),
      destino:ubicacion!id_destino(nombre)
    `)
    .eq('id_productor', productorId)
    .neq('estado', 'EN_CURSO')
    .order('fecha_carga', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error al obtener historial de viajes:", error);
    return [];
  }
  return data;
}

export async function obtenerViajeCompleto(viajeId: string | number) {
  const { data, error } = await supabase
    .from('viaje')
    .select(`
      *,
      origen:ubicacion!id_origen(*),
      destino:ubicacion!id_destino(*)
    `)
    .eq('id', viajeId)
    .single();

  if (error) {
    console.error("Error obteniendo viaje completo:", error);
    return null;
  }
  return data;
}