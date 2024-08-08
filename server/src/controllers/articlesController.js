const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const OpenAI = require('openai');
const axios = require('axios')
const FormData = require('form-data');
const TelegramBot = require('node-telegram-bot-api');

const apiURL = process.env.API_URL;

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

// Обновленная функция sendRequestToOpenAI для приема дополнительных параметров
async function sendRequestToOpenAI(originalText, params = {}) {
  let { initialContextTemplate, promptTemplate } = params;
console.log('✌️promptTemplate --->', promptTemplate);
console.log('✌️initialContextTemplate --->', initialContextTemplate);

  // Проверяем и модифицируем initialContextTemplate, если он передан
  initialContextTemplate = initialContextTemplate
    ? ` ${initialContextTemplate} Текст должен содержать следующие части:
      - Заголовок (обозначить начало и конец символами '#h#')
      - Превью (обозначить начало и конец символами '#p#')
      - Основной текст новости (обозначить начало и конец символами '#t#')
      Пример структуры:
      #h# Это пример заголовка #h#
      #p# Это пример превью текста, который должен быть переписан. Он обычно содержит краткое описание статьи. #p#
      #t# Это основной текст новости. Здесь должно быть больше деталей и информации по теме. #t#`
    : `
      Ты человек, который говорит в стиле ${params.style || "Новостной"} с тоном ${params.tone || "Позитивный"} на языке ${params.lang || "русский"} со степенью детализации ${params.degree || "детальная"}.
      Пожалуйста, перепиши текст как новый на русском языке. Текст должен содержать следующие части:
      - Заголовок (обозначить начало и конец символами '#h#')
      - Превью (обозначить начало и конец символами '#p#')
      - Основной текст новости (обозначить начало и конец символами '#t#')

      Параметры длины:
      - Заголовок: ${params.headerLength || 3} слов
      - Превью: ${params.previewLength || 30} слов
      - Основной текст: ${params.textLength || 150} слов

      Пример структуры:
      #h# Это пример заголовка #h#
      #p# Это пример превью текста, который должен быть переписан. Он обычно содержит краткое описание статьи. #p#
      #t# Это основной текст новости. Здесь должно быть больше деталей и информации по теме. #t#
    `;

  const initialContext = initialContextTemplate;

  const prompt = promptTemplate || `Мой текст: ${originalText}`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      temperature: params.temperature || 0.5,
      messages: [
        {role: "system", content: initialContext},
        {role: "user", content: prompt}
      ],
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
      
      publishTelegram(publishSource, article.title, article.text, `${apiURL}/${article.imageUrl}`, article.previewText);
      
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
        publishTelegram(publishSource, articleVersion.article.title, articleVersion.article.text, `${apiURL}/${articleVersion.imageUrl}`, articleVersion.article.previewText)
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
// Новый контроллер для получения уникальности текста статьи по ID
exports.checkUniquenessById = async (req, res) => {
  const { id } = req.params;

  try {
    // Получение статьи по ID
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
    });

    if (!article) {
      return res.status(404).send('Article not found');
    }

    // Отправка запроса на Content Watch для проверки уникальности текста
    const uniquenessData = await sendRequestToContentWatch(article.text);

    if (!uniquenessData) {
      return res.status(500).send('Error checking uniqueness');
    }

    // Обновление данных уникальности в базе данных
    const updatedArticle = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        uniqueness: {
          create: {
            percent: parseFloat(uniquenessData.percent),
            highlight: JSON.stringify(uniquenessData.highlight),
            matches: JSON.stringify(uniquenessData.matches),
          },
        },
      },
      include: {
        uniqueness: true,
      },
    });

    console.log("Уникальность статьи обновлена", updatedArticle);
    res.json(updatedArticle);
  } catch (error) {
    console.error("Ошибка при проверке уникальности статьи: ", error);
    res.status(500).send(error.message);
  }
};

