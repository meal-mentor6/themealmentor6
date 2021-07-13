const MealPlan = require('../models/MealPlan');
const Subscriber = require('../models/Subscribers');
const webpush = require('web-push')
webpush.setVapidDetails(
    'mailto:yourmealmentor@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
)

exports.addSubscriber = async function (req, res) {
    try {
        if (!req.body.hasOwnProperty('subscription')) {
            return res.status(400).send({ err: 'Error 400: Post syntax incorrect.' });
        }
        const newSubscriber = new Subscriber({
            subscriber: req.body.subscription,
            user: req.user._id
        });
        await newSubscriber.save();
        return res.status(200).send({ msg: 'SubscriptionID received' });
    } catch (err) {
        console.log(err.message);
        return res.status(400).send({ err: err.message });
    }
}

exports.removeSubscriber = async function (req, res) {
    try {
        await Subscriber.deleteOne({ 'subscriber.endpoint': 'https://fcm.googleapis.com/fcm/send/' + req.params.id });
        return res.status(200).send({ msg: 'SubscriptionID deleted' });
    } catch (err) {
        console.log(err.message);
        return res.status(400).send({ err: err.message });
    }
}

exports.pushNotification = async function (req, res) {
    try {
        const subscribers = await Subscriber.find({});
        let currDayTime = getCurrDayTime();
        await Promise.allSettled(subscribers.map(async (s) => {
            let myMealPlan = await MealPlan.findOne({ user: s.user });
            let message = 'Good ' + currDayTime[1] + ', Time to eat: ' + myMealPlan[currDayTime[0]].schedule[currDayTime[1]].reduce((res, cv) => res += cv.title + ', ', '');
            webpush.sendNotification(s.subscriber, message);
        }));
        res.status(200).send({ msg: 'sent' });
    } catch (err) {
        console.log(err.message);
        return res.status(400).send({ err: err.message });
    }
}

const getCurrDayTime = function () {
    const d = new Date();
    const currDayTime = [];
    switch (d.getDay()) {
        case 0:
            currDayTime.push('sunday');
            break;
        case 1:
            currDayTime.push('monday');
            break;
        case 2:
            currDayTime.push('tuesday');
            break;
        case 3:
            currDayTime.push('wednesday');
            break;
        case 4:
            currDayTime.push('thursday');
            break;
        case 5:
            currDayTime.push('friday');
            break;
        case 6:
            currDayTime.push('saturday');
            break;
    }
    const time = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }).split(':');
    const hrs = parseInt(time[0]);
    const x = time[2].split(' ')[1];
	console.log(hrs, x);
    if (hrs <= 11 && x == 'AM') {
        currDayTime.push('morning');
    } else if ((hrs == 12 || (hrs >= 1 && hrs < 3)) && x == 'PM') {
        currDayTime.push('noon');
    } else {
        currDayTime.push('evening');
    }
    return currDayTime;
}