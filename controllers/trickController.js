const Level = require('../models/level');
const Trick = require('../models/trick');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const fs = require('fs');


const trickController = {

    createTrick: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const level = await Level.findAll({ raw: true });
                return res.status(400).render('trickForm', { errors: errors.array(), user: req.user, levels: level });
            }

            if (!req.file) {
                return res.status(400).send('Veuillez télécharger une image.');
            }

            // Lisez le fichier téléchargé et convertissez-le en données binaires
            const image = fs.readFileSync(req.file.path);

            // Supprimez le fichier temporaire
            fs.unlinkSync(req.file.path);

            const newTrick = await Trick.create({
                nom: req.body.nomFigure,
                description: req.body.description,
                image: image,
                id_level: req.body.difficulte,
                id_user: req.user.userId
            });



            res.status(201).render('home', { user: req.user });

            console.log(newTrick)
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de l\'enregistrement de la figure.');
        }
    },

    getAllTrickWait: async (req, res) => {
        try {
            const trick = await Trick.findAll({ where: { confirme: 0 }, include: [Level, User], raw: true });
            console.log(trick);
            res.status(201).render('listTrickWait', { user: req.user, tricks: trick });
        } catch (error) {
            console.error(error);
        }

    },

    getAllTrick: async (req, res) => {
        try {
            const trick = await Trick.findAll({ where: { confirme: 1 }, include: [Level, User], raw: true });
            console.log(trick);
            res.status(201).render('listTrick', { user: req.user, tricks: trick });
        } catch (error) {
            console.error(error);
        }

    },

    getTrickDetails: async (req, res) => {
        try {
            console.log(req.params.trickId)
            const trickDetails = await Trick.findByPk(req.params.trickId, { include: [Level, User], raw: true });
            console.log(trickDetails);
            res.render('detailTrickWait', { user: req.user, trick: trickDetails });
        } catch (error) {
            console.error(error);
        }
    },

    getTrickById: async (req, res) => {
        try {
            const level = await Level.findAll({ raw: true });
            const trickDetails = await Trick.findByPk(req.params.trickId, { include: [Level, User], raw: true });
            console.log(trickDetails);
            res.render('detailTrick', { user: req.user, trick: trickDetails, levels: level });
        } catch (error) {
            console.error(error);
        }
    },

    deleteTrick: async (req, res) => {
        try {
            console.log(req.params.trickId);
            const trick = await Trick.findByPk(req.params.trickId);
            await trick.destroy();
            res.redirect('/');
        } catch (error) {
            console.error(error);
        }
    },

    confirmTrick: async (req, res) => {
        try {
            const trick = await Trick.findByPk(req.params.trickId);
            trick.confirme = 1;
            await trick.save();
            res.redirect('/list-proposition');
        } catch (error) {
            console.error(error);
        }
    },

    updateTrick: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const level = await Level.findAll({ raw: true });
                return res.status(400).render('list-figure/' + req.params.trickId, { errors: errors.array(), user: req.user, levels: level });
            }
            const trick = await Trick.findByPk(req.params.trickId);

            if (!req.file) {
                trick.nom = req.body.nomFigure;
                trick.description = req.body.description;
                trick.id_level = req.body.difficulte;
            }
            else {
                // Lisez le fichier téléchargé et convertissez-le en données binaires
                const image = fs.readFileSync(req.file.path);

                // Supprimez le fichier temporaire
                fs.unlinkSync(req.file.path);

                trick.nom = req.body.nomFigure;
                trick.description = req.body.description;
                trick.image = image;
                trick.id_level = req.body.difficulte;
            }
            await trick.save();



            res.status(201).redirect('/');

            console.log(trick)
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de l\'enregistrement de la figure.');
        }
    },
};

module.exports = trickController;