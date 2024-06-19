const express = require('express');
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  createArticleVersion,
  // getArticleOrVersionData
  getArticleVersionById,
  getAllSources
} = require('../controllers/articlesController');

const router = express.Router();

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.get('/versions/:id', getArticleVersionById);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.post('/:id/versions', createArticleVersion);
router.get('/publicate/sources', getAllSources);
// router.get('/publish', getArticleOrVersionData);

module.exports = router;
