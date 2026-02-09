import { NextResponse } from 'next/server';
import { procesarMensajeEntrante } from '@/services/logiarService';

// GET: Validación del Webhook (Solo se usa una vez al configurar Meta)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST: Recepción de Notificaciones
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extraemos el mensaje usando una función de utilidad
    const mensaje = extraerMensaje(body);

    if (mensaje) {
      // Delegamos toda la lógica a nuestro servicio
      await procesarMensajeEntrante(mensaje);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error en Webhook POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function extraerMensaje(body: any) {
  return body.entry?.[0]?.changes?.[0]?.value?.messages?.[0] || null;
}