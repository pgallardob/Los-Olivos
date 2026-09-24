const BASE = process.env.BASE_URL || 'http://localhost:3002';

async function chat(message) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data.reply;
}

const cases = process.argv.slice(2);

for (const msg of cases.length ? cases : ['quien eres tu']) {
  console.log(`\n=== "${msg}" ===`);
  try {
    const reply = await chat(msg);
    console.log(reply);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
}
