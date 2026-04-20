var express = require('express');
var router = express.Router();
var { Op } = require('sequelize');
var User = require('../models/User');
var MenuItem = require('../models/MenuItem');
var Restaurant = require('../models/Restaurant');
var Order = require('../models/Order');
var OrderItem = require('../models/OrderItem');

/* Middleware: require logged-in cook */
function requireCook(req, res, next) {
  if (!req.session || !req.session.userId || req.session.role !== 'cook') {
    return res.redirect('/login');
  }
  next();
}

/* GET /merchant-dashboard — show restaurant picker or dashboard */
router.get('/merchant-dashboard', requireCook, async function (req, res) {
  try {
    var user = await User.findByPk(req.session.userId);
    var restaurants = await Restaurant.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    // If "switch" query param is present, clear session selection and show picker
    if (req.query.switch === '1') {
      delete req.session.restaurantId;
      return res.render('merchant-dashboard', {
        user: user,
        restaurants: restaurants,
        restaurant: null,
        menuCount: 0,
        completedCount: 0
      });
    }

    // If a restaurant is selected (via query or session), show the dashboard
    var restaurantId = req.query.r || req.session.restaurantId;
    var selectedRestaurant = null;

    if (restaurantId) {
      selectedRestaurant = await Restaurant.findOne({
        where: { id: restaurantId, userId: req.session.userId }
      });
    }

    if (selectedRestaurant) {
      req.session.restaurantId = selectedRestaurant.id;
      var menuCount = await MenuItem.count({
        where: { restaurantId: selectedRestaurant.id }
      });
      var completedCount = await Order.count({
        where: { restaurantId: selectedRestaurant.id, status: 'delivered' }
      });

      return res.render('merchant-dashboard', {
        user: user,
        restaurants: restaurants,
        restaurant: selectedRestaurant,
        menuCount: menuCount,
        completedCount: completedCount
      });
    }

    // No restaurant selected — show picker
    res.render('merchant-dashboard', {
      user: user,
      restaurants: restaurants,
      restaurant: null,
      menuCount: 0,
      completedCount: 0
    });
  } catch (err) {
    console.error(err);
    res.render('merchant-dashboard', {
      user: { firstName: 'Cook' },
      restaurants: [],
      restaurant: null,
      menuCount: 0,
      completedCount: 0
    });
  }
});

/* POST /merchant-restaurant — create a new restaurant */
router.post('/merchant-restaurant', requireCook, async function (req, res) {
  try {
    var { name, address } = req.body;
    if (!name || !address) {
      return res.redirect('/merchant-dashboard');
    }
    var restaurant = await Restaurant.create({
      name: name.trim(),
      address: address.trim(),
      userId: req.session.userId
    });
    req.session.restaurantId = restaurant.id;
    res.redirect('/merchant-dashboard?r=' + restaurant.id);
  } catch (err) {
    console.error(err);
    res.redirect('/merchant-dashboard');
  }
});

/* GET /merchant-my-menu — render menu fragment for selected restaurant */
router.get('/merchant-my-menu', requireCook, async function (req, res) {
  try {
    var restaurantId = req.session.restaurantId;
    if (!restaurantId) {
      return res.render('merchant-my-menu', { items: [] });
    }
    var items = await MenuItem.findAll({
      where: { restaurantId: restaurantId },
      order: [['createdAt', 'DESC']]
    });
    res.render('merchant-my-menu', { items: items });
  } catch (err) {
    console.error(err);
    res.render('merchant-my-menu', { items: [] });
  }
});

/* GET /merchant-current-orders — EJS fragment: active orders for the selected restaurant */
router.get('/merchant-current-orders', requireCook, async function (req, res) {
  var restaurantId = req.session.restaurantId;
  if (!restaurantId) return res.render('merchant-current-orders', { orders: [] });
  try {
    var orders = await Order.findAll({
      where: { restaurantId: restaurantId, status: { [Op.in]: ['placed', 'confirmed', 'ready'] } },
      order: [['createdAt', 'DESC']]
    });
    var ordersWithItems = await Promise.all(orders.map(async function (o) {
      var items = await OrderItem.findByOrder(o.id);
      return Object.assign(o.toJSON(), { items: items });
    }));
    res.render('merchant-current-orders', { orders: ordersWithItems });
  } catch (err) {
    console.error(err);
    res.render('merchant-current-orders', { orders: [] });
  }
});

/* GET /merchant-completed-orders — EJS fragment: completed orders for the selected restaurant */
router.get('/merchant-completed-orders', requireCook, async function (req, res) {
  var restaurantId = req.session.restaurantId;
  if (!restaurantId) return res.render('merchant-completed-orders', { orders: [] });
  try {
    var orders = await Order.findAll({
      where: { restaurantId: restaurantId, status: 'delivered' },
      order: [['createdAt', 'DESC']]
    });
    var ordersWithItems = await Promise.all(orders.map(async function (o) {
      var items = await OrderItem.findByOrder(o.id);
      return Object.assign(o.toJSON(), { items: items });
    }));
    res.render('merchant-completed-orders', { orders: ordersWithItems });
  } catch (err) {
    console.error(err);
    res.render('merchant-completed-orders', { orders: [] });
  }
});

module.exports = router;
