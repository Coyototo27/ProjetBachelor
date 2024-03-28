// routes/index.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const levelController = require('../controllers/levelController');
const trickController = require('../controllers/trickController');
const statController = require('../controllers/statController');

const upload = require('../middleware/configMutler'); // Importez votre configuration multer

const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

router.get('/', verifyToken, (req, res) => {
  res.render('home', { user: req.user });
});

router.get('/play', verifyToken, levelController.getPlay);

router.post('/play', verifyToken, trickController.trickRandom);

router.post('/play/:statId/failure', verifyToken, trickController.trickFailure);

router.post('/play/:statId/success', verifyToken, trickController.trickSuccess);

module.exports = router;
