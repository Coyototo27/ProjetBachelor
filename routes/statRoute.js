//route qui concerne les statiste des figures de l'utilisateur
const express = require('express');
const router = express.Router();
const statController = require('../controllers/statController');

const verifyToken = require('../middleware/verifyToken');

router.get('/mes-stats', verifyToken, statController.GetStats);

router.get('/mes-stats/:trickId', verifyToken, statController.GetStatById);

router.post('/mes-stats/:trickId/reset', verifyToken, statController.resetStatById);

module.exports = router;