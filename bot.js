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
  const now = moment().tz('Asia/Almaty');
  const date = moment().tz(`${hour}:${minute}`, 'HH:mm', 'Asia/Almaty');

 if (date.isBefore(now)) {
    bot.sendMessage(chatId, `Далбаеб?`);
    return;
  }

  schedule.scheduleJob(date.toDate(), () => {
    bot.sendMessage(chatId, `⏰ ДАЛБАЕБ!!!: ${task}`);
  });

  bot.sendMessage(chatId, `✅ Окей далбаеб: в ${time} напомню — "${task}"`);
});
