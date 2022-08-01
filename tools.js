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
var productDetailsPage = fs.readFileSync(__dirname + "/webpage/productdetails.html", "utf8");
var rosterPage = fs.readFileSync(__dirname + "/webpage/roster.html", "utf8");

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

	app.get('/productdetails', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = productDetailsPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/productdetails');
		}

		res.send(webpage);
	});	

	app.get('/roster', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = rosterPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/roster');
		}

		res.send(webpage);
	});	

	app.post('/getproducts', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = 'select author, costperyield, id, ingredients, name, recipe, totalcost, yield, recommendedprice, saleprice from espresso.product where shopid = $1';

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
							ingredients: JSON.parse(result.rows[i].ingredients),
							name: result.rows[i].name,
							recipe: result.rows[i].recipe,
							totalcost: result.rows[i].totalcost,
							yield: result.rows[i].yield,
							recommendedprice: result.rows[i].recommendedprice,
							saleprice: result.rows[i].saleprice
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
		var saleprice = req.body.saleprice;

		var sql = '';

		var parameters = [];
		if (id == 0) {
			//insert
			sql = 'INSERT INTO espresso.product (author, costperyield, ingredients, name, recipe, totalcost, yield, recommendedprice, saleprice, shopid)';
			sql += 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);';
			parameters = [author, costperyield, ingredients, name, recipe, totalcost, yield, recommendedprice, saleprice, shopId];

		} else {
			sql = 'update espresso.product set author=$1, costperyield=$2, ingredients=$3, name=$4, recipe=$5, totalcost=$6, yield=$7,';
			sql += ' recommendedprice=$8, saleprice=$9 where id = $10;';
			parameters = [author, costperyield, ingredients, name, recipe, totalcost, yield, recommendedprice, saleprice, id];
		}
	
		pool.connect(function(err, connection, done) {
			connection.query(sql, parameters, function(err, result) {
				done();

				if(err) {
					console.log(err);
				}

				res.send(result);
			});
		});
	});

	app.post('/getproductdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = 'select id, name from espresso.product where shopid = $1';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var productdetails = [];
				var productIds = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						productdetails.push({
							id: 0,
							product_id: result.rows[i].id,
							name: result.rows[i].name,
							vegetarian: false,
							vegan: false,
							glutenfree: false,
							dairyfree: false,
							kosher: false,
							keto: false,
							halal: false,
							overjet: 0,
							microwave: 0,
							panini: 0,
							description: '',
							prep: '',
						});
						productIds.push(result.rows[i].id);
					}
				}

				var sql_details = 'select id, product_id, vegetarian, vegan, glutenfree, dairyfree, kosher, keto, halal, overjet, microwave, panini, description, prep from espresso.product_detail';
				sql_details += ' where shopid = $1';

				if (productIds && productIds.length > 0)
				{
					sql_details += ' and product_id in (' + productIds.join(",") + ')';
				}

				pool.connect(function(err, connection, done) {
					connection.query(sql_details, [shopId], function(err, result) {
						done();

						if (result && result.rowCount > 0) {
							for(var i = 0; i < result.rowCount; i++) {
								for(var x = 0; x < productdetails.length; x++) {
									if (productdetails[x].product_id == result.rows[i].product_id) {
										productdetails[x].id = result.rows[i].id;
										productdetails[x].vegetarian = result.rows[i].vegetarian;
										productdetails[x].vegan = result.rows[i].vegan;
										productdetails[x].glutenfree = result.rows[i].glutenfree;
										productdetails[x].dairyfree = result.rows[i].dairyfree;
										productdetails[x].kosher = result.rows[i].kosher;
										productdetails[x].keto = result.rows[i].keto;
										productdetails[x].halal = result.rows[i].halal;
										productdetails[x].oven = result.rows[i].overjet;
										productdetails[x].microwave = result.rows[i].microwave;
										productdetails[x].panini = result.rows[i].panini;
										productdetails[x].description = result.rows[i].description;
										productdetails[x].prep = result.rows[i].prep;
									}
								}
							}
						}

						res.send(productdetails);
					});
				});
			});
		});
	});

	app.post('/updateproductdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
        var product_id = req.body.product_id;
        var description = req.body.description;
        var prep = req.body.prep;
        var oven = req.body.oven;
        var microwave = req.body.microwave;
        var panini = req.body.panini;
        var vegetarian = req.body.vegetarian;
        var vegan = req.body.vegan;
        var glutenfree = req.body.glutenfree;
        var dairyfree = req.body.dairyfree;
        var kosher = req.body.kosher;
        var keto = req.body.keto;
        var halal = req.body.halal;

		var sql = '';

		var parameters = [];
		if (id == "0") {
			//insert
			sql = 'INSERT INTO espresso.product_detail (product_id, description, prep, overjet, microwave, panini, vegetarian, vegan, glutenfree, dairyfree, kosher, keto, halal, shopid)';
			sql += 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);';
			parameters = [product_id, description, prep, oven, microwave, panini, vegetarian, vegan, glutenfree, dairyfree, kosher, keto, halal, shopId];

		} else {
			sql = 'update espresso.product_detail set product_id=$1, description=$2, prep=$3, overjet=$4, microwave=$5, panini=$6, vegetarian=$7, vegan=$8,';
			sql += ' glutenfree=$9, dairyfree=$10, kosher=$11, keto=$12, halal=$13 where id = $14;';
			parameters = [product_id, description, prep, oven, microwave, panini, vegetarian, vegan, glutenfree, dairyfree, kosher, keto, halal, id];
		}
	
		pool.connect(function(err, connection, done) {
			connection.query(sql, parameters, function(err, result) {
				done();

				if(err) {
					console.log(err);
				}

				res.send(result);
			});
		});
	});

	app.post('/getemployeetimes', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var date = req.body.date;
		var employeestimes = [];

		var sql = 'select id, name from espresso.employee where ex = false and shopid = $1';
		var parameters = [shopId];
	
		pool.connect(function(err, connection, done) {
			connection.query(sql, parameters, function(err, result) {
				done();

				if (err) {
					console.log(err);
				} else {
					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							employeestimes.push({
								id: result.rows[i].id,
								name: result.rows[i].name,
								times: []			
							});
						}
					}
				}

				// NOW WE NEED TO COMBINE THE ROSTER TABLE TO EMPLOYEESTIMES!

				sql = "select employeeid, date, start, finish, role from espresso.roster where shopid = $1 and date between '" +  date + "' and '" + date + "'::date + interval '1 week';";

				pool.connect(function(err, connection, done) {
					connection.query(sql, [shopId], function(err, result) {
						done();

						if (err) {
							console.log(err);
						} else {
							if (result && result.rowCount > 0) {
								for(var i = 0; i < result.rowCount; i++) {
									for(var x = 0; x < employeestimes.length; x++) {
										if (employeestimes[x].id == result.rows[i].employeeid) {

											var date = new Date(result.rows[i].date);
											var dateStr = dateHelper.formatDate(date);

											var start = new Date(result.rows[i].start);
											var startStr = dateHelper.formatTime(start);

											var end = new Date(result.rows[i].end);
											var endStr = dateHelper.formatTime(end);

											employeestimes[x].times.push({
												date: dateStr,
												start: startStr,
												end: endStr,
												role: result.rows[i].role
											});
										}
									}
								}
							}
						}

						res.send(employeestimes);
					});
				});
			});
		});
	});


	app.post('/saveemployeetimes', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var employeeid = req.body.id;
		var date = req.body.date;
		var start = date + ' ' + req.body.start + ':00';
		var finish = date + ' ' + req.body.finish + ':00';
		var role = req.body.role;

		var sql = 'INSERT INTO espresso.roster (shopid, employeeid, date, start, finish, role) ';
		sql += 'VALUES ($1, $2, $3, $4, $5, $6) ';
		sql += 'ON CONFLICT (shopid, employeeid, date) '
		sql += 'DO UPDATE SET start = $4, finish = $5, role = $6';
	
		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, employeeid, date, start, finish, role], function(err, result) {
				done();

				console.log(sql);
				console.log(result);
				console.log(err);

				res.send({ "result": "success" });
			});
		});
	});



}