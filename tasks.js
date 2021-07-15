var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var loginPage = fs.readFileSync(__dirname + "/webpage/login.html", "utf8");
var tasksPage = fs.readFileSync(__dirname + "/webpage/tasks.html", "utf8");

module.exports = function(app){
	app.get('/tasks', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = tasksPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/tasks');
		}

		res.send(webpage);
	});	

	app.post('/gettasks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = 'select id, name, description, starttime from espresso.task where shopid = $1 order by starttime;'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var tasks = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						tasks.push({	name: result.rows[i].name,
											description: result.rows[i].description,
											starttime: result.rows[i].starttime
										});
					}
				}
					
				res.send(tasks);
			});
		});
	});

	app.post('/gettaskemployees', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		//var dateFrom = req.body.dateFrom; //'2021-03-22 00:00:00'
		//var dateTo = req.body.dateTo; //'2021-03-27 23:59:59'
		
		var sql = "select id, name from espresso.employee where shopid = $1 and ex = false order by name";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employees = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({ name: result.rows[i].name });
					}
				}
					
				res.send(employees);
			});
		});
	});

	app.post('/completetask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = "UPDATE espresso.employee SET name = $1, contact = $2, pin = $3, ex = $4 WHERE id = $5 and shopid = $6";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeName, employeeContact, employeePin, employeeEx, employeeId, shopId], function(err, result) {
				done();

				if (err) {
					console.error(err);
					var result = { "result": "fail", "error": err };
				} else {
					var result = { "result": "success" };
				}

				res.send(result);
			});
		});
	});
}