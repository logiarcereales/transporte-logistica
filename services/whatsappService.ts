// services/whatsappService.ts
const API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

export function normalizarNumeroParaMeta(telefono: string): string {
  const limpio = String(telefono).replace(/\D/g, ''); 

  if (limpio.startsWith("5493583")) {
    return limpio.replace("5493583", "543583"); 
  }
  if (limpio.startsWith("549351")) {
    return limpio.replace("549351", "5435115");
  }
    if (limpio.startsWith("549264")) {
    return limpio.replace("549264", "5426415");
  }
  return limpio;
}

/**
 * Función GENÉRICA de envío. Recibe el destinatario y el objeto mensaje ya armado.
 */
export async function enviarMensaje(to: string, messagePayload: any) {
  const payload = {
    messaging_product: "whatsapp",
    to: normalizarNumeroParaMeta(to),
    ...messagePayload // Aquí se pega el contenido que viene del Template
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(` Meta rechazó mensaje a ${to}:`, errorData);
      return null; 
    }
    return await response.json();
  } catch (error) {
    console.error(" Error de red:", error);
    return null;
  }
}