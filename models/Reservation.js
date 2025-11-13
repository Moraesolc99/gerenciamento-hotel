module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    checkIn: { type: DataTypes.DATEONLY, allowNull: false },
    checkOut: { type: DataTypes.DATEONLY, allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false }
  }, {
    tableName: 'reservations',
    timestamps: true,
  });

  return Reservation;
};