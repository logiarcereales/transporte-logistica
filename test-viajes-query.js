
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQuery() {
    console.log('Testing viajes query with fecha_carga...');
    const { data, error } = await supabase
        .from('viaje')
        .select(`
      *,
      productor:perfil!id_productor ( nombre ),
      origen:ubicacion!id_origen ( nombre ),
      destino:ubicacion!id_destino ( nombre )
    `)
        .order('fecha_carga', { ascending: false });

    if (error) {
        console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
        console.log('Success! Found', data.length, 'viajes');
        if (data.length > 0) {
            console.log('First viaje sample:', JSON.stringify(data[0], null, 2));
        }
    }
}

testQuery();
