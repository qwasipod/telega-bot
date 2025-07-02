const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

const reminders = {};

bot.onText(/напомни в (\d{1,2}:\d{2}) (.+)/i, (msg, match) => {
  const chatId = msg.chat.id;
  const time = match[1];
  const task = match[2];

  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

  if (date < now) {
    bot.sendMessage(chatId, `❌ Время уже прошло! Укажи будущее время.`);
    return;
  }

  schedule.scheduleJob(date, () => {
    bot.sendMessage(chatId, `🔔 Напоминание: ${task}`);
  });

  bot.sendMessage(chatId, `✅ Напомню в ${time}: "${task}"`);
});
