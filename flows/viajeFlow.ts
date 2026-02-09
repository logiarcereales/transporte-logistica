import * as userService from '../services/userService';
import * as whatsappService from '../services/whatsappService';
import * as viajeService from '../services/viajeService';
import { notificarCamionerosNuevaCarga } from '../services/notificationService';
import { Templates } from '../services/messageTemplates';

export async function handleCargaViaje(telefono: string, mensaje: any, perfil: any) {
  const estado = perfil.estado_conversacion;

  // Recuperamos el viaje en curso (estado SOLICITADO)
  const viaje = await viajeService.obtenerViajeEnCurso(perfil.id);
  const viajeId = viaje?.id;

  if (!viajeId) {
    // Si no hay viaje en curso pero estamos en este estado, algo falló. Reiniciamos.
    await userService.actualizarPerfil(telefono, { estado_conversacion: 'MENU_PRINCIPAL' });
    return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("⚠️ No encontré el viaje activo. Volvamos al menú."));
  }

  switch (estado) {
    case 'ESPERANDO_CEREAL':
      if (mensaje.type === 'interactive') {
        const cereal = mensaje.interactive.list_reply.id; // USAMOS ID (MAIZ, SOJA, etc)

        await viajeService.actualizarViaje(viajeId, { cereal });
        // Salto directo a Toneladas
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_TONELADAS' });

        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("¿Cuántas toneladas son? (Ej: 30,5)"));
      }
      return await whatsappService.enviarMensaje(telefono, Templates.listaCereales());

    case 'ESPERANDO_TONELADAS':
      if (mensaje.type === 'text') {
        const tons = parseFloat(mensaje.text.body.replace(',', '.'));
        if (isNaN(tons)) return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("⚠️ Error: Ingresá un número válido (ej: 30,5)."));

        await viajeService.actualizarViaje(viajeId, { toneladas: tons });

        await viajeService.actualizarViaje(viajeId, { toneladas: tons });

        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_TIPO_CAMION_CARGA' });
        return await whatsappService.enviarMensaje(telefono, Templates.listaTipoCamion());
      }
      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("Por favor, ingresá las toneladas en números."));

    case 'ESPERANDO_TIPO_CAMION_CARGA':
      if (mensaje.type === 'interactive') {
        const idTipoCamion = mensaje.interactive.list_reply.id;

        await viajeService.actualizarViaje(viajeId, { tipo_camion: idTipoCamion }); // Make sure col exists or this will fail silently if not strict? actually DB error.

        // NOW CHECK HISTORY
        const origenes = await userService.obtenerOrigenesRecientes(perfil.id);

        if (origenes.length > 0) {
          await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_ORIGEN' });
          return await whatsappService.enviarMensaje(telefono, Templates.listaOrigenes(origenes));
        } else {
          await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_ORIGEN' });
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("📍 ¿Desde dónde sale la carga? Enviame la ubicación o escribí el nombre del campo."));
        }
      }
      return await whatsappService.enviarMensaje(telefono, Templates.listaTipoCamion());


    case 'ESPERANDO_ORIGEN':
      // console.log('DEBUG: ESPERANDO_ORIGEN Message:', JSON.stringify(mensaje, null, 2)); 

      // 1. Handle List Reply (From Recent Origins)
      if (mensaje.type === 'interactive' && mensaje.interactive.type === 'list_reply') {
        const seleccion = mensaje.interactive.list_reply.id;
        if (seleccion === 'NUEVA_UBICACION') {
          // User wants new, just invite them to send text/loc
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("📍 Enviame la ubicación GPS o escribí el nombre del campo/lugar."));
        } else {
          // Selected Existing Origin
          await viajeService.actualizarViaje(viajeId, { id_origen: seleccion });

          // Go to Destination
          await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_DESTINO' });
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏁 Origen cargado. ¿A dónde va la carga? (Escribí el destino)"));
        }
      }

      // 2. Handle Text (Name Search)
      if (mensaje.type === 'text') {
        const nombreOrigen = mensaje.text.body;

        // Search for existing location
        const ubicacionExistente = await viajeService.buscarUbicacionPorNombre(nombreOrigen);

        if (ubicacionExistente) {
          // Found! Use it.
          await viajeService.actualizarViaje(viajeId, { id_origen: ubicacionExistente.id });

          // Go to Destination
          await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_DESTINO' });
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(`✅ Origen "${ubicacionExistente.nombre}" seleccionado.\n\n🏁 ¿A dónde va la carga? (Escribí el destino)`));
        } else {
          // Not found. Ask for GPS.
          await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_GPS_ORIGEN_NUEVO' });
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(`📍 No encontré "${nombreOrigen}".\n\nPor favor, enviame la ubicación GPS (adjuntar ubicación) para guardarlo.`));
        }
      }

      // 3. Handle Direct GPS
      if (mensaje.type === 'location') {
        const lat = mensaje.location.latitude;
        const long = mensaje.location.longitude;

        // Create with temp name
        const ubicacion = await viajeService.crearUbicacion("Ubicación Temporal", lat, long, 'CAMPO');
        await viajeService.actualizarViaje(viajeId, { id_origen: ubicacion.id });

        // Ask for Name
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_NOMBRE_ORIGEN' });
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏷️ ¿Qué nombre le ponemos a este nuevo origen?"));
      }

      // Fallback
      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("📍 Por favor, elegí de la lista, enviame ubicación GPS o escribí el nombre del lugar."));

    case 'ESPERANDO_GPS_ORIGEN_NUEVO':
      if (mensaje.type === 'location') {
        const lat = mensaje.location.latitude;
        const long = mensaje.location.longitude;

        // Create with temp name
        const ubicacion = await viajeService.crearUbicacion("Origen Nuevo", lat, long, 'CAMPO');
        await viajeService.actualizarViaje(viajeId, { id_origen: ubicacion.id });

        // Ask for Name
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_NOMBRE_ORIGEN' });
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏷️ Recibido. ¿Qué nombre le ponemos a este campo?"));
      } else {
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("📍 Necesito que me envíes la UBICACIÓN (adjuntar ubicación) para poder guardar el origen nuevo."));
      }

    case 'ESPERANDO_NOMBRE_ORIGEN':
      if (mensaje.type === 'text') {
        const nombre = mensaje.text.body;
        const viajeActual = await viajeService.obtenerViajeEnCurso(perfil.id);

        if (viajeActual?.id_origen) {
          await viajeService.actualizarUbicacion(viajeActual.id_origen, { nombre: nombre });
        }

        // Go to Destination
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_DESTINO' });
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("✅ Origen guardado. ¿A dónde va la carga? (Escribí el destino)"));
      }
      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏷️ Escribí un nombre para el origen."));

    case 'ESPERANDO_DESTINO':
      if (mensaje.type === 'text') {
        const nombreDestino = mensaje.text.body;

        // 1. Search for existing location
        const ubicacionExistente = await viajeService.buscarUbicacionPorNombre(nombreDestino);

        if (ubicacionExistente) {
          // Found! Use it.
          await viajeService.actualizarViaje(viajeId, { id_destino: ubicacionExistente.id });

          // Finalize Trip
          const viajeFinal = await viajeService.actualizarViaje(viajeId, { estado: 'SOLICITADO' });
          await userService.actualizarPerfil(telefono, { estado_conversacion: 'MENU_PRINCIPAL' });

          const origen = await viajeService.obtenerUbicacion(viajeFinal.id_origen);
          const destino = ubicacionExistente;

          await notificarCamionerosNuevaCarga(viajeFinal, origen?.nombre || 'Origen', destino.nombre);
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(`🚀 ¡Carga Publicada Exitosamente! (Destino encontrado: ${destino.nombre})\n\nOrigen: ${origen?.nombre}\nDestino: ${destino.nombre}`));
        } else {
          // Not found. Ask for GPS.
          await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_GPS_DESTINO_NUEVO' });
          return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(`📍 No encontré "${nombreDestino}".\n\nPor favor, enviame la ubicación GPS (adjuntar ubicación) para guardarlo.`));
        }
      } else if (mensaje.type === 'location') {
        // Direct GPS. Ask for name.
        const lat = mensaje.location.latitude;
        const long = mensaje.location.longitude;

        // Create Temp Location
        const ubicacion = await viajeService.crearUbicacion("Ubicación Temporal", lat, long, 'OTRO');
        await viajeService.actualizarViaje(viajeId, { id_destino: ubicacion.id });

        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_NOMBRE_DESTINO' });
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏷️ ¿Qué nombre le ponemos a este nuevo destino?"));
      }

      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏁 Escribí el nombre del destino (ej: 'Puerto Rosario') o enviame la ubicación GPS."));

    case 'ESPERANDO_GPS_DESTINO_NUEVO':
      if (mensaje.type === 'location') {
        const lat = mensaje.location.latitude;
        const long = mensaje.location.longitude;

        // Create with temp name
        const ubicacion = await viajeService.crearUbicacion("Destino Nuevo", lat, long, 'OTRO');
        await viajeService.actualizarViaje(viajeId, { id_destino: ubicacion.id });

        // Ask for Name
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'ESPERANDO_NOMBRE_DESTINO' });
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏷️ Recibido. ¿Qué nombre le ponemos a este lugar?"));
      } else {
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("📍 Necesito que me envíes la UBICACIÓN (adjuntar ubicación) para poder guardar el destino nuevo."));
      }

    case 'ESPERANDO_NOMBRE_DESTINO':
      if (mensaje.type === 'text') {
        const nombre = mensaje.text.body;
        const viajeActual = await viajeService.obtenerViajeEnCurso(perfil.id);

        if (viajeActual?.id_destino) {
          await viajeService.actualizarUbicacion(viajeActual.id_destino, { nombre: nombre });
        }

        // Finalize Trip
        const viajeFinal = await viajeService.actualizarViaje(viajeId, { estado: 'SOLICITADO' });
        await userService.actualizarPerfil(telefono, { estado_conversacion: 'MENU_PRINCIPAL' });

        const origen = await viajeService.obtenerUbicacion(viajeFinal.id_origen);
        const destino = await viajeService.obtenerUbicacion(viajeFinal.id_destino); // Fetched updated

        await notificarCamionerosNuevaCarga(viajeFinal, origen?.nombre || 'Origen', destino?.nombre || nombre);

        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(`🚀 ¡Carga Publicada Exitosamente!\n\nOrigen: ${origen?.nombre}\nDestino: ${destino?.nombre}`));
      }
      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("🏷️ Escribí un nombre para el nuevo destino."));
  }
}