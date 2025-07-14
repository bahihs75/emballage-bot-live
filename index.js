require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TOKEN_HERE';
const OWNER_USERNAME = '@bahi_has';
const bot = new TelegramBot(TOKEN, { polling: true });
// ... rest of your bot logic ...
