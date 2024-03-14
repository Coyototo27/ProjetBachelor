const Level = require('../models/level');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const levelController = {

    getAllLevel: async (req, res) => {
        try {
            const level = await Level.findAll({ raw: true });
            console.log(level);
            res.status(201).render('trickForm', { user: req.user, levels: level  });
        } catch (error) {
            console.error(error);
        }

    },

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
};

module.exports = levelController;
