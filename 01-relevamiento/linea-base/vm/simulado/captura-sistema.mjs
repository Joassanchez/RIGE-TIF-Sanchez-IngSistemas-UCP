// Observación de LLMRequestPrep.prepare en OpenCode 1.18.25.
// No modifica system ni envía una respuesta de modelo. La excepción corta
// esta sonda antes del transporte, con el modelo realmente seleccionado.
import { appendFileSync } from 'node:fs';

export const CapturaSistema = async () => ({
  'experimental.chat.system.transform': async (input, output) => {
    if (!input.sessionID) return;
    if (!process.env.RIGE_SISTEMA_CAPTURA || !Array.isArray(output.system)
        || !output.system.length || !output.system.every(x => typeof x === 'string')) {
      throw new Error('MED13: captura de sistema inválida');
    }
    appendFileSync(process.env.RIGE_SISTEMA_CAPTURA, JSON.stringify({
      evento: 'system', sessionID: input.sessionID,
      modelo: input.model.providerID + '/' + input.model.id,
      system: [...output.system], detencion: 'RIGE_MED13_SISTEMA_CAPTURADO',
    }) + '\n');
    throw new Error('RIGE_MED13_SISTEMA_CAPTURADO');
  },
});
