var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Order = require('../models/Order');
var OrderItem = require('../models/OrderItem');
var MenuItem = require('../models/MenuItem');
var Restaurant = require('../models/Restaurant');

/* ── Middleware ──────────────────────────────── */
function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Please log in.' });
  }
  next();
}

/* ── Helper: recalculate order totals ─────── */
async function recalcOrder(order) {
  var items = await OrderItem.findAll({ where: { orderId: order.id } });
  var subtotal = 0;
  items.forEach(function (i) { subtotal += parseFloat(i.price) * i.quantity; });
  var tax = subtotal * 0.089;
  var deliveryFee = 2.99;
  var total = subtotal + tax + deliveryFee - parseFloat(order.discount || 0);
  order.subtotal = Math.round(subtotal * 100) / 100;
  order.tax = Math.round(tax * 100) / 100;
  order.deliveryFee = deliveryFee;
  order.total = Math.round(total * 100) / 100;
  await order.save();
}

/* ── Helper: total cart item count ────────── */
async function getCartCount(userId) {
  var count = 0;
  var orders = await Order.findAll({ where: { customerId: userId, status: 'pending' } });
  for (var o of orders) {
    var items = await OrderItem.findAll({ where: { orderId: o.id } });
    items.forEach(function (i) { count += i.quantity; });
  }
  return count;
}

/* ══════════════════════════════════════════════
   PAGE: GET /cart
   ══════════════════════════════════════════════ */
router.get('/cart', async function (req, res) {
  try {
    if (!req.session || !req.session.userId) return res.redirect('/login');

    var user = await User.findByPk(req.session.userId);
    var orders = await Order.findAll({
      where: { customerId: req.session.userId, status: 'pending' },
      order: [['createdAt', 'DESC']]
    });

    var cartGroups = [];
    for (var order of orders) {
      var restaurant = await Restaurant.findByPk(order.restaurantId);
      var items = await OrderItem.findAll({
        where: { orderId: order.id },
        order: [['createdAt', 'ASC']]
      });
      if (items.length > 0) {
        cartGroups.push({ order: order, restaurant: restaurant, items: items });
      }
    }

    res.render('cart', { user: user, cartGroups: cartGroups });
  } catch (err) {
    console.error(err);
    res.redirect('/browse');
  }
});

/* ══════════════════════════════════════════════
   API: POST /cart/add
   ══════════════════════════════════════════════ */
router.post('/cart/add', requireLogin, async function (req, res) {
  try {
    var menuItemId = parseInt(req.body.menuItemId);
    var restaurantId = parseInt(req.body.restaurantId);
    if (!menuItemId || !restaurantId) {
      return res.status(400).json({ error: 'Missing menuItemId or restaurantId.' });
    }

    var menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found.' });

    var restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    /* Find or create a pending order for this customer + restaurant */
    var order = await Order.findOne({
      where: { customerId: req.session.userId, restaurantId: restaurantId, status: 'pending' }
    });
    if (!order) {
      order = await Order.create({
        customerId: req.session.userId,
        merchantId: restaurant.userId,
        restaurantId: restaurantId,
        status: 'pending'
      });
    }

    /* Find or create order item */
    var orderItem = await OrderItem.findOne({
      where: { orderId: order.id, menuItemId: menuItemId }
    });
    if (orderItem) {
      orderItem.quantity += 1;
      await orderItem.save();
    } else {
      orderItem = await OrderItem.create({
        orderId: order.id,
        menuItemId: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      });
    }

    await recalcOrder(order);
    var cartCount = await getCartCount(req.session.userId);
    res.json({ success: true, cartCount: cartCount, quantity: orderItem.quantity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

/* ══════════════════════════════════════════════
   API: PUT /cart/item/:id  — update quantity
   ══════════════════════════════════════════════ */
router.put('/cart/item/:id', requireLogin, async function (req, res) {
  try {
    var orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'Item not found.' });

    var order = await Order.findByPk(orderItem.orderId);
    if (!order || order.customerId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    var quantity = parseInt(req.body.quantity);
    if (quantity <= 0) {
      await orderItem.destroy();
      var remaining = await OrderItem.count({ where: { orderId: order.id } });
      if (remaining === 0) {
        await order.destroy();
      } else {
        await recalcOrder(order);
      }
    } else {
      orderItem.quantity = quantity;
      await orderItem.save();
      await recalcOrder(order);
    }

    var cartCount = await getCartCount(req.session.userId);
    res.json({ success: true, cartCount: cartCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item.' });
  }
});

/* ══════════════════════════════════════════════
   API: DELETE /cart/item/:id  — remove item
   ══════════════════════════════════════════════ */
router.delete('/cart/item/:id', requireLogin, async function (req, res) {
  try {
    var orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'Item not found.' });

    var order = await Order.findByPk(orderItem.orderId);
    if (!order || order.customerId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    var orderId = orderItem.orderId;
    await orderItem.destroy();

    var remaining = await OrderItem.count({ where: { orderId: orderId } });
    if (remaining === 0) {
      await order.destroy();
    } else {
      await recalcOrder(order);
    }

    var cartCount = await getCartCount(req.session.userId);
    res.json({ success: true, cartCount: cartCount, orderRemoved: remaining === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

module.exports = router;
