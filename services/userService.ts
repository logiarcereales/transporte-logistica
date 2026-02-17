import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function obtenerPerfilPorTelefono(telefono: string) {
  const { data: perfil, error } = await supabase
    .from('perfil')
    .select(`
      *,
      roles: rol_perfil ( rol )
    `)
    .eq('telefono', telefono)
    .single();

  if (error && error.code !== 'PGRST116') console.error("Error buscando perfil:", error);

  if (perfil) {
    // Aplanamos el rol para que el resto de la app lo use fácil
    const rol = perfil.roles && perfil.roles.length > 0 ? perfil.roles[0].rol : null;
    return { ...perfil, rol };
  }
  return null;
}

export async function crearPerfilInicial(telefono: string) {
  const { data, error } = await supabase
    .from('perfil')
    .insert([{
      telefono: telefono
    }])
    .select().single();

  if (error) throw error;
  return data;
}

export async function actualizarPerfil(telefono: string, cambios: any) {
  // Filtramos solo los campos que existen en la tabla 'perfil'
  const camposPerfil = ['nombre', 'apellido', 'telefono', 'cuit'];
  const datosParaActualizar: any = {};

  for (const key of Object.keys(cambios)) {
    if (camposPerfil.includes(key)) {
      datosParaActualizar[key] = cambios[key];
    }
  }

  if (Object.keys(datosParaActualizar).length === 0) return;

  const { data, error } = await supabase
    .from('perfil')
    .update(datosParaActualizar)
    .eq('telefono', telefono)
    .select().single();

  if (error) throw error;
  return data;
}

export async function asignarRol(perfilId: string, rol: string) {
  const { error } = await supabase
    .from('rol_perfil')
    .upsert(
      [{ id_perfil: perfilId, rol: rol }],
      { onConflict: 'id_perfil, rol', ignoreDuplicates: true }
    );

  if (error) throw error;
}

export async function registrarCamion(perfilId: string, patente: string, tipoCamion: string) {
  // 1. Insertar Camión
  const { data: camion, error: errorCamion } = await supabase
    .from('camion')
    .insert([{
      patente: patente,
      tipo_camion: tipoCamion
    }])
    .select()
    .single();

  if (errorCamion) throw errorCamion;

  // 2. Vincular Camión con Transportista
  const { error: errorVinculo } = await supabase
    .from('transportista_camion')
    .insert([{
      id_perfil: perfilId,
      id_camion: camion.id
    }]);

  if (errorVinculo) throw errorVinculo;

  return camion;
}

export async function obtenerTodosLosCamioneros() {
  // 1. Obtener IDs de camioneros
  const { data: roles, error: errorRoles } = await supabase
    .from('rol_perfil')
    .select('id_perfil')
    .eq('rol', 'TRANSPORTISTA');

  if (errorRoles) throw errorRoles;

  const ids = roles.map((r: any) => r.id_perfil);

  if (ids.length === 0) return [];

  // 2. Obtener perfiles con camiones
  const { data: perfiles, error: errorPerfiles } = await supabase
    .from('perfil')
    .select(`
      *,
      transportista_camion (
        nombre_fantasia,
        id,
        camion:id_camion ( * )
      )
    `)
    .in('id', ids);

  if (errorPerfiles) throw errorPerfiles;

  // Mapear para facilitar el uso en el frontend
  return perfiles.map((p: any) => ({
    ...p,
    camiones: p.transportista_camion.map((tc: any) => ({
      ...tc.camion,
      nombre_fantasia: tc.nombre_fantasia,
      link_id: tc.id
    }))
  }));
}

export async function obtenerTodosLosProductores() {
  // 1. Obtener IDs de productores
  const { data: roles, error: errorRoles } = await supabase
    .from('rol_perfil')
    .select('id_perfil')
    .eq('rol', 'PRODUCTOR');

  if (errorRoles) throw errorRoles;

  const ids = roles.map((r: any) => r.id_perfil);

  if (ids.length === 0) return [];

  // 2. Obtener perfiles con ubicaciones
  // ERROR anterior: "ubicaciones_perfil" no existía. Hint: "ubicacion_persona"
  const { data: perfiles, error: errorPerfiles } = await supabase
    .from('perfil')
    .select(`
      *,
      ubicacion_persona (
        ubicacion:id_ubicacion (
          id,
          nombre,
          instrucciones_llegada
        )
      )
    `)
    .in('id', ids);

  if (errorPerfiles) throw errorPerfiles;

  // Aplanar estructura para el frontend
  return perfiles.map((p: any) => ({
    ...p,
    ubicaciones: p.ubicacion_persona?.map((up: any) => up.ubicacion).filter(Boolean) || []
  }));
}

export async function obtenerTodosLosPerfiles() {
  // 1. Obtener todos los perfiles
  const { data: perfiles, error: errorPerfiles } = await supabase
    .from('perfil')
    .select('*');

  if (errorPerfiles) throw errorPerfiles;

  // 2. Obtener todos los roles
  const { data: roles, error: errorRoles } = await supabase
    .from('rol_perfil')
    .select('*');

  if (errorRoles) throw errorRoles;

  // 3. Unir en memoria
  return perfiles.map((p: any) => {
    const rolEncontrado = roles.find((r: any) => r.id_perfil === p.id);
    return {
      ...p,
    };
  });
}

export async function obtenerTodasLasUbicaciones() {
  const { data: ubicaciones, error } = await supabase
    .from('ubicacion')
    .select('*')
    .order('nombre');

  if (error) throw error;
  return ubicaciones;
}

export async function obtenerOrigenesRecientes(perfilId: string) {
  // 1. Get most recent trips for this producer to find latest origins
  const { data: viajes, error } = await supabase
    .from('viaje')
    .select(`
      id_origen,
      origen:id_origen (
         id,
         nombre,
         instrucciones_llegada,
         tipo
      )
    `)
    .eq('id_productor', perfilId)
    .not('id_origen', 'is', null)
    .order('fecha_carga', { ascending: false })
    .limit(10); // Look at last 10 trips

  if (error) {
    console.error('Error obteniendo origenes recientes:', error);
    return [];
  }

  // 2. Filter unique origins
  const uniqueOrigins = new Map();
  viajes.forEach((v: any) => {
    if (v.origen && !uniqueOrigins.has(v.origen.id)) {
      uniqueOrigins.set(v.origen.id, v.origen);
    }
  });

  return Array.from(uniqueOrigins.values()).slice(0, 3);
}

export async function obtenerDestinosRecientes(perfilId: string) {
  // 1. Get most recent trips for this producer to find latest destinations
  const { data: viajes, error } = await supabase
    .from('viaje')
    .select(`
      id_destino,
      destino:id_destino (
         id,
         nombre,
         instrucciones_llegada,
         tipo
      )
    `)
    .eq('id_productor', perfilId)
    .not('id_destino', 'is', null)
    .order('fecha_carga', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error obteniendo destinos recientes:', error);
    return [];
  }

  // 2. Filter unique destinations
  const uniqueDestinations = new Map();
  viajes.forEach((v: any) => {
    if (v.destino && !uniqueDestinations.has(v.destino.id)) {
      uniqueDestinations.set(v.destino.id, v.destino);
    }
  });

  return Array.from(uniqueDestinations.values()).slice(0, 3);
}