const BASE = process.env.BASE_URL || 'http://localhost:3002';
// CONVO=1 mantiene el historial entre mensajes (como el widget real) para probar flujos con contexto
const CONVO = process.env.CONVO === '1';

async function chat(message, history) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ message, ...(history ? { history } : {}) }),
  });
  const data = await res.json();
  return data;
}

const cases = process.argv.slice(2);
const history = [];

for (const msg of cases.length ? cases : ['quien eres tu']) {
  console.log(`\n=== "${msg}" ===`);
  try {
    const data = await chat(msg, CONVO ? history.slice(-6) : undefined);
    if (CONVO) {
      history.push({ role: 'user', content: msg });
      history.push({ role: 'assistant', content: data.reply || '' });
    }
    if (data.redirect_url) console.log(`[REDIRECT]: ${data.redirect_url}`);
    console.log(data.reply);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
}
