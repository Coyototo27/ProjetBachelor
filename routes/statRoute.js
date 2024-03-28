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

router.get('/mes-stats', verifyToken, statController.GetStats);

router.get('/mes-stats/:trickId', verifyToken, statController.GetStatById);

router.post('/mes-stats/:trickId/reset', verifyToken, statController.resetStatById);

module.exports = router;