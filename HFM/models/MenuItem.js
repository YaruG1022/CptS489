const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');

class MenuItem extends Model {

  static async findByUser(userId) {
    return await MenuItem.findAll({ where: { userId } });
  }

}

MenuItem.init({
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  servings: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'MenuItem',
  tableName: 'menu_items'
});

module.exports = MenuItem;
