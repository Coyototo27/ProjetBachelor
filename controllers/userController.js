const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {

  createUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('register', { errors: errors.array(), user: null });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = await User.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        password: hashedPassword
      });

      const tokenData = {
        userId: newUser.id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
      };

      const token = jwt.sign(tokenData, 'votre_secret', { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });

      res.status(201).render('home', { user: newUser });

      console.log(newUser)
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur.');
    }
  },

  login: async (req, res) => {
    try {

      const user = await User.findOne({ where: { email: req.body.email } });

      if (!user) {
        return res.status(401).render('login', { error: 'Adresse e-mail ou mot de passe incorrect.', user: null });
      }

      const verifyPassword = await bcrypt.compare(req.body.password, user.password);

      if (!verifyPassword) {
        return res.status(401).render('login', { error: 'Adresse e-mail ou mot de passe incorrect.', user: null });
      }

      const tokenData = {
        userId: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        admin : user.admin
      };
      const token = jwt.sign(tokenData, 'votre_secret', { expiresIn: '1h' });

      res.cookie('token', token, { httpOnly: true });

      res.status(201).render('home', { user: user });
      console.log(user, token);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la connexion.');
    }
  },

  logout: (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
  }

};

module.exports = userController;
