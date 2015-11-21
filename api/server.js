var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    router = express.Router(),
    cors = require('cors'),
    cheerio = require('cheerio'),
    port = process.env.LATE_BUS_API_PORT || 8888,
    LATE_BUS_SOURCE_URL = 'http://transportation2.sandi.net/latebus.htm';

router.route('/latebuses').get(
    function(req, res) {
        var pos = -1,
            endPos = -1;

        request(LATE_BUS_SOURCE_URL, function (error, response, body) {
            var updateDate = undefined,
                updateTime = undefined,
                updateTimestamp = 0,
                lateBusTable = undefined,
                delayedBuses = [],
                delayedBus = {},
                resp = {},
                count = 1;

            if (!error && response.statusCode == 200) {
                pos = body.indexOf('Late Buses for');
                if (pos === -1) {
                    // Fail could not find today
                    // TODO
                    return;    
                }

                endPos = body.indexOf('</SPAN>', pos);
                if (endPos === -1) {
                    // Fail could not find end today marker
                    // TODO
                    return;
                }
                
                // Date: November 19, 2015
                updateDate = body.substring(pos + 15, endPos);
                updateDate = updateDate.trim();

                pos = body.indexOf('as of');
                if (pos === -1) {
                    // Fail could not find updated time
                    // TODO
                    return;
                }

                endPos = body.indexOf('</SPAN>', pos);
                updateTime = body.substring(pos + 6, endPos).trim();
                updateTimestamp = Date.parse(updateDate + ' ' + updateTime + ' -0800');

                pos = body.indexOf('<!-- BEGIN LIST -->');
                if (pos === -1) {
                    // Fail could not find list start
                    // TODO
                    return;
                }

                endPos = body.indexOf('<!-- END LIST -->');
                if (endPos === -1) {
                    // Fail could not find list start
                    // TODO
                    return;
                }

                // Table with bus details in
                lateBusTable = body.substring(pos + 19, endPos);

                $ = cheerio.load(lateBusTable);

                $('TR').children('TD').each(function(idx, elem) {
                    var textValue = $(elem).text().trim();

                    if (textValue.length > 0) {
                        switch(count) {
                            case 1:
                                delayedBus.school = textValue;
                                break;
                            case 2:
                                delayedBus.route = textValue;
                                break;
                            case 3:
                                delayedBus.delay = parseInt(textValue);
                                break;
                            case 4:
                                delayedBus.scheduledStart = textValue;
                                break;
                            case 5:
                                delayedBus.scheduledEnd = textValue;
                        }

                        if (count === 5) {
                            delayedBuses.push(delayedBus);
                            delayedBus = {};
                            count = 1;
                        } else {
                            count++;
                        }
                    }
                });

                resp.delayedBuses = delayedBuses;
                resp.updateDate = updateDate;
                resp.updateTime = updateTime;
                // TODO updateTimestamp
                resp.updateTimestamp = updateTimestamp;
                resp.source = LATE_BUS_SOURCE_URL;
                resp.phone = "(858) 496-8460";

                res.send(resp);
            }
        });
    }
);

app.use(cors());
app.use('/', router);
app.listen(port);
console.log('San Diego Late School Bus API Server listening on port ' + port);