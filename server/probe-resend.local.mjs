/**
 * Probe de diagnostico de Resend: usa la MISMA configuracion que server.js
 * (RESEND_API_KEY, MAIL_FROM, MAIL_TO de server/.env) y envia un email de prueba.
 * No toca Supabase. Ejecutar: node probe-resend.local.mjs [destinatario]
 */
import 'dotenv/config';
import { Resend } from 'resend';

const key = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM || 'Los Olivos <onboarding@resend.dev>';
const to = process.argv[2] || process.env.MAIL_TO || 'pgallardob@hotmail.com';

console.log('RESEND_API_KEY:', key ? `${key.slice(0, 8)}...${key.slice(-4)} (largo ${key.length})` : 'NO CONFIGURADA');
console.log('MAIL_FROM:', from);
console.log('MAIL_TO (prueba):', to);

if (!key) {
  console.log('\nRESULTADO: sin API key, el backend omite el email silenciosamente.');
  process.exit(0);
}

const resend = new Resend(key);
const { data, error } = await resend.emails.send({
  from,
  to,
  subject: '[Diagnostico] Prueba de envio - Los Olivos',
  text: 'Email de prueba del sistema de avisos. Si llego, la configuracion de Resend funciona.',
});

if (error) {
  console.log('\nRESULTADO: ERROR de Resend:');
  console.log(JSON.stringify(error, null, 2));
} else {
  console.log('\nRESULTADO: Enviado OK, id:', data?.id);
  console.log('Si este email no llega a la bandeja, revisar spam o el destinatario permitido.');
}
