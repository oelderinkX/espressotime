var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var loginPage = fs.readFileSync(__dirname + "/webpage/login.html", "utf8");
var toolsPage = fs.readFileSync(__dirname + "/webpage/tools.html", "utf8");
var productsPage = fs.readFileSync(__dirname + "/webpage/products.html", "utf8");

module.exports = function(app){
	app.get('/tools', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = toolsPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/tools');
		}

		res.send(webpage);
	});	

	app.get('/products', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = productsPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/products');
		}

		res.send(webpage);
	});	

	app.post('/getproducts', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		//var json = { shopId: shopId, feedbackitems: feedbackitems, additional: additional.value, timestamp: timestamp };

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
}