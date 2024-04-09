const { DataTypes, Sequelize } = require("sequelize");
const db = require('../database/connexion');

//modèle Level de la BDD
const Level = db.sequelize.define('level', {
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
}, {
    tableName: 'level',
    timestamps: false
});

module.exports = Level;