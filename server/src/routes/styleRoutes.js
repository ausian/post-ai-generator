const express = require('express');
const { addStyle, getStyles, deleteStyle } = require('../controllers/styleController');


const router = express.Router();


// Пример использования контроллеров в маршрутах
router.post('/', addStyle);
router.get('/', getStyles);
router.delete('/:id', deleteStyle);

module.exports = router;
