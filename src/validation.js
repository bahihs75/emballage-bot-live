const MAX_TEXT_LENGTH = 120;
const MAX_ADDRESS_LENGTH = 240;

function normalizeText(value, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function parsePrice(value) {
  const normalized = normalizeText(value, 32).replace(',', '.').replace(/\s/g, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 && amount <= 100000000 ? normalized : null;
}

function validateProductInput(input) {
  const productName = normalizeText(input.productName);
  const brand = normalizeText(input.brand, 80);
  const price = parsePrice(input.price);
  const errors = {};

  if (productName.length < 2) errors.productName = 'اسم المنتج قصير جدًا.';
  if (!price) errors.price = 'أدخل سعرًا موجبًا، مثل 180 أو 180.50.';
  if (brand.length < 2) errors.brand = 'اسم العلامة التجارية قصير جدًا.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: { productName, price, brand },
  };
}

function validateOrderPayload(input) {
  const name = normalizeText(input.name, 100);
  const phone = normalizeText(input.phone, 40);
  const address = normalizeText(input.address, MAX_ADDRESS_LENGTH);
  const errors = {};

  if (name.length < 2) errors.name = 'الاسم مطلوب.';
  if (!/^[+\d][\d\s().-]{6,24}$/.test(phone)) errors.phone = 'رقم الهاتف غير صالح.';
  if (address.length < 8) errors.address = 'العنوان مطلوب.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: { name, phone, address },
  };
}

module.exports = { normalizeText, parsePrice, validateProductInput, validateOrderPayload };
