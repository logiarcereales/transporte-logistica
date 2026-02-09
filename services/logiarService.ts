// services/logiarService.ts
import * as userService from './userService';
import * as whatsappService from './whatsappService';
import * as viajeService from './viajeService';
import { Templates } from './messageTemplates';
import { handleRegistro } from '../flows/registroFlow';
import { handleCargaViaje } from '../flows/viajeFlow';

export async function procesarMensajeEntrante(mensaje: any) {
  const telefono = mensaje.from;
  console.log(`📩 Mensaje recibido de: ${telefono}`);

  let perfil = await userService.obtenerPerfilPorTelefono(telefono);

  // 1. Usuario Nuevo
  if (!perfil) {
    perfil = await userService.crearPerfilInicial(telefono);
    return await whatsappService.enviarMensaje(telefono, Templates.botonesRegistro());
  }

  // Esto chequea si escribió "operador" o "ayuda" en CUALQUIER MOMENTO
  if (mensaje.type === 'text') {
    const texto = mensaje.text.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Palabras gatillo para activar soporte
    if (texto === 'operador' || texto === 'ayuda' || texto === 'soporte' || texto === 'humano') {

      if (perfil.estado_conversacion !== 'SOPORTE_HUMANO') {
        // 1. Cambiamos estado
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'SOPORTE_HUMANO' });

        // 2. Notificamos al ADMIN 
        const adminNumber = process.env.ADMIN_PHONE_NUMBER;
        if (adminNumber) {
          const alertaAdmin = `🚨 *ALERTA DE SOPORTE*\n\n👤 *Usuario:* ${perfil.nombre}\n📱 *Tel:* ${telefono}\n🚛 *Rol:* ${perfil.rol}\n💬 *Dijo:* "${mensaje.text.body}"\n\n⚠️ Entrá al chat para responder.`;
          await whatsappService.enviarMensaje(adminNumber, Templates.mensajeTexto(alertaAdmin));
        }

        // 3. Confirmamos al usuario
        return await whatsappService.enviarMensaje(telefono, Templates.inicioSoporte());
      }
    }
  }

  const estado = perfil.estado_conversacion;

  // MODO SOPORTE HUMANO (EL BOT ESTÁ EN SILENCIO) ---
  if (estado === 'SOPORTE_HUMANO') {
    if (mensaje.type === 'text') {
      const texto = mensaje.text.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

      // Para SALIR del modo soporte
      if (texto === 'menu' || texto === 'salir' || texto === 'volver' || texto === 'gracias') {
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'MENU_PRINCIPAL' });

        // Volvemos al menú según rol
        if (perfil.rol === 'PRODUCTOR') {
          return await whatsappService.enviarMensaje(telefono, Templates.menuProductor(perfil.nombre));
        } else {
          return await whatsappService.enviarMensaje(telefono, Templates.menuCamionero(perfil.nombre));
        }
      }
    }
    console.log(`🤫 Usuario ${telefono} en soporte. Bot en pausa.`);
    return; // NO HACEMOS NADA MÁS
  }

  // 2. Router de REGISTRO
  if (
    estado === 'ESPERANDO_ROL' ||
    estado === 'ESPERANDO_NOMBRE' ||
    estado === 'ESPERANDO_CUIL' ||
    estado === 'ESPERANDO_PATENTE' ||
    estado === 'ESPERANDO_TIPO_CAMION'
  ) {
    return await handleRegistro(telefono, mensaje, perfil);
  }

  // 3. Router del MENÚ PRINCIPAL
  if (estado === 'MENU_PRINCIPAL') {
    if (mensaje.type === 'interactive') {
      let accion = "";

      if (mensaje.interactive.type === 'button_reply') {
        accion = mensaje.interactive.button_reply.id;
      } else if (mensaje.interactive.type === 'list_reply') {
        accion = mensaje.interactive.list_reply.id;
      }

      // --- ACCIONES DE PRODUCTOR ---
      if (accion === 'ACCION_SOLICITAR') {
        const viaje = await viajeService.crearViajeVacio(perfil.id);
        // No guardamos viaje_actual_id en perfil
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_CEREAL' });
        return await whatsappService.enviarMensaje(telefono, Templates.listaCereales());
      }

      // --- ACCIONES VER VIAJES (Productor / Camionero?) ---
      if (accion === 'ACCION_VER_VIAJES' || accion === 'ACCION_MIS_VIAJES') {
        // Obtenemos historial
        const viajes = await viajeService.obtenerHistorialViajes(perfil.id);
        return await whatsappService.enviarMensaje(telefono, Templates.historialViajes(viajes));
      }

      // --- DETALLE DE VIAJE SELECCIONADO ---
      if (accion.startsWith('VER_VIAJE_')) {
        const idViaje = accion.replace('VER_VIAJE_', '');
        const viaje = await viajeService.obtenerViajeCompleto(idViaje);
        if (viaje) {
          return await whatsappService.enviarMensaje(telefono, Templates.detalleViaje(viaje));
        } else {
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("⚠️ No pudimos cargar el viaje. Intentalo de nuevo."));
        }
      }

      // --- ACCIONES DE CAMIONERO ---
      if (accion === 'ACCION_VER_CARGAS') {
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🔍 Buscando cargas..."));
      }

      if (accion === 'ACCION_PERFIL') {
        // Nota: tipo_camion y patente ya no están en perfil directamente, habría que buscarlos si se quieren mostrar.
        // Por simplicidad mostramos solo lo básico o hacemos una query extra si es necesario.
        // Por ahora lo dejamos simple.
        const infoExtra = perfil.rol === 'CAMIONERO'
          ? `\n(Detalles del camión en menú configuración)`
          : '';
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(
          `👤 *Perfil*\nNombre: ${perfil.nombre}\nRol: ${perfil.rol}${infoExtra}\n\n💡 _Escribí "Operador" si necesitás ayuda._`
        ));
      }
    }

    // Fallback
    if (perfil.rol === 'PRODUCTOR') {
      return await whatsappService.enviarMensaje(telefono, Templates.menuProductor(perfil.nombre));
    } else {
      return await whatsappService.enviarMensaje(telefono, Templates.menuCamionero(perfil.nombre));
    }
  }

  // 4. Router de CARGA DE VIAJE
  // Detectamos si está en un estado de carga de viaje
  if (estado.startsWith('ESPERANDO_') && perfil.rol === 'PRODUCTOR') {
    return await handleCargaViaje(telefono, mensaje, perfil);
  }

  // Fallback Global
  if (perfil.rol === 'PRODUCTOR') {
    return await whatsappService.enviarMensaje(telefono, Templates.menuProductor(perfil.nombre));
  } else {
    return await whatsappService.enviarMensaje(telefono, Templates.menuCamionero(perfil.nombre));
  }
}