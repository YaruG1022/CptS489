var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Customer = require('../models/Customer');
var Merchant = require('../models/Merchant');

/* ============  REGISTER  ============ */

/* GET register page */
router.get('/register', function (req, res) {
  res.render('register', { error: null });
});

/* POST register */
router.post('/register', async function (req, res) {
  var { firstName, lastName, email, password, confirmPassword, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.render('register', { error: 'All fields are required.' });
  }
  if (password.length < 8) {
    return res.render('register', { error: 'Password must be at least 8 characters.' });
  }
  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match.' });
  }
  if (!['customer', 'cook'].includes(role)) {
    role = 'customer';
  }

  try {
    var ModelClass = (role === 'cook') ? Merchant : Customer;
    await ModelClass.create({ firstName, lastName, email, password });
    res.redirect('/login');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.render('register', { error: 'An account with this email already exists.' });
    }
    console.error(err);
    res.render('register', { error: 'Something went wrong. Please try again.' });
  }
});

/* ============  LOGIN  ============ */

/* GET login page */
router.get('/login', function (req, res) {
  res.render('login', { error: null });
});

/* POST login */
router.post('/login', async function (req, res) {
  var { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Email and password are required.' });
  }

  try {
    var user = await User.findUser(email, password);
    if (!user) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    // Store user info in session
    req.session.userId = user.id;
    req.session.role = user.role;

    // Login successful — redirect based on role
    if (user.role === 'cook') {
      // Always force restaurant selection after merchant login.
      delete req.session.restaurantId;
      res.redirect('/merchant-dashboard');
    } else {
      res.redirect('/browse');
    }
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Something went wrong. Please try again.' });
  }
});

/* GET logout */
router.get('/logout', function (req, res) {
  if (!req.session) return res.redirect('/login');
  req.session.destroy(function () {
    res.redirect('/login');
  });
});

module.exports = router;
