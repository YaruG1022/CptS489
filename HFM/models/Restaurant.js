const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');

class Restaurant extends Model {}

Restaurant.init({
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Restaurant',
  tableName: 'restaurants'
});

module.exports = Restaurant;
