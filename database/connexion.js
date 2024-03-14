const {Sequelize} = require('sequelize');

const sequelize = new Sequelize("projetBachelor", "root", "", {
    host: "localhost",
    dialect: 'mysql'
})

module.exports = {
    connexion: async () => {
        try {
            await sequelize.authenticate();
            console.log('Connection has been established succesfully.');
        } catch (error) {
            console.error('Unable to connect to the database', error);
        }
        
    }, sequelize
}