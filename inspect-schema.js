
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
    console.log('--- CAMION ---');
    const { data: camionData, error: camionError } = await supabase.from('camion').select('*').limit(1);
    if (camionData && camionData.length > 0) console.log(Object.keys(camionData[0]));
    else console.log('No data or error in camion', camionError);

    console.log('--- TRANSPORTISTA_CAMION ---');
    const { data: tcData, error: tcError } = await supabase.from('transportista_camion').select('*').limit(1);
    if (tcData && tcData.length > 0) console.log(Object.keys(tcData[0]));
    else console.log('No data or error in transportista_camion', tcError);

    console.log('--- VIAJE ---');
    const { data: viajeData, error: viajeError } = await supabase.from('viaje').select('*').limit(1);
    if (viajeData && viajeData.length > 0) console.log(Object.keys(viajeData[0]));
    else console.log('No data or error in viaje', viajeError);
}

inspectSchema();
