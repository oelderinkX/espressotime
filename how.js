var pg = require('pg');
var common = require('./script/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var loginPage = fs.readFileSync(__dirname + "/webpage/login.html", "utf8");
var howPage = fs.readFileSync(__dirname + "/webpage/how.html", "utf8");

module.exports = function(app) {
	app.get('/how', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = howPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/how');
		}

		res.send(webpage);
	});

	app.get('/howedit', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = howPage;
            webpage = common.replaceAll(webpage, 'var canSave = false; // UPDATE CAN SAVE VIA how.jsp', 'var canSave = true; // UPDATE CAN SAVE VIA how.jsp');
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/howedit');
		}

		res.send(webpage);
	});

	app.post('/gethows', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = "select id, name, description from espresso.how";
		sql += " where shopid = $1";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var hows = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						hows.push({	id: result.rows[i].id,
										name: result.rows[i].name,
										description: result.rows[i].description
									});
					}
				}
					
				res.send(hows);
			});
		});
	});
}