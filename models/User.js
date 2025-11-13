const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  User.prototype.validPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
