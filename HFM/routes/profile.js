var express = require('express');
var router = express.Router();
var User = require('../models/User');

function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function cleanString(value, maxLength) {
  if (typeof value !== 'string') return null;
  var v = value.trim();
  if (!v) return null;
  if (maxLength && v.length > maxLength) return v.slice(0, maxLength);
  return v;
}

function toProfileDto(user) {
  return {
    id: user.id,
    role: user.role,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    street: user.street || '',
    suite: user.suite || '',
    city: user.city || '',
    state: user.state || '',
    zip: user.zip || ''
  };
}

router.get('/profile', requireLogin, async function (req, res) {
  try {
    var user = await User.findByPk(req.session.userId);
    if (!user) return res.redirect('/login');

    var dashboardUrl = user.role === 'cook' ? '/merchant-dashboard' : '/customer-dashboard';
    var browseUrl = user.role === 'cook' ? '/merchant-dashboard' : '/browse';

    res.render('profile', {
      user: user,
      profileData: toProfileDto(user),
      dashboardUrl: dashboardUrl,
      browseUrl: browseUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error');
  }
});

router.put('/profile/personal', requireLogin, async function (req, res) {
  try {
    var user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    var firstName = cleanString(req.body.firstName, 50);
    var lastName = cleanString(req.body.lastName, 50);
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    var phone = cleanString(req.body.phone, 20);
    var dateOfBirth = cleanString(req.body.dateOfBirth, 10);

    await user.update({
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      dateOfBirth: dateOfBirth
    });

    return res.json({ ok: true, profile: toProfileDto(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update personal information' });
  }
});

router.put('/profile/address', requireLogin, async function (req, res) {
  try {
    var user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    var street = cleanString(req.body.street, 255);
    var city   = cleanString(req.body.city, 100);
    var state  = cleanString(req.body.state, 2);
    var zip    = cleanString(req.body.zip, 10);

    if (!street || !city || !state || !zip) {
      return res.status(400).json({ error: 'Street, city, state, and zip are required to update your address.' });
    }

    state = state.toUpperCase();

    await user.update({
      street: street,
      suite: cleanString(req.body.suite, 100),
      city: city,
      state: state,
      zip: zip
    });

    return res.json({ ok: true, profile: toProfileDto(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update address' });
  }
});

module.exports = router;
