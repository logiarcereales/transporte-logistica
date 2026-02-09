require('dotenv').config({ path: '.env.local' });

console.log("Checking environment variables...");
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("✅ SUPABASE_SERVICE_ROLE_KEY found! Length:", process.env.SUPABASE_SERVICE_ROLE_KEY.length);
    console.log("First 5 chars:", process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 5));
} else {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is MISSING or EMPTY.");
}
