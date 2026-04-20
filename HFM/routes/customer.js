var express = require('express');
var router = express.Router();
var { Op } = require('sequelize');
var User = require('../models/User');
var Order = require('../models/Order');
var OrderItem = require('../models/OrderItem');
var Restaurant = require('../models/Restaurant');

/* Middleware: require logged-in customer */
function requireCustomer(req, res, next) {
  if (!req.session || !req.session.userId || req.session.role !== 'customer') {
    return res.redirect('/login');
  }
  next();
}

/* GET /customer-dashboard — render customer dashboard */
router.get('/customer-dashboard', requireCustomer, async function (req, res) {
  try {
    var user = await User.findByPk(req.session.userId);
    var activeCount = await Order.count({
      where: { customerId: req.session.userId, status: { [Op.in]: ['placed', 'confirmed', 'ready'] } }
    });
    var totalCount = await Order.count({
      where: { customerId: req.session.userId, status: { [Op.ne]: 'pending' } }
    });
    res.render('customer-dashboard', { user: user, activeCount: activeCount, totalCount: totalCount });
  } catch (err) {
    console.error(err);
    res.render('customer-dashboard', { user: { firstName: 'User' }, activeCount: 0, totalCount: 0 });
  }
});

/* GET /customer-current-order — EJS fragment: most recent non-pending order */
router.get('/customer-current-order', requireCustomer, async function (req, res) {
  try {
    var order = await Order.findOne({
      where: { customerId: req.session.userId, status: { [Op.ne]: 'pending' } },
      order: [['createdAt', 'DESC']]
    });
    var items = [];
    var restaurant = null;
    if (order) {
      items = await OrderItem.findByOrder(order.id);
      if (order.restaurantId) {
        restaurant = await Restaurant.findByPk(order.restaurantId);
      }
    }
    res.render('customer-order-status', {
      order: order ? order.toJSON() : null,
      items: items,
      restaurant: restaurant
    });
  } catch (err) {
    console.error(err);
    res.render('customer-order-status', { order: null, items: [], restaurant: null });
  }
});

/* GET /customer-order-history-data — EJS fragment: all non-pending orders (including current) */
router.get('/customer-order-history-data', requireCustomer, async function (req, res) {
  try {
    var orders = await Order.findAll({
      where: { customerId: req.session.userId, status: { [Op.ne]: 'pending' } },
      order: [['createdAt', 'DESC']]
    });
    var ordersWithDetails = await Promise.all(orders.map(async function (o) {
      var items = await OrderItem.findByOrder(o.id);
      var restaurant = null;
      if (o.restaurantId) {
        restaurant = await Restaurant.findByPk(o.restaurantId);
      }
      return Object.assign(o.toJSON(), { items: items, restaurant: restaurant });
    }));
    res.render('customer-order-history', { orders: ordersWithDetails });
  } catch (err) {
    console.error(err);
    res.render('customer-order-history', { orders: [] });
  }
});

module.exports = router;
