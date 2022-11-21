var pg = require('pg');
var common = require('./script/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var employeePage = fs.readFileSync(__dirname + "/webpage/employee.html", "utf8");
var rosterPage = fs.readFileSync(__dirname + "/webpage/employee_roster.html", "utf8");
var breaksPage = fs.readFileSync(__dirname + "/webpage/employee_breaks.html", "utf8");
var shopDetailsPage = fs.readFileSync(__dirname + "/webpage/employee_shopdetails.html", "utf8");

module.exports = function(app) {
	app.get('/employee', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(employeePage);
		} else {
			res.redirect(common.getLoginUrl('/employee'));
		}
	});

	app.get('/employee_roster', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(rosterPage);
		} else {
			res.redirect(common.getLoginUrl('/employee_roster'));
		}
	});

	app.get('/employee_breaks', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(breaksPage);
		} else {
			res.redirect(common.getLoginUrl('/employee_breaks'));
		}
	});

	app.get('/employee_shopdetails', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(shopDetailsPage);
		} else {
			res.redirect(common.getLoginUrl('/employee_shopdetails'));
		}
	});

	app.post('/employee_getroster', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

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