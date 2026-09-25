const BASE = process.env.BASE_URL || 'http://localhost:3002';

const res = await fetch(`${BASE}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ message: process.argv[2] || 'hola' }),
});
console.log('status:', res.status);
console.log('headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
const text = await res.text();
console.log('bodyLen:', text.length);
console.log('body:', text.slice(0, 400));
