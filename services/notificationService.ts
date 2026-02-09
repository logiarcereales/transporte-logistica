// services/notificationService.ts
import * as userService from './userService';
import * as whatsappService from './whatsappService';
import * as viajeService from './viajeService';
import { Templates } from './messageTemplates';


export async function notificarCamionerosNuevaCarga(viaje: any, nombreOrigen: string, nombreDestino: string) {
  try {
    const allCamioneros = await userService.obtenerTodosLosCamioneros();

    // Filter by Truck Type if specified
    const camioneros = viaje.tipo_camion
      ? allCamioneros.filter((c: any) => c.camiones?.some((t: any) => t.tipo_camion === viaje.tipo_camion))
      : allCamioneros;

    console.log(`📡 Broadcast iniciado: Notificando a ${camioneros.length} camioneros (Total: ${allCamioneros.length}).`);

    let latOrigen = null;
    let lngOrigen = null;
    let latDestino = null;
    let lngDestino = null;

    if (viaje.id_origen) {
      const ubicacion = await viajeService.obtenerUbicacion(viaje.id_origen);
      if (ubicacion) {
        latOrigen = ubicacion.latitud;
        lngOrigen = ubicacion.longitud;
      }
    }

    if (viaje.id_destino) {
      const ubicacionDest = await viajeService.obtenerUbicacion(viaje.id_destino);
      if (ubicacionDest) {
        latDestino = ubicacionDest.latitud;
        lngDestino = ubicacionDest.longitud;
      }
    }

    // Ejecutamos el envío en paralelo (Fire & Forget)
    Promise.all(camioneros.map(async (c) => {
      console.log(`📡 Enviando notificación a ${c.telefono}`);

      // 1. Enviar Texto
      await whatsappService.enviarMensaje(
        c.telefono,
        Templates.notificacionNuevaCarga(viaje, nombreOrigen, nombreDestino)
      );

      // 2. Enviar Mapa Origen (Si tiene coordenadas)
      if (latOrigen && lngOrigen) {
        await whatsappService.enviarMensaje(
          c.telefono,
          Templates.ubicacion(latOrigen, lngOrigen, "📍 Origen: " + nombreOrigen, `Carga de ${viaje.cereal}`)
        );
      }

      // 3. Enviar Mapa Destino (Si tiene coordenadas)
      if (latDestino && lngDestino) {
        await whatsappService.enviarMensaje(
          c.telefono,
          Templates.ubicacion(latDestino, lngDestino, "🏁 Destino: " + nombreDestino, "Destino de descarga")
        );
      }
    })).catch(err => console.error("Error en broadcast:", err));

    return camioneros.length;

  } catch (error) {
    console.error("Error obteniendo camioneros:", error);
    return 0;
  }
}