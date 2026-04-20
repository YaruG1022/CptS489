var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Order = require('../models/Order');
var OrderItem = require('../models/OrderItem');
var Restaurant = require('../models/Restaurant');

/* ══════════════════════════════════════════════
   PAGE: GET /checkout?orderId=<id>
   ══════════════════════════════════════════════ */
router.get('/checkout', async function (req, res) {
  try {
    if (!req.session || !req.session.userId) return res.redirect('/login');

    var user = await User.findByPk(req.session.userId);
    var orderId = parseInt(req.query.orderId);

    /* If no orderId provided, pick the most recent pending order */
    var order;
    if (orderId) {
      order = await Order.findOne({
        where: { id: orderId, customerId: req.session.userId, status: 'pending' }
      });
    } else {
      order = await Order.findOne({
        where: { customerId: req.session.userId, status: 'pending' },
        order: [['createdAt', 'DESC']]
      });
    }

    if (!order) return res.redirect('/cart');

    var restaurant = await Restaurant.findByPk(order.restaurantId);
    var items = await OrderItem.findAll({
      where: { orderId: order.id },
      order: [['createdAt', 'ASC']]
    });

    if (items.length === 0) return res.redirect('/cart');

    res.render('checkout', { user: user, order: order, restaurant: restaurant, items: items });
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
});

/* ══════════════════════════════════════════════
   ACTION: POST /checkout  — place the order
   ══════════════════════════════════════════════ */
router.post('/checkout', async function (req, res) {
  try {
    if (!req.session || !req.session.userId) return res.redirect('/login');

    var orderId = parseInt(req.body.orderId);
    var order = await Order.findOne({
      where: { id: orderId, customerId: req.session.userId, status: 'pending' }
    });

    if (!order) return res.redirect('/cart');

    /* Save delivery info */
    order.deliveryFirstName = req.body.deliveryFirstName;
    order.deliveryLastName = req.body.deliveryLastName;
    order.deliveryStreet = req.body.deliveryStreet;
    order.deliveryApt = req.body.deliveryApt || null;
    order.deliveryCity = req.body.deliveryCity;
    order.deliveryState = req.body.deliveryState;
    order.deliveryZip = req.body.deliveryZip;
    order.deliveryPhone = req.body.deliveryPhone;
    order.deliveryNotes = req.body.deliveryNotes || null;
    order.fulfillment = req.body.fulfillment || 'delivery';

    /* Change status from pending to placed */
    order.status = 'placed';
    await order.save();

    res.redirect('/order-confirmation?orderId=' + order.id);
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
});

module.exports = router;
