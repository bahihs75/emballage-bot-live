const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeHtml, renderProductPage } = require('../src/template');
const { parsePrice, validateProductInput, validateOrderPayload } = require('../src/validation');
const { handler: createOrder } = require('../netlify/functions/create-order');

test('escapeHtml neutralizes markup characters', () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
});

test('parsePrice accepts positive decimal values and rejects invalid values', () => {
  assert.equal(parsePrice('180'), '180');
  assert.equal(parsePrice('180,50'), '180.50');
  assert.equal(parsePrice('-10'), null);
  assert.equal(parsePrice('free'), null);
});

test('validateProductInput returns normalized product data', () => {
  const result = validateProductInput({ productName: '  زيت  ', price: '180', brand: '  ماني ' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.value, { productName: 'زيت', price: '180', brand: 'ماني' });
});

test('validateOrderPayload reports all invalid fields', () => {
  const result = validateOrderPayload({ name: '', phone: 'abc', address: 'short' });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['address', 'name', 'phone']);
});

test('create-order rejects unsupported methods', async () => {
  const response = await createOrder({ httpMethod: 'GET' });
  assert.equal(response.statusCode, 405);
});

test('create-order reports missing runtime configuration', async () => {
  const response = await createOrder({ httpMethod: 'POST', body: JSON.stringify({}) });
  assert.equal(response.statusCode, 503);
});

test('renderProductPage creates an RTL page without a Telegram URL', () => {
  const html = renderProductPage({
    productName: 'منتج تجريبي',
    price: '180',
    brand: 'علامة',
    imageDataUri: 'data:image/jpeg;base64,abc',
  });
  assert.match(html, /lang="ar" dir="rtl"/);
  assert.match(html, /منتج تجريبي/);
  assert.match(html, /data:image\/jpeg/);
  assert.doesNotMatch(html, /api\.telegram\.org\/file\/bot/);
  assert.doesNotMatch(html, /\{\{name\}\}/);
});
