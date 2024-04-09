const User = require('../models/user');
const Trick = require('../models/trick');
const Stat = require('../models/stat');
const Level = require('../models/level');
const { Op } = require('sequelize');




const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {

  createUser: async (req, res) => {
    //fonction pour créer un utilisateur
    try {
      //condition si il y a une erreur dans le formulaire
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('register', { errors: errors.array(), user: null });
      }

      //on hashe le mot de passe
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = await User.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        password: hashedPassword
      });

      //données du tokenJWT
      const tokenData = {
        userId: newUser.id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
      };

      //on créé et stock le tokenJWT
      const token = jwt.sign(tokenData, 'votre_secret', { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });

      res.status(201).redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur.');
    }
  },

  login: async (req, res) => {
    //fonciton pour se connecter
    try {
      const user = await User.findOne({ where: { email: req.body.email } });

      //condition si aucun utilisateur existe
      if (!user) {
        return res.status(401).render('login', { error: 'Adresse e-mail ou mot de passe incorrect.', user: null });
      }

      //on vérifie le mot de passe en le comparant
      const verifyPassword = await bcrypt.compare(req.body.password, user.password);

      if (!verifyPassword) {
        return res.status(401).render('login', { error: 'Adresse e-mail ou mot de passe incorrect.', user: null });
      }

      //données du tokenJWT
      const tokenData = {
        userId: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        admin: user.admin
      };

      //on créé et stock le tokenJWT
      const token = jwt.sign(tokenData, 'votre_secret', { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });

      res.status(201).redirect('/');
      console.log(user, token);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la connexion.');
    }
  },

  logout: (req, res) => {
    //fonciton pour le déconnecter
    //on supprime le tokenJWT
    res.clearCookie('token');
    res.redirect('/');
  },

  getAllUser: async (req, res) => {
    //fonction pour obtenir tous les utilisateurs, sauf l'admin
    try {
      const user = await User.findAll({ where: { admin: 0 }, raw: true });
      console.log(user);
      res.status(201).render('listUser', { user: req.user, users: user });
    } catch (error) {
      console.error(error);
    }

  },

  getUserById: async (req, res) => {
    //fonction pour obtenir son utilisateur selon l'id en paramètre
    try {
      const userDetails = await User.findByPk(req.params.userId, { raw: true });
      const trick = await Trick.findAll({ where: { confirme: 1 }, include: [Level], raw: true });
      console.log(userDetails);
      res.render('detailUser', { user: req.user, userDetails: userDetails, tricks: trick });
    } catch (error) {
      console.error(error);
    }
  },

  deleteUser: async (req, res) => {
    //fonction pour supprimer un utilisateur (admin)
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

  deleteAccount: async (req, res) => {
    //fonction pour supprimer le compte de l'utilisateur connecté
    try {
      const user = await User.findByPk(req.user.userId);
      const admin = await User.findOne({ where: { admin: 1 }, raw: true });

      //on vient attribuer toues les figure de l'utilisateur à l'admin avant que le compte soit supprimé
      const trick = await Trick.update({ id_user: admin.id }, { where: { id_user: user.id }, raw: true });
      console.log(trick);

      //on supprime le token
      res.clearCookie('token');
      await user.destroy();
      res.redirect('/');
    } catch (error) {
      console.error(error);
    }
  },

  updateUser: async (req, res) => {
    //fonction pour modifier les informations de son compte
    try {
      const errors = validationResult(req);
      //condition si il y a une erreur dans le formulaire
      if (!errors.isEmpty()) {
        return res.status(400).render('myaccount', { errors: errors.array(), user: req.user });
      }
      const userId = req.user.userId;

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

      //nouvelle données de l'utilisateur dans le token
      const tokenData = {
        userId: userToUpdate.id,
        nom: userToUpdate.nom,
        prenom: userToUpdate.prenom,
        email: userToUpdate.email,
        admin: userToUpdate.admin
        // Ajoutez d'autres données d'utilisateur au besoin
      };

      //supprime l'ancien token
      const token = jwt.sign(tokenData, 'votre_secret', { expiresIn: '1h' }); // Vous pouvez ajuster l'expiration selon vos besoins
      res.clearCookie('token');

      // Envoyer le nouveau token dans la réponse
      res.cookie('token', token, { httpOnly: true });

      res.status(201).redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de l\'enregistrement de la l\'utilisateur.');
    }
  },

  getAccount: async (req, res) => {
    //fonction pour obtenir la page mon compte
    try {
      const trick = await Trick.findAll({ where: { id_user: req.user.userId }, include: [Level], raw: true });
      console.log(trick);
      res.status(200).render('myaccount', { user: req.user, tricks: trick });
    } catch (error) {
      console.error(error);
    }
  },




};

module.exports = userController;
