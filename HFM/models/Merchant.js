const User = require('./User');
const MenuItem = require('./MenuItem');
const { DataTypes } = require('sequelize');

class Merchant extends User {

  static async findByEmail(email) {
    return await Merchant.findOne({ where: { email } });
  }

  async getMenuItems() {
    return await MenuItem.findByUser(this.id);
  }

}

Merchant.init({
  kitchenName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cuisine: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  availableTimes: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  minimumOrder: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00
  }
}, {
  sequelize: User.sequelize,
  modelName: 'Merchant',
  tableName: 'users',
  defaultScope: {
    where: { role: 'cook' }
  },
  hooks: {
    beforeCreate: (user) => {
      user.role = 'cook';
    }
  }
});

module.exports = Merchant;
