const express = require('express');
const router = express.Router();

router.get('/check-session', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      loggedIn: true,
      user: {
        userId: req.session.userId,
        firstname: req.session.firstname,
        lastname: req.session.lastname,
        mobile: req.session.mobile,
      },
    });
  } else {
    res.status(401).json({ loggedIn: false, message: 'Not logged in' });
  }
});

module.exports = router;
