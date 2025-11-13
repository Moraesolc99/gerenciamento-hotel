const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Room = require('./Room')(sequelize, Sequelize);
db.Reservation = require('./Reservation')(sequelize, Sequelize);

db.User.hasMany(db.Reservation, { foreignKey: 'userId' });
db.Reservation.belongsTo(db.User, { foreignKey: 'userId' });

db.Room.hasMany(db.Reservation, { foreignKey: 'roomId' });
db.Reservation.belongsTo(db.Room, { foreignKey: 'roomId' });

module.exports = db;