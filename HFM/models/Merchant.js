const User = require('./User');
const MenuItem = require('./MenuItem');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class Merchant extends User {

  static async findByEmail(email) {
    return await Merchant.findOne({ where: { email } });
  }

  async getMenuItems() {
    return await MenuItem.findByUser(this.id);
  }

}

Merchant.init({
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('customer', 'cook'),
    allowNull: false,
    defaultValue: 'customer'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
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
  },
  street: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  suite: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  zip: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
}, {
  sequelize: User.sequelize,
  modelName: 'Merchant',
  tableName: 'users',
  defaultScope: {
    where: { role: 'cook' }
  },
  hooks: {
    beforeCreate: async (user) => {
      user.role = 'cook';
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

module.exports = Merchant;
