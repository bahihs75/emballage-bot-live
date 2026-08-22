const { normalizeText } = require('./validation');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function renderProductPage({ productName, price, brand, imageDataUri, orderEndpoint = '/api/orders' }) {
  const name = normalizeText(productName);
  const safePrice = normalizeText(price, 32);
  const safeBrand = normalizeText(brand, 80);
  const endpoint = normalizeText(orderEndpoint, 240);
  const product = safeJson({ productName: name, price: safePrice, brand: safeBrand });

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(name)} — صفحة طلب مباشرة من المتجر">
  <meta name="theme-color" content="#f4f1ea">
  <title>${escapeHtml(name)} — متجر</title>
  <style>
    :root {
      color-scheme: light;
      --paper: #f4f1ea;
      --surface: #fffdf8;
      --ink: #161616;
      --muted: #68645d;
      --line: #d7d0c5;
      --accent: #b53b31;
      --accent-deep: #8f2c25;
      --success: #2f6b4a;
      --radius: 10px;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: var(--paper); color: var(--ink); }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .06;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E");
      z-index: -1;
    }
    .shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; }
    .utility { border-bottom: 1px solid var(--line); padding: 14px 0; font: 12px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; color: var(--muted); }
    .utility-inner { display: flex; justify-content: space-between; gap: 16px; }
    .hero { min-height: min(780px, 100dvh); display: grid; grid-template-columns: 1.05fr .95fr; align-items: center; gap: clamp(38px, 8vw, 110px); padding: clamp(54px, 9vw, 120px) 0 96px; }
    .eyebrow { margin: 0 0 18px; font: 12px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
    h1 { max-width: 11ch; margin: 0; font-size: clamp(48px, 8vw, 108px); line-height: .92; letter-spacing: -.065em; text-wrap: balance; }
    .lead { max-width: 42ch; margin: 28px 0 0; color: var(--muted); font-size: 18px; line-height: 1.7; }
    .price-block { display: flex; align-items: baseline; gap: 12px; margin: 30px 0 0; }
    .price { font: 600 clamp(28px, 4vw, 44px)/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: -.05em; }
    .currency { color: var(--muted); font-size: 16px; }
    .product-frame { position: relative; padding: 10px; background: rgba(22,22,22,.05); border: 1px solid var(--line); border-radius: calc(var(--radius) + 4px); }
    .product-frame::before { content: "PRODUCT / 01"; position: absolute; top: -28px; right: 0; font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); letter-spacing: .1em; }
    .product-frame img { display: block; width: 100%; max-height: 610px; min-height: 380px; object-fit: contain; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); }
    .facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; margin-top: 26px; background: var(--line); border: 1px solid var(--line); }
    .fact { padding: 18px; background: var(--surface); }
    .fact-label { display: block; margin-bottom: 8px; color: var(--muted); font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; }
    .fact-value { font-size: 16px; font-weight: 600; }
    .order { border-top: 2px solid var(--ink); padding: 88px 0 110px; }
    .order-grid { display: grid; grid-template-columns: .75fr 1.25fr; gap: clamp(40px, 9vw, 130px); }
    h2 { margin: 0; font-size: clamp(34px, 5vw, 64px); line-height: .98; letter-spacing: -.055em; text-wrap: balance; }
    .order-copy { color: var(--muted); line-height: 1.7; }
    form { display: grid; gap: 18px; }
    label { display: grid; gap: 8px; font-weight: 600; }
    input, textarea { width: 100%; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); padding: 15px 16px; font: inherit; outline: none; }
    textarea { min-height: 120px; resize: vertical; }
    input:focus, textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(181,59,49,.14); }
    .field-error { min-height: 18px; color: var(--accent-deep); font-size: 13px; font-weight: 400; }
    button { min-height: 52px; border: 0; border-radius: 6px; background: var(--ink); color: #fff; cursor: pointer; font: 600 16px inherit; transition: background 220ms ease, transform 220ms ease; }
    button:hover { background: var(--accent-deep); }
    button:active { transform: translateY(1px) scale(.99); }
    button:disabled { cursor: wait; opacity: .55; }
    .status { min-height: 24px; margin: 0; font-size: 14px; }
    .status.success { color: var(--success); }
    .status.error { color: var(--accent-deep); }
    footer { border-top: 1px solid var(--line); padding: 22px 0 34px; color: var(--muted); font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
    @media (max-width: 760px) {
      .shell { width: min(100% - 28px, 560px); }
      .utility-inner { align-items: flex-start; flex-direction: column; gap: 6px; }
      .hero, .order-grid { grid-template-columns: 1fr; }
      .hero { min-height: auto; gap: 54px; padding-top: 70px; }
      h1 { max-width: 9ch; }
      .product-frame img { min-height: 280px; }
      .order { padding: 64px 0 78px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
    }
  </style>
</head>
<body>
  <header class="utility">
    <div class="shell utility-inner"><span>DIRECT ORDER / ${escapeHtml(safeBrand)}</span><span>REF 01 — AVAILABLE</span></div>
  </header>
  <main>
    <section class="shell hero" aria-labelledby="product-title">
      <div>
        <p class="eyebrow">منتج مختار / ${escapeHtml(safeBrand)}</p>
        <h1 id="product-title">${escapeHtml(name)}</h1>
        <p class="lead">اطلب المنتج مباشرة. اترك بياناتك وسنتواصل معك لتأكيد الكمية والعنوان وموعد التوصيل.</p>
        <div class="price-block"><span class="price">${escapeHtml(safePrice)}</span><span class="currency">دج</span></div>
        <div class="facts" aria-label="تفاصيل المنتج">
          <div class="fact"><span class="fact-label">العلامة</span><span class="fact-value">${escapeHtml(safeBrand)}</span></div>
          <div class="fact"><span class="fact-label">الحالة</span><span class="fact-value">متوفر للطلب</span></div>
        </div>
      </div>
      <div class="product-frame"><img src="${escapeHtml(imageDataUri)}" alt="صورة ${escapeHtml(name)}"></div>
    </section>
    <section class="order" id="order" aria-labelledby="order-title">
      <div class="shell order-grid">
        <div><p class="eyebrow">ORDER / 02</p><h2 id="order-title">أرسل طلبك</h2><p class="order-copy">الحقول المطلوبة تحمي وقتك وتساعدنا على تجهيز الطلب بشكل صحيح.</p></div>
        <form id="order-form" novalidate>
          <label for="name">الاسم الكامل<input id="name" name="name" autocomplete="name" required maxlength="100"><span class="field-error" data-error-for="name"></span></label>
          <label for="phone">رقم الهاتف<input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40"><span class="field-error" data-error-for="phone"></span></label>
          <label for="address">العنوان الكامل<textarea id="address" name="address" autocomplete="street-address" required maxlength="240"></textarea><span class="field-error" data-error-for="address"></span></label>
          <p class="status" id="status" role="status" aria-live="polite"></p>
          <button type="submit" id="submit-button">تأكيد الطلب</button>
        </form>
      </div>
    </section>
  </main>
  <footer><div class="shell">${escapeHtml(safeBrand)} / صفحة طلب مباشرة / ${new Date().getUTCFullYear()}</div></footer>
  <script>
    const product = ${product};
    const endpoint = ${safeJson(endpoint)};
    const form = document.getElementById('order-form');
    const status = document.getElementById('status');
    const button = document.getElementById('submit-button');
    const fields = ['name', 'phone', 'address'];

    function setError(field, message) {
      document.querySelector('[data-error-for="' + field + '"]').textContent = message || '';
    }

    function validate() {
      const values = Object.fromEntries(new FormData(form).entries());
      const errors = {};
      if (!values.name || values.name.trim().length < 2) errors.name = 'الاسم مطلوب.';
      if (!/^[+\\d][\\d\\s().-]{6,24}$/.test((values.phone || '').trim())) errors.phone = 'رقم الهاتف غير صالح.';
      if (!values.address || values.address.trim().length < 8) errors.address = 'العنوان مطلوب.';
      fields.forEach((field) => setError(field, errors[field]));
      return { values, valid: Object.keys(errors).length === 0 };
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.className = 'status';
      status.textContent = '';
      const result = validate();
      if (!result.valid) { status.className = 'status error'; status.textContent = 'راجع الحقول المطلوبة.'; return; }
      button.disabled = true;
      button.textContent = 'جارٍ إرسال الطلب…';
      try {
        const response = await fetch(endpoint || '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...result.values, product }) });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || 'تعذر إرسال الطلب.');
        form.reset();
        status.className = 'status success';
        status.textContent = 'تم استلام طلبك. سنتواصل معك للتأكيد.';
      } catch (error) {
        status.className = 'status error';
        status.textContent = error.message || 'تعذر إرسال الطلب. حاول مرة أخرى.';
      } finally {
        button.disabled = false;
        button.textContent = 'تأكيد الطلب';
      }
    });
  </script>
</body>
</html>`;
}

module.exports = { escapeHtml, renderProductPage };
