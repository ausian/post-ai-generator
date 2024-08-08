const TelegramBot = require('node-telegram-bot-api');

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на ваш токен
const token = process.env.TG_BOT;

// Создание бота
const bot = new TelegramBot(token, {polling: true});

// Функция для публикации статьи в канал
// Замените 'YOUR_CHANNEL_NAME' на имя вашего канала (например, @my_channel)
function publishArticle(article) {
  const chatId = '@GSL_news_ru';
  const {title, content} = article;
  const message = `<b>${title}</b>\n\n${content}`;

  bot.sendMessage(chatId, message, {parse_mode: 'HTML'});
}

// Пример использования
const article = {
  title: 'Заголовок статьи',
  content: 'Содержание статьи...'
};

publishArticle(article);
