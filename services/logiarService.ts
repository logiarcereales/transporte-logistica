// services/logiarService.ts
import * as userService from './userService';
import * as whatsappService from './whatsappService';
import { Templates } from './messageTemplates';

export async function procesarMensajeEntrante(mensaje: any) {
  const telefono = mensaje.from;
  console.log(`📩 Mensaje recibido de: ${telefono}`);

  let perfil = await userService.obtenerPerfilPorTelefono(telefono);

  // 1. Manejo de texto y palabras clave de SOPORTE
  if (mensaje.type === 'text') {
    const texto = mensaje.text.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Palabras gatillo para activar soporte
    if (texto === 'operador' || texto === 'ayuda' || texto === 'soporte' || texto === 'humano') {

      // Notificamos al ADMIN 
      const adminNumber = process.env.ADMIN_PHONE_NUMBER;
      if (adminNumber) {
        const nombreUser = perfil ? perfil.nombre : "Desconocido";
        const alertaAdmin = `🚨 *ALERTA DE SOPORTE*\n\n👤 *Usuario:* ${nombreUser}\n📱 *Tel:* ${telefono}\n💬 *Dijo:* "${mensaje.text.body}"\n\n⚠️ Entrá al chat para responder.`;
        await whatsappService.enviarMensaje(adminNumber, Templates.mensajeTexto(alertaAdmin));
      }

      // Confirmamos al usuario
      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(
        `👨‍💻 *Soporte Humano*\n\nTe hemos puesto en contacto con un operador. En breve te responderemos por aquí.`
      ));
    }
  }

  // NOTA: La funcionalidad de soporte humano con estado_conversacion fue removida
  // ya que la columna estado_conversacion fue eliminada de la base de datos

  // 3. RESPUESTA POR DEFECTO (REDIRECCIÓN A WEB)
  // Para cualquier otro mensaje que no sea soporte y no esté en soporte:
  // Enviamos el link de la web app.

  // Determinamos el nombre para hacerlo personalizado si existe
  const saludo = perfil ? `Hola ${perfil.nombre},` : '¡Hola!';
  const webLink = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Solo respondemos a mensajes de texto o interactivos para evitar spam en status updates
  if (mensaje.type === 'text' || mensaje.type === 'interactive') {
    await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(
      ` ${saludo} bienvenido a *LogiAr*.\n\n🚛 Para *Solicitar Cargas*, ver el estado de tus viajes o registrarte, por favor ingresá a nuestra nueva plataforma web:\n\n ${webLink}/productor/solicitud\n\n_Si mostás inconvenientes, escribí "Ayuda" para hablar con un operador._`
    ));
  }
}