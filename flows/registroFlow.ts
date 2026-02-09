// flows/registerFlow.ts
import * as userService from '../services/userService';
import * as whatsappService from '../services/whatsappService';
import { Templates } from '../services/messageTemplates';

export async function handleRegistro(telefono: string, mensaje: any, perfil: any) {
  const estado = perfil.estado_conversacion;

  // --- PASO 1: ELEGIR ROL ---
  if (estado === 'ESPERANDO_ROL') {
    if (mensaje.type === 'interactive') {
      const rol = mensaje.interactive.button_reply.id === 'ROL_PRODUCTOR' ? 'PRODUCTOR' : 'TRANSPORTISTA';

      // 1. Asignamos el ROL en la tabla rol_perfil
      await userService.asignarRol(perfil.id, rol);

      // 2. Actualizamos estado en perfil
      await userService.actualizarPerfil(telefono, {
        estado_conversacion: 'ESPERANDO_NOMBRE'
      });

      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(
        `¡Perfecto! Registrado como ${rol}. ¿Cuál es tu nombre completo?`
      ));
    }
    return await whatsappService.enviarMensaje(telefono, Templates.botonesRegistro());
  }

  // --- PASO 2: NOMBRE - Es diferente si es camionero o productor
  if (estado === 'ESPERANDO_NOMBRE') {
    if (mensaje.type === 'text') {
      const nombre = mensaje.text.body;

      // CAMINO A: Si es PRODUCTOR -> Terminamos acá
      if (perfil.rol === 'PRODUCTOR') {
        await userService.actualizarPerfil(telefono, {
          nombre,
          estado_conversacion: 'MENU_PRINCIPAL'
        });
        return await whatsappService.enviarMensaje(telefono, Templates.menuProductor(nombre));
      }

      // CAMINO B: Si es TRANSPORTISTA -> Seguimos pidiendo datos
      else {
        await userService.actualizarPerfil(telefono, {
          nombre,
          estado_conversacion: 'ESPERANDO_CUIL' // Siguiente paso camionero
        });
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto(
          `Gracias ${nombre}. Para poder asignarte cargas y cartas de porte, necesito tu CUIL (sin guiones).`
        ));
      }
    }
    return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("Por favor, escribí tu nombre completo."));
  }

  // --- PASO 3: CUIL (Solo Camioneros) ---
  if (estado === 'ESPERANDO_CUIL') {
    if (mensaje.type === 'text') {
      const cuil = mensaje.text.body.replace(/\D/g, ''); // Limpiamos guiones si puso

      // Validación básica de longitud (Argentina son 11 dígitos)
      if (cuil.length !== 11) {
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("⚠️ El CUIL debe tener 11 números. Intentá de nuevo."));
      }

      // Guardamos en 'cuit' (asumiendo que la DB usa cuit para ambos)
      await userService.actualizarPerfil(telefono, {
        cuit: cuil,
        estado_conversacion: 'ESPERANDO_PATENTE'
      });

      return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("👍 CUIL guardado. Ahora ingresá la PATENTE del camión (Ej: AD123BC)."));
    }
  }

  // --- PASO 4: PATENTE (Solo Camioneros) ---
  if (estado === 'ESPERANDO_PATENTE') {
    if (mensaje.type === 'text') {
      const patente = mensaje.text.body.toUpperCase().trim();

      // Guardamos la patente temporalmente en el campo 'apellido' (hack)
      await userService.actualizarPerfil(telefono, {
        apellido: patente,
        estado_conversacion: 'ESPERANDO_TIPO_CAMION'
      });

      // Usamos el template de lista para que elija
      return await whatsappService.enviarMensaje(telefono, Templates.seleccionTipoCamionRegistro());
    }
  }

  // --- PASO 5: TIPO DE CAMIÓN y FIN (Solo Camioneros) ---
  if (estado === 'ESPERANDO_TIPO_CAMION') {
    if (mensaje.type === 'interactive' && mensaje.interactive.type === 'list_reply') {
      const tipoCamion = mensaje.interactive.list_reply.id; // USAMOS ID AHORA

      // Recuperamos la patente que guardamos en 'apellido'
      const patente = perfil.apellido;

      try {
        await userService.registrarCamion(perfil.id, patente, tipoCamion);

        // Limpiamos el apellido (patente) y finalizamos
        await userService.actualizarPerfil(telefono, {
          apellido: '',
          estado_conversacion: 'MENU_PRINCIPAL'
        });

        return await whatsappService.enviarMensaje(telefono, Templates.menuCamionero(perfil.nombre));
      } catch (error) {
        console.error("Error registrando camión:", error);
        return await whatsappService.enviarMensaje(telefono, Templates.mensajeTexto("Hubo un error registrando el camión. Intentá de nuevo."));
      }
    }
    return await whatsappService.enviarMensaje(telefono, Templates.seleccionTipoCamionRegistro());
  }
}