const Sequelize = require('sequelize');

const connection = new Sequelize("myblog", 'root', '0000',{
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

module.exports = connection;