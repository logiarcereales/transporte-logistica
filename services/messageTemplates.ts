
export const Templates = {
  // --- TEXTOS SIMPLES ---
  mensajeTexto: (texto: string) => ({
    type: "text",
    text: { body: texto }
  }),


  // MENSAJE MODO SOPORTE
  inicioSoporte: () => ({
    type: "text",
    text: { body: "*Modo Soporte Activado*\n\nSe ha pausado el bot. Un operador humano te responderá en breve.\n\n➡️ Cuando termines, escribí *Menú* o *Salir* para reactivar sistema automático." }
  }),
}
