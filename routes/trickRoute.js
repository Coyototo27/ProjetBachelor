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

router.get('/trickform', verifyToken, levelController.getAllLevel);

router.post('/trickform', verifyToken, upload.single('image'),[
  
  body('nomFigure').notEmpty().withMessage('Un nom est requis').isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
  body('description').notEmpty().withMessage('Une description est requise').isLength({ max: 250 }).withMessage('La description ne doit pas dépasser 250 caractères')
], trickController.createTrick);

router.get('/list-proposition', verifyToken,verifyAdmin, trickController.getAllTrickWait);

router.get('/list-proposition/detail/:trickId',verifyToken,verifyAdmin, trickController.getTrickDetails);

router.post('/list-proposition/detail/:trickId/delete', verifyToken, verifyAdmin, trickController.refuseTrick);

router.post('/list-proposition/detail/:trickId/confirm', verifyToken, verifyAdmin, trickController.confirmTrick);

router.post('/my-trick/:trickId/delete', verifyToken, trickController.deleteMyTrick);

router.get('/list-figure', verifyToken,verifyAdmin, trickController.getAllTrick);

router.post('/list-figure/:trickId/delete', verifyToken, verifyAdmin, trickController.deleteTrick);

router.get('/list-figure/:trickId', verifyToken, verifyAdmin, trickController.getTrickById);

router.post('/list-figure/:trickId/update', verifyToken, verifyAdmin, upload.single('image'),[
  
  body('nomFigure').notEmpty().withMessage('Un nom est requis').isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
  body('description').notEmpty().withMessage('Une description est requise').isLength({ max: 250 }).withMessage('La description ne doit pas dépasser 250 caractères')
], trickController.updateTrick);

module.exports = router;