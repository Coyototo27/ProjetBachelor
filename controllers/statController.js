const User = require('../models/user');
const Trick = require('../models/trick');
const Stat = require('../models/stat');
const Level = require('../models/level');
const { Op } = require('sequelize');

const userController = {


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
                stat = await Stat.findOne({ where: { id_user: req.params.userId, id_trick: req.params.trickId }, include: [{ model: Trick, include: [Level] }, User], raw: true });

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
                stat = await Stat.findOne({ where: { id_user: req.user.userId, id_trick: req.params.trickId }, include: [{ model: Trick, include: [Level] }], raw: true });

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

    resetStatById: async (req, res) => {
        try {
            const stat = await Stat.findOne({ where: { id_trick: req.params.trickId, id_user: req.user.userId } });
            stat.nb_tentatives = 0,
                stat.nb_echecs = 0,
                stat.nb_reussites = 0

            await stat.save();
            res.redirect('/');
        } catch (error) {
            console.log(error);
        }
    },

};

module.exports = userController;
