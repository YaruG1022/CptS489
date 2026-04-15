var express = require('express');
var router = express.Router();
var User = require('../models/User');

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
    await User.create({ firstName, lastName, email, password, role });
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

    // Login successful — redirect based on role
    if (user.role === 'cook') {
      res.redirect('/merchant-dashboard.html');
    } else {
      res.redirect('/customer-dashboard.html');
    }
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
