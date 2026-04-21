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
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('tags');
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || []);
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('tags', JSON.stringify(Array.isArray(val) ? val : []));
    }
  }
}, {
  sequelize,
  modelName: 'Restaurant',
  tableName: 'restaurants'
});

module.exports = Restaurant;
