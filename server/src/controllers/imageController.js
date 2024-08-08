const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API
});

// Функция для загрузки и сохранения изображения из URL
async function downloadImage(url, filePath) {
  const response = await axios({
    url,
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filePath))
      .on('finish', () => resolve(filePath))
      .on('error', e => reject(e));
  });
}

exports.uploadImage = async (req, res) => {
  const { articleId, articleVersionId, generateImage } = req.body;
console.log('✌️req.body --->', req.body);

  

  try {
    let textForImage = '  - это тема, а Ты — специалист по графическому дизайну :: Создай иллюстрацию для карточки блога на основе темы :: формат горизонатльный :: Основные акценты: минимализм, синий, белый '; // Текст для генерации изображения

    // Если требуется генерация изображения
    if (generateImage) {
      // Если задан ID версии статьи
      if (articleVersionId && articleVersionId !== 'null') {
        const version = await prisma.articleVersion.findUnique({
          where: { id: parseInt(articleVersionId) },
        });
        textForImage += version.title;
      }
      // Если задан ID статьи
      else if (articleId) {
        const article = await prisma.article.findUnique({
          where: { id: parseInt(articleId) },
        });
        textForImage = article.title + textForImage;
      }

      // Генерация изображения с помощью DALL·E
      if (textForImage) {
        console.log('Generating image for text:', textForImage);
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: textForImage,
          n: 1,
          size: "1792x1024",
          style: 'vivid',
        });
        const imageUrl = response.data[0].url;
       

        // Определение пути для сохранения изображения
        const fileName = `image-${Date.now()}.png`;
        const filePath = path.join(__dirname, '../../uploads', fileName);

        // Загрузка и сохранение изображения
        await downloadImage(imageUrl, filePath);

        // Обновление записи в базе данных с путем к локальному изображению
        let updatedRecord;
        if (articleVersionId && articleVersionId !== 'null') {
          updatedRecord = await prisma.articleVersion.update({
            where: { id: parseInt(articleVersionId) },
            data: { imageUrl: `/uploads/${fileName}` },
          });
        } else if (articleId) {
          updatedRecord = await prisma.article.update({
            where: { id: parseInt(articleId) },
            data: { imageUrl: `/uploads/${fileName}` },
          });
        }

        return res.send({ message: "Изображение успешно сгенерировано и сохранено", details: updatedRecord });
      }
    } else {
      // Логика обработки ситуации, когда файл передан напрямую
      if (!req.file) {
        return res.status(400).send({ message: "Файл не найден" });
      }

      // Извлекаем имя файла из полного пути
      const fileName = path.basename(req.file.path);

      let updatedRecord;

      if (articleVersionId && articleVersionId !== 'null') {
        updatedRecord = await prisma.articleVersion.update({
          where: { id: parseInt(articleVersionId) },
          data: { imageUrl: `/uploads/${fileName}` },
        });
      } else if (articleId) {
        updatedRecord = await prisma.article.update({
          where: { id: parseInt(articleId) },
          data: { imageUrl: `/uploads/${fileName}` },
        });
      } else {
        return res.status(400).send({ message: "Необходим идентификатор статьи или версии статьи" });
      }

      return res.send({ message: "Изображение успешно загружено", details: updatedRecord });
    }
  } catch (error) {
    console.error("Ошибка при сохранении изображения: ", error);
    res.status(500).send({ message: "Ошибка при сохранении изображения", error: error.message });
  }
};
