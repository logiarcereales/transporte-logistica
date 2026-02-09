// services/messageTemplates.ts

export const Templates = {
  // --- TEXTOS SIMPLES ---
  mensajeTexto: (texto: string) => ({
    type: "text",
    text: { body: texto }
  }),

  ubicacion: (lat: number, lng: number, nombre: string, dir: string) => ({
    type: "location",
    location: { latitude: lat, longitude: lng, name: nombre, address: dir }
  }),

  // --- MENÚS INTERACTIVOS ---
  botonesRegistro: () => ({
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "¡Hola! Bienvenido a LogiAr. No te tengo registrado, ¿cuál es tu rol?" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "ROL_PRODUCTOR", title: "Productor" } },
          { type: "reply", reply: { id: "ROL_TRANSPORTISTA", title: "Transportista" } }
        ]
      }
    }
  }),

  // MENÚ PRODUCTOR (Solicitar Carga)
  menuProductor: (nombre: string) => ({
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `👋 Hola ${nombre} (Productor). ¿Qué necesitás hacer hoy?\n\nEn caso de necesitar asistencia de un operador escribí "Ayuda" o "Soporte".` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "ACCION_SOLICITAR", title: "🚛 Solicitar Carga" } },
          { type: "reply", reply: { id: "ACCION_VER_VIAJES", title: "📋 Mis Solicitudes" } },
          { type: "reply", reply: { id: "ACCION_PERFIL", title: "⚙️ Mi Perfil" } }
        ]
      }
    }
  }),

  // MENÚ CAMIONERO (Ver Cargas)
  menuCamionero: (nombre: string) => ({
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `👋 Hola ${nombre}  ¿Listo para viajar?\n\nEn caso de necesitar asistencia de un operador escribí "Ayuda" o "Soporte".` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "ACCION_VER_CARGAS", title: "🔍 Ver Cargas" } },
          { type: "reply", reply: { id: "ACCION_MIS_VIAJES", title: "📋 Mis Viajes" } },
          { type: "reply", reply: { id: "ACCION_PERFIL", title: "⚙️ Mi Perfil" } }
        ]
      }
    }
  }),

  // MENSAJE MODO SOPORTE
  inicioSoporte: () => ({
    type: "text",
    text: { body: "*Modo Soporte Activado*\n\nSe ha pausado el bot. Un operador humano te responderá en breve.\n\n➡️ Cuando termines, escribí *Menú* o *Salir* para reactivar sistema automático." }
  }),

  // --- WIZARD DE CARGA ---
  listaCereales: () => ({
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Nueva Carga" },
      body: { text: "Seleccioná el cereal:" },
      action: {
        button: "Ver Lista",
        sections: [
          {
            title: "Cereales",
            rows: [
              { id: "MAIZ", title: "Maíz" },
              { id: "SOJA", title: "Soja" },
              { id: "TRIGO", title: "Trigo" },
              { id: "MANI", title: "Maní" },
              { id: "GIRASOL", title: "Girasol" },
              { id: "SORGO", title: "Sorgo" },
              { id: "CEBADA", title: "Cebada" }
            ]
          }
        ]
      }
    }
  }),


  listaTipoCamion: () => ({
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Transporte" },
      body: { text: "¿Qué equipo necesitás?" },
      action: {
        button: "Ver Camiones",
        sections: [
          {
            title: "Equipos",
            rows: [
              { id: "CHASIS_Y_ACOPLADO", title: "Chasis y Acoplado" },
              { id: "BATEA", title: "Batea" },
              { id: "TOLVA", title: "Tolva" },
              { id: "SEMIREMOLQUE", title: "Semiremolque" }
            ]
          }
        ]
      }
    }
  }),

  // Para registro de camioneros seleccionar su tipo de camión
  seleccionTipoCamionRegistro: () => ({
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Registro de Vehículo" },
      body: { text: "¿Qué tipo de camión manejás?" },
      action: {
        button: "Ver Tipos",
        sections: [
          {
            title: "Tipos Comunes",
            rows: [
              { id: "CHASIS_Y_ACOPLADO", title: "Chasis y Acoplado" },
              { id: "BATEA", title: "Batea" },
              { id: "TOLVA", title: "Tolva" },
              { id: "SEMIREMOLQUE", title: "Semiremolque" }
            ]
          }
        ]
      }
    }
  }),
  // Selección de Origen Guardado
  listaOrigenes: (origenes: any[]) => {
    const rows = origenes.slice(0, 9).map((u: any) => ({
      id: u.id,
      title: u.nombre.substring(0, 24),
      description: (u.instrucciones_llegada || "").substring(0, 72)
    }));

    rows.push({
      id: "NUEVA_UBICACION",
      title: "📍 Nuevo Origen",
      description: "Enviar una ubicación distinta"
    });

    return {
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: "Origen de Carga" },
        body: { text: "Orígenes recientes. ¿Usamos uno de estos?" },
        action: {
          button: "Ver Orígenes",
          sections: [
            {
              title: "Mis Orígenes",
              rows: rows
            }
          ]
        }
      }
    };
  },

  // Selección de Destino Guardado
  listaDestinos: (destinos: any[]) => {
    const rows = destinos.slice(0, 9).map((u: any) => ({
      id: u.id,
      title: u.nombre.substring(0, 24),
      description: (u.instrucciones_llegada || "").substring(0, 72)
    }));

    rows.push({
      id: "NUEVA_UBICACION",
      title: "📍 Nuevo Destino",
      description: "Enviar una ubicación distinta"
    });

    return {
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: "Destino de Carga" },
        body: { text: "Destinos recientes. ¿Usamos uno de estos?" },
        action: {
          button: "Ver Destinos",
          sections: [
            {
              title: "Mis Destinos",
              rows: rows
            }
          ]
        }
      }
    };
  },

  listaTiposUbicacion: () => ({
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Tipo de Lugar" },
      body: { text: "Para organizar mejor tus lugares, indicá qué es:" },
      action: {
        button: "Ver Tipos",
        sections: [
          {
            title: "Tipos",
            rows: [
              { id: "CAMPO", title: "Campo" },
              { id: "PUERTO", title: "Puerto" },
              { id: "ACOPIO", title: "Acopio" },
              { id: "OTRO", title: "Otro" }
            ]
          }
        ]
      }
    }
  }),

  // --- NOTIFICACIONES ---
  notificacionNuevaCarga: (viaje: any, origen: string, destino: string) => {
    const texto =
      `🚚 *¡NUEVA CARGA DISPONIBLE!* \n\n` +
      `📦 *Cereal:* ${viaje.cereal}\n` +
      `⚖️ *Peso:* ${viaje.toneladas.toString().replace('.', ',')} TN\n` +
      `📍 *Ruta:* ${origen} -> ${destino}\n` +
      `\nEscribí *"Ver Cargas"* para postularte.`;

    return {
      type: "text",
      text: { body: texto }
    };
  }
};