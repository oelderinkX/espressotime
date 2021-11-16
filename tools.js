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

	app.post('/updateproducts', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
		var name = req.body.name;
		var author = req.body.author;
		var ingredients = JSON.stringify(req.body.ingredients);
		var totalcost = req.body.totalcost;
		var yield = req.body.yield;
		var costperyield = req.body.costperyield;
		var recommendedprice = req.body.recommendedprice;
		var recipe = req.body.recipe;

		var sql = '';

		console.log('updatepro id: ' + id);
		console.log('updatepro name: ' + name);
		console.log('updatepro author: ' + author);
		console.log('updatepro ingredients: ' + ingredients);
		console.log('updatepro totalcost: ' + totalcost);
		console.log('updatepro yield: ' + yield);
		console.log('updatepro costperyield: ' + costperyield);
		console.log('updatepro recommendedprice: ' + recommendedprice);
		console.log('updatepro recipe: ' + recipe);

		if (id == 0) {
			//insert
			sql = 'INSERT INTO espresso.product (author, costperyield, ingredients, name, recipe, totalcost, yield, recommendedprice, shopid)';
			sql += 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);';
		} else {
			sql = 'update espresso.product set author=$1, costperyield=$2, ingredients=$3, name=$4, recipe=$5, totalcost=$6, yield=$7,';
			sql += ' recommendedprice=$8 where id = $9;';
		}
	

		pool.connect(function(err, connection, done) {
			connection.query(sql, [author, costperyield, ingredients, name, recipe, totalcost, yield, recommendedprice, shopId, id], function(err, result) {
				done();

				res.send(result);
			});
		});
	});
}