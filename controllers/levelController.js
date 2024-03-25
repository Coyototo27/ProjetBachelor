const Level = require('../models/level');

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

    getPlay: async (req, res) => {
        try {
            const level = await Level.findAll({ raw: true });
            console.log(level);
            console.log(req.user);
            res.status(201).render('play', { user: req.user, levels: level, trick: null  });
        } catch (error) {
            console.error(error);
        }
    },
};

module.exports = levelController;
