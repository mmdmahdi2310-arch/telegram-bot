const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, { polling: true });

// دیتابیس ساده با JSON
let reminders = [];
if(fs.existsSync('reminders.json')) reminders = JSON.parse(fs.readFileSync('reminders.json'));

// دریافت پیام‌ها
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if(msg.text && msg.text.startsWith('/remind')){
    if(msg.reply_to_message){
      bot.sendMessage(chatId, "چند دقیقه بعد یادآوری شود؟");
      reminders.push({ 
        chat_id: chatId, 
        message_id: msg.reply_to_message.message_id, 
        text: msg.reply_to_message.text,
        remind_time: 0 
      });
      fs.writeFileSync('reminders.json', JSON.stringify(reminders));
    } else {
      bot.sendMessage(chatId, "لطفاً روی پیام ریپلای کنید و /remind بزنید.");
    }
  }
  else if(!isNaN(msg.text)){
    // آخرین یادآوری بدون زمان
    let last = reminders.reverse().find(r => r.remind_time === 0);
    if(last){
      last.remind_time = Date.now() + parseInt(msg.text) * 60 * 1000;
      fs.writeFileSync('reminders.json', JSON.stringify(reminders));
      bot.sendMessage(chatId, `یادآوری ثبت شد برای ${msg.text} دقیقه دیگر.`);
    }
  }
});

// بررسی زمان‌بندی یادآوری‌ها هر ثانیه
setInterval(() => {
  const now = Date.now();
  reminders.forEach((r, i) => {
    if(r.remind_time && r.remind_time <= now){
      bot.sendMessage(r.chat_id, `⏰ یادآوری: ${r.text}`, { reply_to_message_id: r.message_id });
      reminders.splice(i, 1);
      fs.writeFileSync('reminders.json', JSON.stringify(reminders));
    }
  });
}, 1000);
