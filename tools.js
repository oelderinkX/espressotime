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

		var sql = 'select author, costperyield, id, ingredients, name, recipe, totalcost, yield, recommendedprice from espresso.product where shopid = $1';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var products = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						products.push({
							author: result.rows[i].author,
							costperyield: result.rows[i].costperyield,
							id: result.rows[i].id,
							ingredients: result.rows[i].ingredients,
							name: result.rows[i].name,
							recipe: result.rows[i].recipe,
							totalcost: result.rows[i].totalcost,
							yield: result.rows[i].yield,
							recommendedprice: result.rows[i].recommendedprice
						});
					}
				}

				res.send(products);
			});
		});
	});
}