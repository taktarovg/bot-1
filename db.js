const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'bot1',
    'root',
    '159357',
    {
        host: '79.141.66.134',
        port: '6432',
        dialect: 'postgres',
    }
)