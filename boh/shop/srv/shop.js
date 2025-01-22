var fs = require("fs");
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var cache = require('../../../common/srv/cache.js');
var pool = new pg.Pool(common.postgresConfig());

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

module.exports = function(app) {
	var shopPage = fs.readFileSync(__dirname + "/../client/shop.html", "utf8");
	app.use('/scripts/shop.js', express.static(__dirname + '/../client/shop.js'));

    app.get('/shop', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);

		if (shopid && shopid != -1) {
			res.send(shopPage);
		} else {
			res.redirect(common.getLoginUrl('/shop'));
		}
	});

	app.post('/getshopdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = "select name, options, phone, address from espresso.shop where id = $1";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var shop = {};

				if (result && result.rowCount > 0) {
					shop = { 
						name: result.rows[0].name,
						options: result.rows[0].options,
						phone: result.rows[0].phone,
						address: result.rows[0].address
					 };
				}

				res.send(shop);
			});
		});
	});

	app.post('/saveshopdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var options = req.body.options || { };
		var phone = req.body.phone || '';
		var address = req.body.address || '';

		var sql = "update espresso.shop set options = $2, phone = $3, address = $4 where id = $1";

		cache.clearCache(shopId, cache.shopOptions);

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, options, phone, address], function(err, result) {
				done();

				if(err) {
					console.log(err);
				}

				res.send({success: true});
			});
		});
	});
};