//route qui concerne les utilisateurs
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const statController = require('../controllers/statController');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

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
    body('email').trim().isEmail().withMessage('Adresse e-mail invalide'),
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

router.get('/my-account', verifyToken, userController.getAccount);

router.post('/my-account/update', verifyToken, [

    body('nomUser').notEmpty().withMessage('Le nom est requis').isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
    body('prenomUser').notEmpty().withMessage('Le prénom est requis').isLength({ max: 50 }).withMessage('Le prénom ne doit pas dépasser 50 caractères'),
    body('emailUser').trim().isEmail().withMessage('Adresse e-mail invalide'),
], userController.updateUser);

router.post('/my-account/delete', verifyToken, userController.deleteAccount);

router.get('/list-user', verifyToken, verifyAdmin, userController.getAllUser);

router.post('/list-user/:userId/delete', verifyToken, verifyAdmin, userController.deleteUser);

router.get('/list-user/:userId', verifyToken, verifyAdmin, userController.getUserById);

router.get('/list-user/:userId/:trickId', verifyToken, verifyAdmin, statController.getStatUserById);

module.exports = router;