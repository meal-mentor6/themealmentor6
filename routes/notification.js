const express = require('express');
const router = express.Router();
const {addSubscriber, removeSubscriber, pushNotification} = require("../controllers/notification");
const {isLoggedIn} = require('../middleware/auth');

router.get('/push-notification', isLoggedIn, pushNotification);

router.post('/add-subscribers', isLoggedIn, addSubscriber);

router.delete('/remove-subscribers/:id', isLoggedIn, removeSubscriber);

module.exports = router;