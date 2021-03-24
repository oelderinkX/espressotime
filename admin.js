var pg = require('pg');
var common = require('./script/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var adminPage = fs.readFileSync(__dirname + "/webpage/admin.html", "utf8");

module.exports = function(app){
	app.get('/admin', urlencodedParser, function(req, res) {
		var webpage = adminPage;
	
		// if shop and password missing, just say you should go through other page and redirect to there

		res.send(webpage);
	});	

	app.post('/admin', urlencodedParser, function(req, res) {
		var webpage = adminPage;
	
		// if shop and password missing, just say you should go through other page and redirect to there

		res.send(webpage);
	});	

	app.post('/admin_getemployees', urlencodedParser, function(req, res) {
		//var shopId = req.body.shopId;
		var shopId = 1;
		var pass = req.body.pass;
		
		var sql = "SELECT id, name, contact, pin, ex from espresso.employee where shopid = $1 and ex = true;"

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employees = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({	id: result.rows[i].id,
											name: result.rows[i].name,
											contact: result.rows[i].contact,
											pin: result.rows[i].pin,
											ex: result.rows[i].ex,
										});
					}
				}
					
				res.send(employees);
			});
		});
	});
}