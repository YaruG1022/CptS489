const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');

class OrderItem extends Model {

  static async findByOrder(orderId) {
    return await OrderItem.findAll({ where: { orderId } });
  }

}

OrderItem.init({
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'OrderItem',
  tableName: 'order_items'
});

module.exports = OrderItem;
