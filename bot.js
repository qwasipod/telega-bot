
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const fs = require('fs');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });
const REMINDERS_FILE = 'reminders.json';

function loadReminders() {
  if (fs.existsSync(REMINDERS_FILE)) {
    const data = fs.readFileSync(REMINDERS_FILE);
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Ошибка при чтении reminders.json:", e);
    }
  }
  return [];
}

function saveReminders(reminders) {
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
}

function scheduleReminder(chatId, time, task, save = true) {
  const now = moment().tz('Asia/Almaty');
  const date = moment.tz(time, 'HH:mm', 'Asia/Almaty');
  if (date.isBefore(now)) date.add(1, 'day');

  schedule.scheduleJob(date.toDate(), () => {
    bot.sendMessage(chatId, `🔔 Напоминание: ${task}`);
    let reminders = loadReminders().filter(r =>
      !(r.chatId === chatId && r.time === time && r.task === task)
    );
    saveReminders(reminders);
  });

  if (save) {
    const reminders = loadReminders();
    reminders.push({ chatId, time, task });
    saveReminders(reminders);
  }
}

bot.on('message', (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const regex = /напомни в (\d{1,2}:\d{2}) (.+)/i;
  const match = text.match(regex);

  if (!match) return;

  const time = match[1];
  const task = match[2];

  const now = moment().tz('Asia/Almaty');
  const date = moment.tz(time, 'HH:mm', 'Asia/Almaty');
  if (date.isBefore(now)) {
    bot.sendMessage(chatId, '⛔ Время уже прошло. Укажи будущее.');
    return;
  }

  scheduleReminder(chatId, time, task);
  bot.sendMessage(chatId, `✅ Напомню в ${time}: "${task}"`);
});

const saved = loadReminders();
saved.forEach(r => {
  scheduleReminder(r.chatId, r.time, r.task, false);
});
