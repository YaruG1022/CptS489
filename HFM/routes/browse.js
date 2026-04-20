var express = require('express');
var router = express.Router();
var { Op } = require('sequelize');
var Restaurant = require('../models/Restaurant');
var MenuItem = require('../models/MenuItem');
var User = require('../models/User');

/* Background colors for cards */
var bgColors = ['#f5ede0','#f0ede4','#e8f0e4','#f5e8e0','#ede8f5','#e4f0e8','#f5f0e4','#f0e4e4'];

/* GET /browse — list all restaurants, or search by ?q= */
router.get('/browse', async function (req, res) {
  try {
    var user = null;
    if (req.session && req.session.userId) {
      user = await User.findByPk(req.session.userId);
    }

    var query = (req.query.q || '').trim();
    var where = {};
    if (query) {
      where = {
        [Op.or]: [
          { name: { [Op.like]: '%' + query + '%' } },
          { address: { [Op.like]: '%' + query + '%' } }
        ]
      };
    }

    var dbRestaurants = await Restaurant.findAll({
      where: where,
      order: [['createdAt', 'DESC']]
    });

    /* Build view data: attach menu count, owner name, card color */
    var restaurants = [];
    for (var i = 0; i < dbRestaurants.length; i++) {
      var r = dbRestaurants[i];
      var menuCount = await MenuItem.count({ where: { restaurantId: r.id } });
      var owner = await User.findByPk(r.userId);
      restaurants.push({
        id: r.id,
        name: r.name,
        address: r.address,
        menuCount: menuCount,
        ownerName: owner ? (owner.firstName + ' ' + owner.lastName) : 'Unknown',
        bgColor: bgColors[i % bgColors.length]
      });
    }

    res.render('browse', {
      user: user,
      restaurants: restaurants,
      query: query || null
    });
  } catch (err) {
    console.error(err);
    res.render('browse', {
      user: null,
      restaurants: [],
      query: null
    });
  }
});

module.exports = router;
