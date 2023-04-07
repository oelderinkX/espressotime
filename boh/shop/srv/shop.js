var fs = require("fs");
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var pool = new pg.Pool(common.postgresConfig());

var shopPage = fs.readFileSync(__dirname + "/../client/shop.html", "utf8");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

module.exports = function(app) {
    app.get('/shop', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);

		if (shopid && shopid != -1) {
			res.send(shopPage);
		} else {
			res.redirect(common.getLoginUrl('/shop'));
		}
	});

	app.post('/getshopdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']); // not used, so a bit dangerous

		var sql = "select name, options from espresso.shop where id = $1";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var shop = {};

				if (result && result.rowCount > 0) {
					shop = { name: result.rows[0].name, options: result.rows[0].options };
				}

				res.send(shop);
			});
		});
	});

	app.post('/saveshopdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var options = req.body.options;

		var sql = "update espresso.shop set options = $1 where id = $2";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [options, shopId], function(err, result) {
				done();

				res.send({success: true});
			});
		});
	});
};