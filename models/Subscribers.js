const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema({
    subscriber: {
        endpoint: {type: String, required: true},
        expirationTime: {type: String},
        keys: {
            p256dh: {type: String, required: true},
            auth: {type: String, required: true},
        }
    },
    user: { type: mongoose.Schema.Types.ObjectId, rel: 'User', required: true }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);