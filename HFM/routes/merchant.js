var express = require('express');
var router = express.Router();
var User = require('../models/User');
var MenuItem = require('../models/MenuItem');

/* Middleware: require logged-in cook */
function requireCook(req, res, next) {
  if (!req.session || !req.session.userId || req.session.role !== 'cook') {
    return res.redirect('/login');
  }
  next();
}

/* GET /merchant-dashboard — render dashboard with stats from DB */
router.get('/merchant-dashboard', requireCook, async function (req, res) {
  try {
    var user = await User.findByPk(req.session.userId);
    var menuCount = await MenuItem.count({ where: { userId: req.session.userId } });

    res.render('merchant-dashboard', {
      user: user,
      menuCount: menuCount,
      pendingCount: 0,
      confirmedCount: 0
    });
  } catch (err) {
    console.error(err);
    res.render('merchant-dashboard', {
      user: { firstName: 'Cook' },
      menuCount: 0,
      pendingCount: 0,
      confirmedCount: 0
    });
  }
});

/* GET /merchant-my-menu — render menu fragment with items from DB */
router.get('/merchant-my-menu', requireCook, async function (req, res) {
  try {
    var items = await MenuItem.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('merchant-my-menu', { items: items });
  } catch (err) {
    console.error(err);
    res.render('merchant-my-menu', { items: [] });
  }
});

module.exports = router;
