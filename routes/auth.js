const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controller/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email', 'Please enter a valid email.')
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject('Email address already exists!');
        }
      }),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty(),
  ],
  authController.signup
);

router.post('/login', body('email').normalizeEmail(), authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.patch(
  '/status',
  isAuth,
  body('status').trim().not().isEmpty(),
  authController.updateUserStatus
);

module.exports = router;
