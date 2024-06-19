const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const OpenAI = require('openai');
const axios = require('axios')
const FormData = require('form-data');
const TelegramBot = require('node-telegram-bot-api');

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на ваш токен
const token = process.env.TG_BOT;

// Создание бота
const bot = new TelegramBot(token, {polling: true});

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API
});

function parseReplyText(text) {

  if (text) console.log(`Получил текст для парсинга
${text}
`)

  const replydata = {
    title: '',
    previewText: '',
    text: ''
  }

  const titleRegex = /#h#(.*?)#h#/s;
  const previewRegex = /#p#(.*?)#p#/s;
  const mainTextRegex = /#t#(.*?)#t#/s;

  const titleMatch = text.match(titleRegex);
  const previewMatch = text.match(previewRegex);
  const mainTextMatch = text.match(mainTextRegex);

  if (titleMatch) {
    replydata.title = titleMatch[1].trim();

  }
  if (previewMatch) {
    replydata.previewText = previewMatch[1].trim();
  }
  if (mainTextMatch) {
    replydata.text = mainTextMatch[1].trim();
  }

  console.log(`Отправляем данные парсинга ${JSON.stringify(replydata, null, 2)}`)
  return replydata;

}

async function sendRequestToContentWatch(generateText) {
  try {
    const form = new FormData();
    form.append('key', process.env.CONTENT_WATCH);
    form.append('action', 'CHECK_TEXT');
    form.append('text', generateText);

    // Используем async/await для ожидания выполнения запроса
    const response = await axios.post('https://content-watch.ru/public/api/', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('Response:', response.data);
    return response.data; // Корректно возвращаем данные
  } catch (error) {
    console.error('Error:', error.message);
    return null; // Возвращаем null или выбрасываем исключение, чтобы сигнализировать об ошибке выше по стеку вызовов
  }
}

async function sendRequestToOpenAI(originalText, params = {}) {
  console.log(`Получил текст:
   ${originalText}
  Отправляю в OpenAI с параметрами:
  ${JSON.stringify(params, null, 2)}`);

  // Формируем промпт с учетом параметров статьи
  const prompt = `
    Перепиши текст как новый, но сделай его на русском языке, текст должен содержать структуру Заголовок, Превью, основной текст новости.
    Пометь начало и конец заголовка символами '#h#', начало и конец превью '#p#', начало и конец основной новости '#t#'.
    Стиль текста: ${params.style || "Новостной"}
    Тон: ${params.tone || "Позитивный"}
    Язык: ${params.lang || "русский"}
    Степень: ${params.degree || "детальная"}
    Целевая аудитория: ${params.target || "бизнесмены"}
    Длина заголовка: ${params.headerLength || 3} слов
    Длина превью: ${params.previewLength || 30} слов
    Длина текста: ${params.textLength || 150} слов
    ${originalText}
  `;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: params.temperature || 0.7,
      messages: [{ "role": "user", "content": prompt }],
    });

    const replyText = chatCompletion.choices[0].message.content.trim();
    return parseReplyText(replyText);

  } catch (error) {
    console.error(`[Error] ${error}`);
  }
}

const publishTelegram = (chatId, title, content, imgURL, preview) => {
  // Объединяем заголовок и контент в подпись к изображению
  const caption = `<b>${title}</b>\n${preview}\n\n${content}`;

  bot.sendMessage(chatId, caption, {parse_mode: 'HTML'});
  // Отправляем фотографию с подписью
  // bot.sendPhoto(chatId, imgURL, {caption: caption, parse_mode: 'HTML'});
}

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        articleParams: true, // Включаем параметры статьи
        uniqueness: true, // Включаем детали уникальности статьи
        versions: {
          include: {
            params: true, // Включаем параметры каждой версии статьи
            uniqueness: true, // Включаем детали уникальности для каждой версии статьи
            publications: true,
          },
        },
        publications: true,
      },
    });
    res.json(articles);
  } catch (error) {
    console.error("Ошибка при получении списка статей: ", error);
    res.status(500).send(error.message);
  }
};


