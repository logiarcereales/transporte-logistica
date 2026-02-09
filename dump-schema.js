
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dumpSchema() {
    const tables = ['camion', 'transportista_camion', 'viaje', 'oferta'];
    const schema = {};

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (data && data.length > 0) {
            schema[table] = Object.keys(data[0]);
        } else {
            schema[table] = error || 'No data';
        }
    }

    fs.writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
}

dumpSchema();
