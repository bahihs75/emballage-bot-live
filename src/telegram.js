const API_TIMEOUT_MS = 35_000;
const POLL_TIMEOUT_SECONDS = 25;

class TelegramClient {
  constructor(token) {
    if (!token) throw new Error('Telegram token is required.');
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.running = false;
    this.offset = 0;
  }

  async request(method, payload = {}, timeoutMs = API_TIMEOUT_MS) {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) {
      throw new Error(`Telegram ${method} failed: ${result.description || response.status}`);
    }
    return result.result;
  }

  sendMessage(chatId, text, options = {}) {
    return this.request('sendMessage', { chat_id: chatId, text, ...options });
  }

  getFile(fileId) {
    return this.request('getFile', { file_id: fileId });
  }

  async startPolling(onMessage) {
    this.running = true;
    while (this.running) {
      try {
        const updates = await this.request('getUpdates', {
          offset: this.offset,
          timeout: POLL_TIMEOUT_SECONDS,
          allowed_updates: ['message'],
        });
        for (const update of updates) {
          this.offset = update.update_id + 1;
          if (update.message) await onMessage(update.message);
        }
      } catch (error) {
        console.error('telegram_polling_failed', { message: error.message });
        await new Promise((resolve) => setTimeout(resolve, 2_000));
      }
    }
  }

  stopPolling() {
    this.running = false;
  }
}

module.exports = { TelegramClient };
