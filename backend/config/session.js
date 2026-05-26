const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const  sequelize  = require('../config/postgres'); // Adjust the path as necessary
require('dotenv').config();

const sessionStore = new SequelizeStore({
  db: sequelize,
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  },
});

const initSessionStore = () => {
  sessionStore.sync();
};

module.exports = { sessionMiddleware, initSessionStore };
