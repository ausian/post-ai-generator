const express = require('express');
const articleRoutes = require('./routes/articleRoutes');
const imageRoutes = require('./routes/imageRoutes');
const styleRoutes = require('./routes/styleRoutes')
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/articles', articleRoutes);
app.use('/images', imageRoutes);
// Предоставляем статический доступ к папке uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/styles', styleRoutes);

module.exports = app;
