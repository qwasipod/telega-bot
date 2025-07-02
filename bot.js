const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

const token = '8040376004:AAFM2iS5At9p4cqz_b7Wo57x_HCjdjDvnYc';
const bot = new TelegramBot(token, { polling: true });

const reminders = {};

bot.onText(/напомни в (\d{1,2}:\d{2}) (.+)/i, (msg, match) => {
  const chatId = msg.chat.id;
  const time = match[1];
  const task = match[2];

  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour -5, minute);

  if (date < now) {
    bot.sendMessage(chatId, `❌ Далбаеб?`);
    return;
  }

  schedule.scheduleJob(date, () => {
    bot.sendMessage(chatId, `🔔 НАПОМИНАНИЕ ДАЛБАЕБ: ${task}`);
  });

  bot.sendMessage(chatId, `✅ Напомню для тебя далбаеб в ${time}: "${task}"`);
});
