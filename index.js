require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const deployToNetlify = require('./deployNetlify');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const userStates = {};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!userStates[chatId]) {
    userStates[chatId] = { step: 0 };
    bot.sendMessage(chatId, "📸 أرسل صورة المنتج:");
    return;
  }

  const state = userStates[chatId];

  if (state.step === 0 && msg.photo) {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;
    state.imageUrl = imageUrl;
    state.step++;
    bot.sendMessage(chatId, "📝 ما اسم المنتج؟");
    return;
  }

  if (state.step === 1 && msg.text) {
    state.productName = msg.text;
    state.step++;
    bot.sendMessage(chatId, "💰 ما هو سعر المنتج؟");
    return;
  }

  if (state.step === 2 && msg.text) {
    state.price = msg.text;
    state.step++;
    bot.sendMessage(chatId, "🏷️ ما هي الماركة؟");
    return;
  }

  if (state.step === 3 && msg.text) {
    state.brand = msg.text;
    state.step++;

    const { imageUrl, productName, price, brand } = state;

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${productName}</title>
  <style>
    body { font-family: Arial; text-align: center; padding: 20px; }
    img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 0 8px rgba(0,0,0,0.2); }
    form { display: flex; flex-direction: column; gap: 10px; max-width: 300px; margin: 20px auto; }
    input, textarea, button { padding: 10px; font-size: 16px; border-radius: 8px; border: 1px solid #ccc; }
    button { background-color: #28a745; color: white; cursor: pointer; border: none; }
  </style>
</head>
<body>
  <h1>${productName}</h1>
  <p><strong>💰 السعر:</strong> ${price} دج</p>
  <p><strong>🏷️ الماركة:</strong> ${brand}</p>
  <img src="${imageUrl}" alt="صورة المنتج" />
  <h2>📦 اطلب الآن</h2>
  <form action="https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage" method="POST" onsubmit="event.preventDefault(); sendOrder();">
    <input type="text" id="name" placeholder="الاسم الكامل" required>
    <input type="text" id="phone" placeholder="رقم الهاتف" required>
    <textarea id="address" placeholder="العنوان الكامل" required></textarea>
    <button type="submit">إرسال الطلب</button>
  </form>
  <script>
    async function sendOrder() {
      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
      const message = \`🛒 طلب جديد:\n\n👤 الاسم: \${name}\n📞 الهاتف: \${phone}\n📍 العنوان: \${address}\n📦 المنتج: ${productName}\n💰 السعر: ${price}\n🏷️ الماركة: ${brand}\`;
      const res = await fetch('https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ${process.env.TELEGRAM_ADMIN_ID},
          text: message
        })
      });
      alert("✅ تم إرسال الطلب بنجاح!");
    }
  </script>
</body>
</html>`;

    try {
      const url = await deployToNetlify(html, `product-${Date.now()}.html`);
      bot.sendMessage(chatId, `✅ رابط صفحة منتجك:\n${url}`);
    } catch (error) {
      console.error("❌ Deployment error:", error);
      bot.sendMessage(chatId, "حدث خطأ أثناء رفع الصفحة. حاول مرة أخرى.");
    }

    delete userStates[chatId];
    return;
  }

  bot.sendMessage(chatId, "📎 أرسل المعلومات خطوة بخطوة بدءًا بصورة المنتج.");
});