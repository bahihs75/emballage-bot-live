const crypto = require('node:crypto');
const { validateOrderPayload, normalizeText } = require('../../src/validation');

const TELEGRAM_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 20_000;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

function withTimeout(parentSignal, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (parentSignal) parentSignal.addEventListener('abort', () => controller.abort(), { once: true });
  return { controller, timeout };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed.' });
  if (!event.body || Buffer.byteLength(event.body, 'utf8') > MAX_BODY_BYTES) {
    return json(413, { message: 'الطلب كبير جدًا.' });
  }

  const botToken = process.env.TELEGRAM_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_ID;
  if (!botToken || !adminChatId) return json(503, { message: 'خدمة الطلبات غير مهيأة.' });

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return json(400, { message: 'صيغة الطلب غير صالحة.' });
  }

  const order = validateOrderPayload(payload);
  if (!order.valid) return json(422, { message: 'راجع بيانات الطلب.', errors: order.errors });

  const product = payload.product || {};
  const productName = normalizeText(product.productName, 120);
  const price = normalizeText(product.price, 32);
  const brand = normalizeText(product.brand, 80);
  if (!productName || !price || !brand) return json(422, { message: 'بيانات المنتج غير مكتملة.' });

  const requestId = crypto.randomUUID();
  const message = [
    'طلب جديد',
    `المرجع: ${requestId}`,
    '',
    `الاسم: ${order.value.name}`,
    `الهاتف: ${order.value.phone}`,
    `العنوان: ${order.value.address}`,
    '',
    `المنتج: ${productName}`,
    `السعر: ${price} دج`,
    `العلامة: ${brand}`,
  ].join('\n');

  const { controller, timeout } = withTimeout(null, TELEGRAM_TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminChatId, text: message }),
      signal: controller.signal,
    });
    const telegramPayload = await response.json().catch(() => ({}));
    if (!response.ok || telegramPayload.ok !== true) return json(502, { message: 'تعذر تسليم الطلب. حاول مرة أخرى.', requestId });
    return json(201, { message: 'تم استلام الطلب.', requestId });
  } catch (error) {
    console.error('order_delivery_failed', { requestId, name: error.name, message: error.message });
    return json(502, { message: 'تعذر تسليم الطلب. حاول مرة أخرى.', requestId });
  } finally {
    clearTimeout(timeout);
  }
};