exports.getAllSources = async (req, res) => {
  try {
    const sources = await prisma.source.findMany({
      include: {
        publications: true, // Включаем связанные публикации, если нужно
      },
    });
    res.json(sources);
  } catch (error) {
    console.error("Ошибка при получении списка источников: ", error);
    res.status(500).send(error.message);
  }
};



// Получение статьи по ID

exports.getArticleById = async (req, res) => {
  const { id } = req.params;
  const { publishSource, sourceId } = req.query;

  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
      include: {
        articleParams: true,
        uniqueness: true,
        versions: {
          include: {
            params: true,
            uniqueness: true,
            publications: true,
          },
        },
        publications: true,
      },
    });

    if (!article) {
      return res.status(404).send('Article not found');
    }
    

    if (publishSource && publishSource.startsWith('@') && sourceId) {
      
      publishTelegram(publishSource, article.title, article.text, `http://localhost:3001/${article.imageUrl}`, article.previewText);
      
      const publication = await prisma.publication.create({
        data: {
          sourceId: parseInt(sourceId), // Преобразование sourceId в число
          articleId: parseInt(id), // Использование id статьи
          // Удалить или исправить articleVersionId, если необходимо
          date: new Date(),
        },
      });

      return res.json(publication);
    }

    res.json(article);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getArticleVersionById = async (req, res) => {
  const { id } = req.params; // Получаем id версии статьи из параметров запроса
  const { publishSource } = req.query;
  try {
    
    
      // Пытаемся найти версию статьи по id
      const articleVersion = await prisma.articleVersion.findUnique({
          where: { id: parseInt(id) },
          include: {
              article: true, // Включаем данные основной статьи
              params: true, // Включаем параметры версии статьи
              uniqueness: true, // Включаем данные о уникальности версии статьи
          },
      });

      switch(publishSource){
        case '@GSL_news_ru':
        publishTelegram(publishSource, articleVersion.article.title, articleVersion.article.text, `http://localhost:3001/${articleVersion.imageUrl}`, articleVersion.article.previewText)
        console.log( articleVersion.imageUrl)  
        break;
      }

      // Если версия статьи найдена, отправляем её клиенту
      if (articleVersion) {
          res.json(articleVersion);
      } else {
          // Если версия статьи не найдена, отправляем сообщение об ошибке
          res.status(404).send('Article version not found');
      }
  } catch (error) {
      // В случае исключения отправляем сообщение об ошибке с текстом исключения
      res.status(500).send(error.message);
  }
};


exports.createArticle = async (req, res) => {
  const { originalText } = req.body;
  try {
    // Создание статьи с пустыми параметрами уникальности
    const newArticle = await prisma.article.create({
      data: {
        title: '',
        originalText: originalText,
        previewText: '',
        text: '',
        imageUrl: '',
        articleParams: {
          create: {
            style: "bloomberg",
            tone: "analytical",
            lang: "ru",
            degree: "general",
            target: "general-public",
            headerLength: 3,
            previewLength: 15,
            textLength: 150,
            perspective: 3,
            paragraph: 5,
            temperature: 0.7,
            quotesInDirectSpeech: false,
            engTranslateExpr: false,
          },
        },
      },
      include: {
        articleParams: true,
      },
    });

    const defaultParams = {
      style: "bloomberg",
      tone: "analytical",
      lang: "ru",
      degree: "general",
      target: "general-public",
      headerLength: 3,
      previewLength: 15,
      textLength: 150,
      perspective: 3,
      paragraph: 5,
      temperature: 0.7,
      quotesInDirectSpeech: false,
      engTranslateExpr: false,
    };

    const generatedData = await sendRequestToOpenAI(originalText, defaultParams);
    const generateUniqData = await sendRequestToContentWatch(generatedData.text);
    console.log(generateUniqData);

    // Обновляем статью с новыми данными и добавляем UniquenessDetail
    const updatedArticle = await prisma.article.update({
      where: { id: newArticle.id },
      data: {
        title: generatedData.title,
        previewText: generatedData.previewText,
        text: generatedData.text,
        uniqueness: {
          create: {
            percent: parseFloat(generateUniqData.percent),
            highlight: JSON.stringify(generateUniqData.highlight), // Предполагая, что это массив или объект
            matches: JSON.stringify(generateUniqData.matches), 
          },
        },
      },
      include: {
        articleParams: true,
        uniqueness: true,
      },
    });

    console.log("Статья обновлена", updatedArticle);

    // Возвращаем обновленную статью в ответе
    res.status(201).json(updatedArticle);
  } catch (error) {
    console.error("Ошибка при создании/обновлении статьи: ", error);
    res.status(500).send(error.message);
  }
};



