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
      const trick = await Trick.findAll({ where: { confirme: 1 }, include: [Level], raw: true });
      console.log(userDetails);
      res.render('detailUser', { user: req.user, userDetails: userDetails, tricks: trick });
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

  GetStats: async (req, res) => {
    try {
      const stats = await Stat.findAll({ where: { id_user: req.user.userId } });
      let totalSuccess = 0;
      let totalAttempts = 0;
      console.log(stats);
      stats.forEach(stat => {
        totalSuccess += stat.nb_reussites;
        totalAttempts += stat.nb_tentatives;
      });

      const successPercentage = totalAttempts !== 0 ? (totalSuccess / totalAttempts) * 100 : 0;
      const failurePercentage = 100 - successPercentage;
      console.log(totalSuccess, totalAttempts);

      const data = {
        labels: ['Réussites', 'Échecs'],
        datasets: [{
          data: [successPercentage.toFixed(2), failurePercentage.toFixed(2)],
          backgroundColor: ['#190482', '#DC3545']
        }]
      };

      const trick = await Trick.findAll({ where: { confirme: 1 }, include: [Level], raw: true });
      console.log(trick)
      res.status(200).render('mesStats', { user: req.user, pieChartData: JSON.stringify(data), totalAttempts, tricks: trick });
    } catch (error) {
      console.error(error);
    }
  },

  GetStatById: async (req, res) => {
    try {
      //Partie statistique personnel
      let stat = await Stat.findOne({ where: { id_user: req.user.userId, id_trick: req.params.trickId }, include: [{ model: Trick, include: [Level] }], raw: true });
      if (!stat) {
        stat = await Stat.create({
          id_user: req.user.userId,
          id_trick: req.params.trickId,
          nb_tentatives: 0,
          nb_echecs: 0,
          nb_reussites: 0
        });
      }

      const data = {
        labels: ['Réussites', 'Échecs'],
        datasets: [{
          data: [stat.nb_reussites, stat.nb_echecs],
          backgroundColor: ['#190482', '#DC3545']
        }]
      };

      let userRank = await Stat.count({
        where: {
          id_trick: req.params.trickId,
          nb_reussites: { [Op.gt]: stat.nb_reussites }
        }
      });

      userRank++;

      const totalUsers = await User.count();


      //Partie statistique globale
      const statsGlobal = await Stat.findAll({ where: { id_trick: req.params.trickId } });
      let totalSuccess = 0;
      let totalAttempts = 0;
      console.log(statsGlobal);
      statsGlobal.forEach(stat => {
        totalSuccess += stat.nb_reussites;
        totalAttempts += stat.nb_tentatives;
      });

      const successPercentage = totalAttempts !== 0 ? (totalSuccess / totalAttempts) * 100 : 0;
      const failurePercentage = 100 - successPercentage;

      const data2 = {
        labels: ['Réussites', 'Échecs'],
        datasets: [{
          data: [successPercentage.toFixed(2), failurePercentage.toFixed(2)],
          backgroundColor: ['#190482', '#DC3545']
        }]
      };

      //Partie meilleur utilisateur
      const bestUserStatId = await Stat.findOne({
        where: {
          id_trick: req.params.trickId
        },
        order: [
          ['nb_reussites', 'DESC']
        ], include: [User], raw: true
      });
      console.log(bestUserStatId);

      res.status(200).render('mesStatsDetail', { user: req.user, stat: stat, statsGlobal: statsGlobal, userRank, totalUsers, totalAttempts, totalSuccess, bestUserStatId, pieChartData: JSON.stringify(data), pieChartData2: JSON.stringify(data2) });
    } catch (error) {
      console.error(error);
    }
  },

  getStatUserById: async (req, res) => {
    try {
      //Partie statistique de l'utilisateur en question
      let stat = await Stat.findOne({ where: { id_user: req.params.userId, id_trick: req.params.trickId }, include: [{ model: Trick, include: [Level] }, User], raw: true });
      if (!stat) {
        stat = await Stat.create({
          id_user: req.params.userId,
          id_trick: req.params.trickId,
          nb_tentatives: 0,
          nb_echecs: 0,
          nb_reussites: 0
        });
      }

      const data = {
        labels: ['Réussites', 'Échecs'],
        datasets: [{
          data: [stat.nb_reussites, stat.nb_echecs],
          backgroundColor: ['#190482', '#DC3545']
        }]
      };

      let userRank = await Stat.count({
        where: {
          id_trick: req.params.trickId,
          nb_reussites: { [Op.gt]: stat.nb_reussites }
        }
      });

      userRank++;

      const totalUsers = await User.count();


      //Partie statistique globale
      const statsGlobal = await Stat.findAll({ where: { id_trick: req.params.trickId } });
      let totalSuccess = 0;
      let totalAttempts = 0;
      console.log(statsGlobal);
      statsGlobal.forEach(stat => {
        totalSuccess += stat.nb_reussites;
        totalAttempts += stat.nb_tentatives;
      });

      const successPercentage = totalAttempts !== 0 ? (totalSuccess / totalAttempts) * 100 : 0;
      const failurePercentage = 100 - successPercentage;

      const data2 = {
        labels: ['Réussites', 'Échecs'],
        datasets: [{
          data: [successPercentage.toFixed(2), failurePercentage.toFixed(2)],
          backgroundColor: ['#190482', '#DC3545']
        }]
      };

      //Partie meilleur utilisateur
      const bestUserStatId = await Stat.findOne({
        where: {
          id_trick: req.params.trickId
        },
        order: [
          ['nb_reussites', 'DESC']
        ], include: [User], raw: true
      });
      console.log(bestUserStatId);

      res.status(200).render('detailStatUser', { user: req.user, stat: stat, statsGlobal: statsGlobal, userRank, totalUsers, totalAttempts, totalSuccess, bestUserStatId, pieChartData: JSON.stringify(data), pieChartData2: JSON.stringify(data2) });
    } catch (error) {
      console.error(error);
    }
  },

  getAccount: async (req, res) => {
    try {
      const trick = await Trick.findAll({ where: { id_user: req.user.userId }, include: [Level], raw: true });
      console.log(trick);
      res.status(200).render('myaccount', { user: req.user, tricks: trick });
    } catch (error) {
      console.error(error);
    }
  },

  deleteMyTrick: async (req, res) => {
    try {
      console.log(req.params.trickId);
      const trick = await Trick.findOne({ where: { id: req.params.trickId, id_user: req.user.userId } });
      await trick.destroy();
      res.redirect('/');
    } catch (error) {
      console.error(error);
    }
  },


};

module.exports = userController;
