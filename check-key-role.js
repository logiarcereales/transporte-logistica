require('dotenv').config({ path: '.env.local' });

function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
    console.error("❌ No se encontró la clave en .env.local");
} else {
    const payload = decodeJwt(key);
    if (payload) {
        console.log("🔑 Clave decodificada:");
        console.log("   Role:", payload.role);
        console.log("   Exp:", payload.exp);

        if (payload.role === 'service_role') {
            console.log("✅ ES UNA CLAVE DE SERVICIO (Correcto)");
        } else if (payload.role === 'anon') {
            console.log("⚠️ ES UNA CLAVE ANONIMA (Incorrecto - Debes usar la service_role)");
        } else {
            console.log("❓ Rol desconocido:", payload.role);
        }
    } else {
        console.error("❌ No se pudo decodificar la clave. ¿Es un JWT válido?");
    }
}
