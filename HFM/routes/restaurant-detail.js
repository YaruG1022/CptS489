var express = require('express');
var router = express.Router();
var Restaurant = require('../models/Restaurant');
var MenuItem = require('../models/MenuItem');
var User = require('../models/User');
var Merchant = require('../models/Merchant');
var Order = require('../models/Order');
var OrderItem = require('../models/OrderItem');

var bgColors = ['#f5ede0','#e8f4e8','#f0ede4','#f5e8e0','#ede8f5','#e4f0e8','#f5f0e4','#f0e4e4'];

/* GET /restaurant-detail?id=X */
router.get('/restaurant-detail', async function (req, res) {
  try {
    var id = parseInt(req.query.id);
    if (!id) return res.redirect('/browse');

    var restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.redirect('/browse');

    /* Owner info — use Merchant model to get cuisine/bio/deliveryFee */
    var owner = await Merchant.findOne({ where: { id: restaurant.userId } });
    if (!owner) owner = await User.findByPk(restaurant.userId);

    /* Menu items grouped by category */
    var menuItems = await MenuItem.findAll({
      where: { restaurantId: id, available: true },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    var categories = {};
    menuItems.forEach(function (item) {
      var cat = item.category || 'Menu';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });

    /* Cart badge count */
    var cartCount = 0;
    var user = null;
    if (req.session && req.session.userId) {
      user = await User.findByPk(req.session.userId);
      var orders = await Order.findAll({
        where: { customerId: req.session.userId, status: 'pending' }
      });
      for (var o of orders) {
        var items = await OrderItem.findAll({ where: { orderId: o.id } });
        items.forEach(function (i) { cartCount += i.quantity; });
      }
    }

    res.render('restaurant-detail', {
      user: user,
      restaurant: restaurant,
      owner: owner,
      categories: categories,
      cartCount: cartCount,
      bgColors: bgColors
    });
  } catch (err) {
    console.error(err);
    res.redirect('/browse');
  }
});

module.exports = router;
