var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
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

	app.post('/getemployeeweek', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		var date = req.body.date;
		var employeestimes = [];

		sql = "select employeeid, date, start, finish, role from espresso.roster where employeeid = $1 and date between '" +  date + "' and '" + date + "'::date + interval '1 week'  order by date;";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid], function(err, result) {
				done();

				employeestimes.push({
					id: employeeid,
					times: []			
				});

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						for(var x = 0; x < employeestimes.length; x++) {
							if (employeestimes[x].id == result.rows[i].employeeid) {
								var d = new Date(result.rows[i].date);
								var dateStr = dateHelper.pad(d.getFullYear()) + '-' + dateHelper.pad(d.getMonth() + 1) + '-' + dateHelper.pad(d.getDate());

								var start = new Date(result.rows[i].start);
								var startStr = dateHelper.formatTime(start);

								var end = new Date(result.rows[i].finish);
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
					
				res.send(employeestimes);
			});
		});
	});

	app.post('/employee_breaks', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		var date = req.body.date;
		var breaks = [];

		sql = "select starttime, breaktype, finishtime from espresso.break where employeeid = $1 and starttime::date = $2";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid, date], function(err, result) {
				done();

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {

						var finishtime = '-';
						if (result.rows[i].finishtime) {
							finishtime = result.rows[i].finishtime;
						}

						breaks.push({
							starttime: result.rows[i].starttime,
							breaktype: result.rows[i].breaktype,
							finishtime: finishtime
						});
					}
				}
					
				res.send(breaks);
			});
		});
	});
}