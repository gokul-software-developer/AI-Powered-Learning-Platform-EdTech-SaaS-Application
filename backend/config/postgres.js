// backend/config/sequelize.js
const { Sequelize } = require('sequelize');


//console.log("Database Password:", process.env.DB_PASSWORD); // Optional: for debugging

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Set to true for debugging
  }
);


module.exports =sequelize;
