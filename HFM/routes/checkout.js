var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Order = require('../models/Order');
var OrderItem = require('../models/OrderItem');
var Restaurant = require('../models/Restaurant');
var MenuItem = require('../models/MenuItem');

var AUTO_DELIVER_DELAY_MS = 10000;

var STATE_NAME_TO_CODE = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  'district of columbia': 'DC'
};

function normalizeState(value) {
  var raw = (value || '').trim();
  if (!raw) return '';
  if (raw.length === 2) return raw.toUpperCase();

  var byName = STATE_NAME_TO_CODE[raw.toLowerCase()];
  if (byName) return byName;

  // Fallback to a safe 2-char value to avoid DB overflow.
  return raw.slice(0, 2).toUpperCase();
}

function scheduleAutoDeliver(orderId) {
  setTimeout(async function () {
    try {
      // Only auto-complete orders that are still in placed status.
      await Order.update({ status: 'delivered' }, {
        where: { id: orderId, status: 'placed' }
      });
    } catch (err) {
      console.error('Auto deliver failed for order ' + orderId + ':', err.message);
    }
  }, AUTO_DELIVER_DELAY_MS);
}

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

    var errorMessage = req.query.error || null;
    res.render('checkout', {
      user: user,
      order: order,
      restaurant: restaurant,
      items: items,
      errorMessage: errorMessage
    });
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
});

/* ══════════════════════════════════════════════
   ACTION: POST /checkout  — place the order
   ══════════════════════════════════════════════ */
router.post('/checkout', async function (req, res) {
  var orderId = parseInt(req.body.orderId);
  try {
    if (!req.session || !req.session.userId) return res.redirect('/login');

    if (!orderId) return res.redirect('/cart');

    var normalizedState = normalizeState(req.body.deliveryState);
    if (!normalizedState) {
      return res.redirect('/checkout?orderId=' + orderId + '&error=' + encodeURIComponent('Please provide a valid state.'));
    }

    var placedOrderId = null;

    await Order.sequelize.transaction(async function (t) {
      var order = await Order.findOne({
        where: { id: orderId, customerId: req.session.userId, status: 'pending' },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!order) {
        var notFoundErr = new Error('Order not found.');
        notFoundErr.code = 'ORDER_NOT_FOUND';
        throw notFoundErr;
      }

      var orderItems = await OrderItem.findAll({
        where: { orderId: order.id },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (orderItems.length === 0) {
        var emptyErr = new Error('Your cart is empty.');
        emptyErr.code = 'EMPTY_ORDER';
        throw emptyErr;
      }

      var menuItemsById = {};
      for (var orderItem of orderItems) {
        var menuItem = await MenuItem.findOne({
          where: { id: orderItem.menuItemId, restaurantId: order.restaurantId },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (!menuItem) {
          var missingErr = new Error('One of the menu items is no longer available.');
          missingErr.code = 'MENU_ITEM_MISSING';
          throw missingErr;
        }

        if ((menuItem.quantity || 0) < orderItem.quantity) {
          var stockErr = new Error(orderItem.name + ' is out of stock or has insufficient quantity.');
          stockErr.code = 'INSUFFICIENT_STOCK';
          throw stockErr;
        }

        menuItemsById[menuItem.id] = menuItem;
      }

      for (var itemToDeduct of orderItems) {
        var menuItemToUpdate = menuItemsById[itemToDeduct.menuItemId];
        menuItemToUpdate.quantity = (menuItemToUpdate.quantity || 0) - itemToDeduct.quantity;
        if (menuItemToUpdate.quantity < 0) menuItemToUpdate.quantity = 0;
        menuItemToUpdate.available = menuItemToUpdate.quantity > 0;
        await menuItemToUpdate.save({ transaction: t });
      }

      /* Save delivery info */
      order.deliveryFirstName = req.body.deliveryFirstName;
      order.deliveryLastName = req.body.deliveryLastName;
      order.deliveryStreet = req.body.deliveryStreet;
      order.deliveryApt = req.body.deliveryApt || null;
      order.deliveryCity = req.body.deliveryCity;
      order.deliveryState = normalizedState;
      order.deliveryZip = req.body.deliveryZip;
      order.deliveryPhone = req.body.deliveryPhone;
      order.deliveryNotes = req.body.deliveryNotes || null;
      order.fulfillment = req.body.fulfillment || 'delivery';

      /* Change status from pending to placed */
      order.status = 'placed';
      await order.save({ transaction: t });
      placedOrderId = order.id;
    });

    scheduleAutoDeliver(placedOrderId);
    res.redirect('/order-confirmation?orderId=' + placedOrderId);
  } catch (err) {
    console.error(err);
    if (orderId) {
      var message = 'Failed to place order. Please check your address fields and try again.';
      if (err.code === 'INSUFFICIENT_STOCK' || err.code === 'MENU_ITEM_MISSING' || err.code === 'EMPTY_ORDER') {
        message = err.message;
      }
      return res.redirect('/checkout?orderId=' + orderId + '&error=' + encodeURIComponent(message));
    }
    res.redirect('/cart');
  }
});

/* ══════════════════════════════════════════════
   PAGE: GET /order-confirmation?orderId=<id>
   ══════════════════════════════════════════════ */
router.get('/order-confirmation', async function (req, res) {
  try {
    if (!req.session || !req.session.userId) return res.redirect('/login');

    var user = await User.findByPk(req.session.userId);
    var orderId = parseInt(req.query.orderId);

    if (!orderId) return res.redirect('/browse');

    var order = await Order.findOne({
      where: { id: orderId, customerId: req.session.userId }
    });

    if (!order || order.status === 'pending') return res.redirect('/cart');

    var restaurant = await Restaurant.findByPk(order.restaurantId);
    var items = await OrderItem.findAll({
      where: { orderId: order.id },
      order: [['createdAt', 'ASC']]
    });

    res.render('order-confirmation', { user: user, order: order, restaurant: restaurant, items: items });
  } catch (err) {
    console.error(err);
    res.redirect('/browse');
  }
});

module.exports = router;
