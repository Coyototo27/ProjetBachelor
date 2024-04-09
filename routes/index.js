// routes pricipale
const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');
const trickController = require('../controllers/trickController');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, (req, res) => {
  res.render('home', { user: req.user });
});

router.get('/play', verifyToken, levelController.getPlay);

router.post('/play', verifyToken, trickController.trickRandom);

router.post('/play/:statId/failure', verifyToken, trickController.trickFailure);

router.post('/play/:statId/success', verifyToken, trickController.trickSuccess);

module.exports = router;
