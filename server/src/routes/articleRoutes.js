const express = require('express');
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  createArticleVersion,
  updateArticleVersion,
  getArticleVersionById,
  getAllSources,
  checkUniquenessById,
  deleteArticleVersion,
  checkUniquenessForVersionById,
} = require('../controllers/articlesController');

const router = express.Router();

router.get('/', getAllArticles);
router.get('/uniq/:id', checkUniquenessById);
router.get('/versions/uniq/:id', checkUniquenessForVersionById);
router.get('/:id', getArticleById);
router.get('/versions/:id', getArticleVersionById);
router.put('/versions/:id', updateArticleVersion);
router.delete('/versions/:id', deleteArticleVersion);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.post('/:id/versions', createArticleVersion);
router.get('/publicate/sources', getAllSources);
// router.get('/publish', getArticleOrVersionData);

module.exports = router;
