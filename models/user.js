const { DataTypes, Sequelize } = require("sequelize");
const db = require('../database/connexion');


const User = db.sequelize.define('user', {
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
    prenom: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    admin :{
        type: Sequelize.BOOLEAN
    }
}, {
    tableName: 'user',
    timestamps: false
});


// Trick.belongsTo(Niveau, { 
//     foreignKey: 'id_niveau' });

// Niveau.hasMany(Trick, { 
//     foreignKey: 'id_niveau' });

module.exports = User;