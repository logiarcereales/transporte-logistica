require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function test() {
    console.log("Testing access with Service Key...");

    // 1. Test 'perfil'
    const { data: perfiles, error: errPerfil } = await supabase.from('perfil').select('count', { count: 'exact', head: true });
    if (errPerfil) console.error("❌ Error accessing 'perfil':", errPerfil.message);
    else console.log("✅ Access 'perfil' OK. Count:", perfiles);

    // 2. Test 'rol_perfil'
    const { data: roles, error: errRol } = await supabase.from('rol_perfil').select('count', { count: 'exact', head: true });
    if (errRol) console.error("❌ Error accessing 'rol_perfil':", errRol.message);
    else console.log("✅ Access 'rol_perfil' OK. Count:", roles);

    // 3. Test 'camion'
    const { data: camiones, error: errCamion } = await supabase.from('camion').select('count', { count: 'exact', head: true });
    if (errCamion) console.error("❌ Error accessing 'camion':", errCamion.message);
    else console.log("✅ Access 'camion' OK. Count:", camiones);
}

test();