exports.createArticleVersion = async (req, res) => {
  const { id } = req.params; // ID оригинальной статьи
  const { originalText, ...params } = req.body;

  try {
    // Создание версии статьи без деталей уникальности
    const newVersion = await prisma.articleVersion.create({
      data: {
        articleId: parseInt(id),
        originalText: originalText,
        title: '',
        previewText: '',
        text: '',
        imageUrl: '',
        // Пока не указываем uniqueness, поскольку детали будут добавлены позже
        params: {
          create: { ...params },
        },
      },
      include: {
        params: true, // Включаем параметры версии статьи в ответ
      },
    });

    // Генерация контента и данных уникальности для версии статьи
    const generatedData = await sendRequestToOpenAI(originalText, params);
    const generateUniqData = await sendRequestToContentWatch(generatedData.text);
    console.log(generateUniqData);

    // Проверка и преобразование данных уникальности
    if (!generateUniqData || generateUniqData.percent === undefined) {
      throw new Error('Данные о уникальности не получены или некорректны');
    }

    // Обновление версии статьи с сгенерированным контентом и деталями уникальности
    const updatedVersion = await prisma.articleVersion.update({
      where: { id: newVersion.id },
      data: {
        title: generatedData.title,
        previewText: generatedData.previewText,
        text: generatedData.text,
        uniqueness: {
          create: {
            percent: parseFloat(generateUniqData.percent),
            highlight: JSON.stringify(generateUniqData.highlight), // Предполагая, что это массив или объект
            matches: JSON.stringify(generateUniqData.matches), // Также предполагая, что это структурированные данные
          },
        },
      },
      include: {
        params: true, // Снова включаем параметры версии статьи
        uniqueness: true, // Включаем детали уникальности в ответ
      },
    });

    console.log("Версия статьи создана и обновлена", updatedVersion);
    res.status(201).json(updatedVersion);
  } catch (error) {
    console.error("Ошибка при создании версии статьи: ", error);
    res.status(500).send(error.message);
  }
};


// Обновление статьи
exports.updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, originalText, previewText, text, imageUrl, uniqueness } = req.body;
  try {
    const updatedArticle = await prisma.article.update({
      where: { id: parseInt(id) },
      data: { title, originalText, previewText, text, imageUrl, uniqueness },
    });
    res.json(updatedArticle);
  } catch (error) {
    res.status(404).send('Article not found');
  }
};

// Удаление статьи
exports.deleteArticle = async (req, res) => {
  const { id } = req.params;
  const articleId = parseInt(id);

  try {
    // Опционально: удаление связанных данных, например, версий статьи
    await prisma.articleVersion.deleteMany({
      where: { articleId: articleId },
    });

    // Опционально: удаление связанных данных о уникальности
    await prisma.uniquenessDetail.deleteMany({
      where: { articleId: articleId },
    });

    // После удаления всех связанных записей, можно безопасно удалить статью
    await prisma.article.delete({
      where: { id: articleId },
    });

    res.status(204).send(); // Успешное удаление без возврата содержимого
  } catch (error) {
    console.error("Ошибка при удалении статьи:", error);
    res.status(500).send('Error deleting article');
  }
};
