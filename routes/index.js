// routes/index.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const levelController = require('../controllers/levelController');
const trickController = require('../controllers/trickController');
const upload = require('../middleware/configMutler'); // Importez votre configuration multer

const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');




router.get('/', verifyToken, (req, res) => {
  res.render('home', { user: req.user });
});


router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

router.post('/login', userController.login);

router.get('/register', (req, res) => {
  res.render('register', { user: req.user });
});

router.post('/register', [
  body('nom').notEmpty().withMessage('Le nom est requis').isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
  body('prenom').notEmpty().withMessage('Le prénom est requis').isLength({ max: 50 }).withMessage('Le prénom ne doit pas dépasser 50 caractères'),
  body('email').trim().isEmail().withMessage('Adresse e-mail invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre'),
  body('password_confirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    return true;
  })
], userController.createUser);

router.post('/logout', userController.logout);

router.get('/trickform', verifyToken, levelController.getAllLevel);

router.post('/trickform', verifyToken, upload.single('image'),[
  
  body('nomFigure').notEmpty().withMessage('Un nom est requis').isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
  body('description').notEmpty().withMessage('Une description est requise').isLength({ max: 250 }).withMessage('La description ne doit pas dépasser 250 caractères')
], trickController.createTrick);

router.get('/list-proposition', verifyToken,verifyAdmin, trickController.getAllTrickWait);

router.get('/list-proposition/detail/:trickId',verifyToken,verifyAdmin, trickController.getTrickDetails);

router.post('/list-proposition/detail/:trickId/delete', verifyToken, verifyAdmin, trickController.deleteTrick);

router.post('/list-proposition/detail/:trickId/confirm', verifyToken, verifyAdmin, trickController.confirmTrick);

router.get('/list-figure', verifyToken,verifyAdmin, trickController.getAllTrick);

router.post('/list-figure/:trickId/delete', verifyToken, verifyAdmin, trickController.deleteTrick);

router.get('/list-figure/:trickId', verifyToken, verifyAdmin, trickController.getTrickById);

router.post('/list-figure/:trickId/update', verifyToken, verifyAdmin, upload.single('image'),[
  
  body('nomFigure').notEmpty().withMessage('Un nom est requis').isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
  body('description').notEmpty().withMessage('Une description est requise').isLength({ max: 250 }).withMessage('La description ne doit pas dépasser 250 caractères')
], trickController.updateTrick);







module.exports = router;