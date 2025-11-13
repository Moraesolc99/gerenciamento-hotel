module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    pricePerNight: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    beds: { type: DataTypes.INTEGER, defaultValue: 1 },
    bedTypes: { type: DataTypes.STRING },
    maxPeople: { type: DataTypes.INTEGER, defaultValue: 2 },
    floor: { type: DataTypes.INTEGER, defaultValue: 1 },
    smokingAllowed: { type: DataTypes.BOOLEAN, defaultValue: false },
    petAllowed: { type: DataTypes.BOOLEAN, defaultValue: false },
    breakfastIncluded: { type: DataTypes.BOOLEAN, defaultValue: false },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    addressCEP: { type: DataTypes.STRING },
    addressStreet: { type: DataTypes.STRING },
    addressNeighborhood: { type: DataTypes.STRING },
    addressCity: { type: DataTypes.STRING },
    addressState: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING }
  }, {
    tableName: 'rooms',
    timestamps: true,
  });

  return Room;
};