// Новый контроллер для получения уникальности версии статьи по ID
exports.checkUniquenessForVersionById = async (req, res) => {
  const { id } = req.params; // Получаем id версии статьи из параметров запроса

  try {
    // Пытаемся найти версию статьи по id
    const articleVersion = await prisma.articleVersion.findUnique({
      where: { id: parseInt(id) },
      include: {
        params: true, // Включаем параметры версии статьи
        uniqueness: true, // Включаем данные о уникальности версии статьи
      },
    });

    if (!articleVersion) {
      return res.status(404).send('Article version not found');
    }

    // Отправка запроса на Content Watch для проверки уникальности текста версии статьи
    const uniquenessData = await sendRequestToContentWatch(articleVersion.text);

    if (!uniquenessData) {
      return res.status(500).send('Error checking uniqueness');
    }

    // Обновление данных уникальности в базе данных
    const updatedVersion = await prisma.articleVersion.update({
      where: { id: parseInt(id) },
      data: {
        uniqueness: {
          create: {
            percent: parseFloat(uniquenessData.percent),
            highlight: JSON.stringify(uniquenessData.highlight),
            matches: JSON.stringify(uniquenessData.matches),
          },
        },
      },
      include: {
        uniqueness: true,
      },
    });

    console.log("Уникальность версии статьи обновлена", updatedVersion);
    res.json(updatedVersion);
  } catch (error) {
    console.error("Ошибка при проверке уникальности версии статьи: ", error);
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
            target: "",
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
      target: "",
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
  const { originalText, initialContextTemplate, promptTemplate, uniqSwitch, ...params } = req.body;
  console.log('✌️uniqSwitch --->', uniqSwitch);

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
        params: {
          create: {
            initialContextTemplate, // Новое поле
            promptTemplate,         // Новое поле
            ...params,
          },
        },
      },
      include: {
        params: true, // Включаем параметры версии статьи в ответ
      },
    });

    // Генерация контента для версии статьи
    const generatedData = await sendRequestToOpenAI(originalText, {
      ...params,
      initialContextTemplate,
      promptTemplate,
    });

    // Переменная для данных уникальности
    let uniquenessData = null;

    // Проверяем уникальность только если uniqSwitch включен
    if (uniqSwitch) {
      const generateUniqData = await sendRequestToContentWatch(generatedData.text);
      console.log(generateUniqData);

      // Проверка и преобразование данных уникальности
      if (!generateUniqData || generateUniqData.percent === undefined) {
        throw new Error('Данные о уникальности не получены или некорректны');
      }

      uniquenessData = {
        create: {
          percent: parseFloat(generateUniqData.percent),
          highlight: JSON.stringify(generateUniqData.highlight),
          matches: JSON.stringify(generateUniqData.matches),
        },
      };
    } else {
      // Обеспечиваем создание пустой записи, когда уникальность не проверяется
      uniquenessData = {
        create: {
          percent: 0,
          highlight: '[]',
          matches: '[]',
        },
      };
    }

    // Обновление версии статьи с сгенерированным контентом и деталями уникальности (если есть)
    const updatedVersion = await prisma.articleVersion.update({
      where: { id: newVersion.id },
      data: {
        title: generatedData.title,
        previewText: generatedData.previewText,
        text: generatedData.text,
        uniqueness: uniquenessData,
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

// Обновление версии статьи
exports.updateArticleVersion = async (req, res) => {
  const { id } = req.params; // Получаем id версии статьи из параметров запроса
  const { title, originalText, previewText, text, imageUrl, uniqueness, params } = req.body;

  try {
    // Обновляем параметры версии статьи
    const updatedVersion = await prisma.articleVersion.update({
      where: { id: parseInt(id) },
      data: {
        title,
        originalText,
        previewText,
        text,
        imageUrl,
        params: {
          update: { ...params },
        },
        uniqueness: uniqueness ? {
          update: {
            percent: parseFloat(uniqueness.percent),
            highlight: JSON.stringify(uniqueness.highlight), // Предполагая, что это массив или объект
            matches: JSON.stringify(uniqueness.matches), // Также предполагая, что это структурированные данные
          },
        } : undefined,
      },
      include: {
        params: true, // Включаем параметры версии статьи
        uniqueness: true, // Включаем детали уникальности в ответ
      },
    });

    console.log("Версия статьи обновлена", updatedVersion);
    res.json(updatedVersion);
  } catch (error) {
    console.error("Ошибка при обновлении версии статьи: ", error);
    res.status(500).send(error.message);
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

// Удаление версии статьи
exports.deleteArticleVersion = async (req, res) => {
  const { id } = req.params;
  const articleVersionId = parseInt(id);

  try {
    // Удаляем версию статьи по её ID
    await prisma.articleVersion.delete({
      where: { id: articleVersionId },
    });

    res.status(204).send(); // Успешное удаление без возврата содержимого
  } catch (error) {
    console.error("Ошибка при удалении версии статьи:", error);
    res.status(500).send('Error deleting article version');
  }
};
