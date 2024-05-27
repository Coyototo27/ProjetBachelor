const { DataTypes, Sequelize } = require("sequelize");
const db = require('../database/connexion');
const Trick = require('./trick');
const User = require('./user');

//modèle Stat dans la BDD
const Stat = db.sequelize.define('stat', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nb_tentatives: {
        type: Sequelize.INTEGER,
    },
    nb_echecs: {
        type: Sequelize.INTEGER
    },
    nb_reussites: {
        type: Sequelize.INTEGER
    },
    id_trick: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Trick,
            key: 'id'
        }
    },
    id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'stat',
    timestamps: false
});

Stat.belongsTo(Trick, {
    foreignKey: 'id_trick',
});

Trick.hasMany(Stat, {
    foreignKey: 'id_trick',
});

Stat.belongsTo(User, {
    foreignKey: 'id_user'
});

User.hasMany(Stat, {
    foreignKey: 'id_user'
});

module.exports = Stat;