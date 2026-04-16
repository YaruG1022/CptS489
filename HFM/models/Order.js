const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');

class Order extends Model {

  static async findByCustomer(customerId) {
    return await Order.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
  }

  static async findByMerchant(merchantId) {
    return await Order.findAll({ where: { merchantId }, order: [['createdAt', 'DESC']] });
  }

  static async findCart(customerId) {
    return await Order.findOne({ where: { customerId, status: 'pending' } });
  }

}

Order.init({
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'placed', 'confirmed', 'ready', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  promoCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  fulfillment: {
    type: DataTypes.ENUM('delivery', 'pickup'),
    allowNull: false,
    defaultValue: 'delivery'
  },
  deliveryFirstName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  deliveryLastName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  deliveryPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  deliveryStreet: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  deliveryApt: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  deliveryCity: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  deliveryState: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  deliveryZip: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  deliveryNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders'
});

module.exports = Order;
