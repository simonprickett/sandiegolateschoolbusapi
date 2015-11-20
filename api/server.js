var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    router = express.Router(),
    cors = require('cors'),
    cheerio = require('cheerio'),
    port = process.env.LATE_BUS_API_PORT || 8888;

router.route('/latebuses').get(
    function(req, res) {
        res.send('OK');
    }
);

app.use(cors());
app.use('/', router);
app.listen(port);
console.log('San Diego Late School Bus API Server listening on port ' + port);