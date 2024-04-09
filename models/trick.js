const { DataTypes, Sequelize } = require("sequelize");
const db = require('../database/connexion');
const Level = require('./level');
const User = require('./user');

//modèle trick dans la BDD
const Trick = db.sequelize.define('trick', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.BLOB('long')
    },
    confirme: {
        type: Sequelize.BOOLEAN
    },
    id_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Level,
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
    tableName: 'trick',
    timestamps: false
});


Trick.belongsTo(Level, {
    foreignKey: 'id_level'
});

Level.hasMany(Trick, {
    foreignKey: 'id_level'
});

Trick.belongsTo(User, {
    foreignKey: 'id_user'
});

User.hasMany(Trick, {
    foreignKey: 'id_user'
});

module.exports = Trick;