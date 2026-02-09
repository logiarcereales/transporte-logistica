require('dotenv').config({ path: '.env.local' });
const https = require('https');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log(`Testing connection to: ${url}`);

if (!url) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing.");
    process.exit(1);
}

const req = https.get(url, (res) => {
    console.log(`✅ Connection successful! Status Code: ${res.statusCode}`);
    res.on('data', () => { }); // Consume data
});

req.on('error', (e) => {
    console.error(`❌ Connection failed: ${e.message}`);
});

req.setTimeout(5000, () => {
    req.destroy();
    console.error("❌ Connection timed out after 5000ms");
});
