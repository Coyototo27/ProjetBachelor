const User = require('../models/user');
const Trick = require('../models/trick');

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
        admin: user.admin
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
  },

  getAllUser: async (req, res) => {
    try {
      const user = await User.findAll({ where: { admin: 0 }, raw: true });
      console.log(user);
      res.status(201).render('listUser', { user: req.user, users: user });
    } catch (error) {
      console.error(error);
    }

  },

  getUserById: async (req, res) => {
    try {
      const userDetails = await User.findByPk(req.params.userId, { raw: true });
      console.log(userDetails);
      res.render('detailUser', { user: req.user, userDetails: userDetails });
    } catch (error) {
      console.error(error);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.userId);
      const admin = await User.findOne({ where: { admin: 1 }, raw: true });
      const trick = await Trick.update({ id_user: admin.id }, { where: { id_user: req.params.userId }, raw: true });
      console.log(trick);
      await user.destroy();
      res.redirect('/');
    } catch (error) {
      console.error(error);
    }
  },

  updateUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('myaccount', { errors: errors.array(), user: req.user });
      }
      const userId = req.user.userId;

      console.log(userId, req.body.nomUser, req.body.prenomUser, req.body.emailUser);
      const userToUpdate = await User.findByPk(userId);
      console.log(userToUpdate);
        if (!userToUpdate) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        userToUpdate.nom = req.body.nomUser;
        userToUpdate.prenom = req.body.prenomUser;
        userToUpdate.email = req.body.emailUser;

        await userToUpdate.save();

        console.log("Utilisateur mis à jour :", userToUpdate);

        const tokenData = {
          userId: userToUpdate.id,
          nom: userToUpdate.nom,
          prenom: userToUpdate.prenom,
          email: userToUpdate.email,
          admin: userToUpdate.admin
          // Ajoutez d'autres données d'utilisateur au besoin
      };

      const token = jwt.sign(tokenData, 'votre_secret', { expiresIn: '1h' }); // Vous pouvez ajuster l'expiration selon vos besoins

      res.clearCookie('token');

      // Envoyer le nouveau token dans la réponse
      res.cookie('token', token, { httpOnly: true }); // ou res.send({ token });

      res.status(201).redirect('/');

      
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de l\'enregistrement de la l\'utilisateur.');
    }
  },

};

module.exports = userController;
