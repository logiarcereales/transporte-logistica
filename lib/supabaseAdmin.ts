import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
    console.error("Falta NEXT_PUBLIC_SUPABASE_URL");
}

// Preferimos la Service Key para operaciones de servidor (Admin/Bot)
// Si no está, usamos la Anon Key como fallback (pero probablemente falle por RLS)
const keyToUse = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseServiceKey) {
    console.warn("⚠️ Advertencia: No se encontró SUPABASE_SERVICE_ROLE_KEY. Se está usando la clave anónima, lo que puede causar errores de permisos (RLS).");
} else {
    console.log("✅ supabaseAdmin inicializado con Service Key. Longitud:", supabaseServiceKey.length);
}

export const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
