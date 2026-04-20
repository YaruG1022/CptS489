const User = require('./User');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class Customer extends User {

  static async findByEmail(email) {
    return await Customer.findOne({ where: { email } });
  }

}

Customer.init({
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
  modelName: 'Customer',
  tableName: 'users',
  defaultScope: {
    where: { role: 'customer' }
  },
  hooks: {
    beforeCreate: async (user) => {
      user.role = 'customer';
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

module.exports = Customer;
