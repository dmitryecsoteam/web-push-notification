const express = require("express");
const webpush = require('web-push');
const bodyParser = require('body-parser');

const APPLICATION_KEYS = {
    publicKey:
        "BDHa8w4P5IvVcZXY728J4RfqHeRbYCE3JV0llBEPNbAYqlqk14I0YMXf0X2m_VooYP4RprwQekeiIeivZqv5nUs",
    privateKey: "rFIpUJ7H2kut8vkGQWNvTgRdYFJdIB9X-O6uMi0oMMw",
};

const app = express();
const jsonParser = bodyParser.json();

app.set('port', (process.env.PORT || 8081));


webpush.setVapidDetails(
    'mailto:test@mail.com',
    APPLICATION_KEYS.publicKey,
    APPLICATION_KEYS.privateKey,
);

app.post('/api/trigger-push-msg/', jsonParser, function (req, res) {
    const subscription = req.body.subscription;
    const payload = req.body.payload;
    webpush.sendNotification(subscription, payload)
        .then((result) => {
            console.log('Webpush successfully sent', result);
            res.json(result);
        })
        .catch((err) => {
            res.json(err);
            if (err.statusCode === 404 || err.statusCode === 410) {
                console.log('Subscription has expired or is no longer valid: ', err);
            } else {
                throw err;
            }
        });
});

app.listen(app.get('port'), () => {
    console.log(`Server listening on ${app.get('port')}`);
});

module.exports = app;