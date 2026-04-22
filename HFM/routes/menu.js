var express = require('express');
var router = express.Router();
var { Op } = require('sequelize');
var MenuItem = require('../models/MenuItem');
var Restaurant = require('../models/Restaurant');

/* Middleware: require logged-in cook with a selected restaurant */
function requireCook(req, res, next) {
  if (!req.session || !req.session.userId || req.session.role !== 'cook') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.session.restaurantId) {
    return res.status(400).json({ error: 'No restaurant selected.' });
  }
  next();
}

function parseNonNegativePrice(value) {
  var parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0) return null;
  return parsed;
}

function parseNonNegativeInteger(value) {
  var raw = String(value).trim();
  if (!/^\d+$/.test(raw)) return null;
  var parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

function parsePositiveInteger(value) {
  var parsed = parseNonNegativeInteger(value);
  if (parsed == null || parsed < 1) return null;
  return parsed;
}

function normalizeMenuItemName(value) {
  if (typeof value !== 'string') return null;
  var normalized = value.trim();
  return normalized || null;
}

async function hasDuplicateMenuItemName(restaurantId, name, excludeId) {
  var normalizedName = normalizeMenuItemName(name);
  if (!normalizedName) return false;

  var where = {
    restaurantId: restaurantId,
    name: normalizedName
  };

  if (excludeId != null) {
    where.id = { [Op.ne]: excludeId };
  }

  var existingItem = await MenuItem.findOne({ where: where });
  return !!existingItem;
}

/* GET /api/menu — list menu items for the selected restaurant */
router.get('/menu', requireCook, async function (req, res) {
  try {
    var items = await MenuItem.findAll({
      where: { restaurantId: req.session.restaurantId },
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load menu items.' });
  }
});

/* POST /api/menu — create a new menu item for the selected restaurant */
router.post('/menu', requireCook, async function (req, res) {
  try {
    var { name, price, quantity, category, description } = req.body;
    if (!name || price == null || quantity == null || String(quantity).trim() === '') {
      return res.status(400).json({ error: 'Name, price, and quantity are required.' });
    }

    var normalizedName = normalizeMenuItemName(name);
    if (!normalizedName) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    if (await hasDuplicateMenuItemName(req.session.restaurantId, normalizedName)) {
      return res.status(400).json({ error: 'A menu item with that name already exists for this restaurant.' });
    }

    var parsedPrice = parseNonNegativePrice(price);
    if (parsedPrice == null) {
      return res.status(400).json({ error: 'Price must be a non-negative number.' });
    }

    var parsedQuantity = parsePositiveInteger(quantity);
    if (parsedQuantity == null) {
      return res.status(400).json({ error: 'Quantity must be a positive integer greater than 0.' });
    }

    var item = await MenuItem.create({
      name: normalizedName,
      price: parsedPrice,
      quantity: parsedQuantity,
      category: category || null,
      description: description || null,
      userId: req.session.userId,
      restaurantId: req.session.restaurantId
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu item.' });
  }
});

/* PUT /api/menu/:id — update a menu item (must belong to selected restaurant) */
router.put('/menu/:id', requireCook, async function (req, res) {
  try {
    var item = await MenuItem.findOne({
      where: { id: req.params.id, restaurantId: req.session.restaurantId }
    });
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    var { name, price, quantity, category, description } = req.body;
    if (name != null) {
      var normalizedName = normalizeMenuItemName(name);
      if (!normalizedName) {
        return res.status(400).json({ error: 'Name is required.' });
      }
      if (await hasDuplicateMenuItemName(req.session.restaurantId, normalizedName, item.id)) {
        return res.status(400).json({ error: 'A menu item with that name already exists for this restaurant.' });
      }
      item.name = normalizedName;
    }
    if (price != null) {
      var parsedPrice = parseNonNegativePrice(price);
      if (parsedPrice == null) {
        return res.status(400).json({ error: 'Price must be a non-negative number.' });
      }
      item.price = parsedPrice;
    }
    if (quantity != null) {
      var parsedQuantity = parsePositiveInteger(quantity);
      if (parsedQuantity == null) {
        return res.status(400).json({ error: 'Quantity must be a positive integer greater than 0.' });
      }
      item.quantity = parsedQuantity;
    }
    if (category !== undefined) item.category = category || null;
    if (description !== undefined) item.description = description || null;
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

/* DELETE /api/menu/:id — delete a menu item (must belong to selected restaurant) */
router.delete('/menu/:id', requireCook, async function (req, res) {
  try {
    var item = await MenuItem.findOne({
      where: { id: req.params.id, restaurantId: req.session.restaurantId }
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
