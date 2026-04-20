var express = require('express');
var router = express.Router();
var MenuItem = require('../models/MenuItem');

/* Middleware: require logged-in cook */
function requireCook(req, res, next) {
  if (!req.session || !req.session.userId || req.session.role !== 'cook') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/* GET /api/menu — list current merchant's menu items */
router.get('/menu', requireCook, async function (req, res) {
  try {
    var items = await MenuItem.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load menu items.' });
  }
});

/* POST /api/menu — create a new menu item */
router.post('/menu', requireCook, async function (req, res) {
  try {
    var { name, price, quantity, category, description } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }
    var item = await MenuItem.create({
      name: name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      category: category || null,
      description: description || null,
      userId: req.session.userId
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu item.' });
  }
});

/* PUT /api/menu/:id — update a menu item */
router.put('/menu/:id', requireCook, async function (req, res) {
  try {
    var item = await MenuItem.findOne({
      where: { id: req.params.id, userId: req.session.userId }
    });
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    var { name, price, quantity, category, description } = req.body;
    if (name != null) item.name = name;
    if (price != null) item.price = parseFloat(price);
    if (quantity != null) item.quantity = parseInt(quantity);
    if (category !== undefined) item.category = category || null;
    if (description !== undefined) item.description = description || null;
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

/* DELETE /api/menu/:id — delete a menu item */
router.delete('/menu/:id', requireCook, async function (req, res) {
  try {
    var item = await MenuItem.findOne({
      where: { id: req.params.id, userId: req.session.userId }
    });
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

module.exports = router;
