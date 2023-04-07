var fs = require("fs");
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var pool = new pg.Pool(common.postgresConfig());

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var feedbackPage = fs.readFileSync(__dirname + "/../client/feedback.html", "utf8");

module.exports = function(app){
    app.get('/feedback', urlencodedParser, function(req, res) {
        var webpage = feedbackPage;

        var shopid = req.query.shopId;

        webpage = common.replaceAll(webpage, 'var shopId = 0;', 'var shopId = ' + shopid + ';');

        res.send(webpage);
    });	

    app.post('/givefeedback', jsonParser, function(req, res) {
        //var json = { shopId: shopId, feedbackitems: feedbackitems, additional: additional.value, timestamp: timestamp };

        var shopId = req.body.shopId;
        var feedbackitems = req.body.feedbackitems;
        var additional = req.body.additional;
        var timestamp = req.body.timestamp;

        var sql = 'insert into espresso.feedback ';
        sql += '(shopid, description0, rating0, description1, rating1, description2, rating2, description3, rating3, additional, timestamp)';
        sql += 'values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';

        pool.connect(function(err, connection, done) {
            connection.query(sql, [shopId, feedbackitems[0].description, feedbackitems[0].rating, feedbackitems[1].description, feedbackitems[1].rating, feedbackitems[2].description, feedbackitems[2].rating, feedbackitems[3].description, feedbackitems[3].rating, additional, timestamp], function(err, result) {
                done();
                var result = { "result": "success" };
                res.send(result);
            });
        });
    });
};