const express = require("express");
const webpush = require('web-push');
const bodyParser = require('body-parser');

const APPLICATION_KEYS = {
    publicKey:
        "BHTSFjqcWNaax6KHdrTlViqDvYiXPiGmvo0pROfuwlljxRo8frHEGP2EH0Mrl10SxKqBQt3pDXUGkJiDlriUAn4",
    privateKey: "i_lhIflfQOLZ8lz0u_SZbiW8oevsz7oyCFA1USg7kUM",
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