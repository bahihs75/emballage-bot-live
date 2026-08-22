require('dotenv').config();

const deployToNetlify = require('./deployNetlify');
const { TelegramClient } = require('./src/telegram');
const { parsePrice, validateProductInput, normalizeText } = require('./src/validation');
const { renderProductPage } = require('./src/template');

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error('TELEGRAM_TOKEN is required.');

const bot = new TelegramClient(token);
const userStates = new Map();
const ORDER_ENDPOINT = process.env.ORDER_ENDPOINT || '/.netlify/functions/create-order';
const TELEGRAM_TIMEOUT_MS = 15_000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function safeSend(chatId, text, options) {
  return bot.sendMessage(chatId, text, options).catch((error) => {
    console.error('telegram_send_failed', { chatId, message: error.message });
  });
}

async function getTelegramImageDataUri(fileId) {
  const file = await bot.getFile(fileId);
  const response = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`, {
    signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Telegram image download failed with HTTP ${response.status}.`);
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_IMAGE_BYTES) throw new Error('Image exceeds the allowed size.');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error('Image exceeds the allowed size.');
  const extension = (file.file_path || '').split('.').pop().toLowerCase();
  const mime = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

async function completeProduct(chatId, state) {
  const validation = validateProductInput(state);
  if (!validation.valid) {
    await safeSend(chatId, Object.values(validation.errors).join('\n'));
    return;
  }

  await safeSend(chatId, 'جارٍ تجهيز صفحة المنتج.');
  const html = renderProductPage({
    ...validation.value,
    imageDataUri: state.imageDataUri,
    orderEndpoint: ORDER_ENDPOINT,
  });
  const url = await deployToNetlify(html, `product-${Date.now()}.html`);
  await safeSend(chatId, `تم تجهيز صفحة المنتج:\n${url}`);
}

function begin(chatId) {
  const state = { step: 0 };
  userStates.set(chatId, state);
  return state;
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = normalizeText(msg.text, 240);

  if (text === '/start' || text === '/restart') {
    begin(chatId);
    await safeSend(chatId, 'مرحبًا. أرسل صورة المنتج للبدء.');
    return;
  }
  if (text === '/cancel') {
    userStates.delete(chatId);
    await safeSend(chatId, 'تم إلغاء العملية. أرسل /start للبدء من جديد.');
    return;
  }
  if (text === '/help') {
    await safeSend(chatId, 'الأوامر المتاحة:\n/start بدء صفحة جديدة\n/restart إعادة البدء\n/cancel إلغاء العملية');
    return;
  }

  const state = userStates.get(chatId) || begin(chatId);
  try {
    if (state.step === 0) {
      if (!msg.photo?.length) {
        await safeSend(chatId, 'أرسل صورة المنتج أولًا. يمكنك استخدام /cancel للإلغاء.');
        return;
      }
      state.imageDataUri = await getTelegramImageDataUri(msg.photo[msg.photo.length - 1].file_id);
      state.step = 1;
      await safeSend(chatId, 'ما اسم المنتج؟');
      return;
    }

    if (state.step === 1) {
      if (text.length < 2) {
        await safeSend(chatId, 'أدخل اسمًا واضحًا للمنتج.');
        return;
      }
      state.productName = text;
      state.step = 2;
      await safeSend(chatId, 'ما سعر المنتج بالدينار الجزائري؟');
      return;
    }

    if (state.step === 2) {
      const price = parsePrice(text);
      if (!price) {
        await safeSend(chatId, 'أدخل سعرًا موجبًا، مثل 180 أو 180.50.');
        return;
      }
      state.price = price;
      state.step = 3;
      await safeSend(chatId, 'ما العلامة التجارية؟');
      return;
    }

    if (state.step === 3) {
      if (text.length < 2) {
        await safeSend(chatId, 'أدخل اسمًا واضحًا للعلامة التجارية.');
        return;
      }
      state.brand = text;
      await completeProduct(chatId, state);
      userStates.delete(chatId);
    }
  } catch (error) {
    console.error('product_flow_failed', { chatId, step: state.step, message: error.message });
    userStates.delete(chatId);
    await safeSend(chatId, 'تعذر إكمال العملية. أرسل /start للمحاولة مرة أخرى.');
  }
}

console.log('Emballage bot is running.');
bot.startPolling(handleMessage).catch((error) => {
  console.error('telegram_polling_stopped', { message: error.message });
  process.exitCode = 1;
});
