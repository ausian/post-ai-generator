const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');



// Функция для добавления нового стиля
exports.addStyle = async (req, res) => {
  const { name } = req.body;
  console.log('✌️req.body --->', req.body);

  try {
    const newStyle = await prisma.style.create({
      data: {
        name: name,
      },
    });

    return res.status(201).send({ message: "Стиль успешно добавлен", details: newStyle });
  } catch (error) {
    console.error("Ошибка при добавлении стиля: ", error);
    res.status(500).send({ message: "Ошибка при добавлении стиля", error: error.message });
  }
};

// Функция для получения всех стилей
exports.getStyles = async (req, res) => {
  try {
    const styles = await prisma.style.findMany();
    res.status(200).send(styles);
  } catch (error) {
    console.error("Ошибка при получении стилей: ", error);
    res.status(500).send({ message: "Ошибка при получении стилей", error: error.message });
  }
};

// Функция для удаления стиля
exports.deleteStyle = async (req, res) => {
  const { id } = req.params;
  console.log('✌️req.params --->', req.params);

  try {
    await prisma.style.delete({
      where: { id: parseInt(id) },
    });

    return res.status(204).send({ message: "Стиль успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении стиля: ", error);
    res.status(500).send({ message: "Ошибка при удалении стиля", error: error.message });
  }
};


