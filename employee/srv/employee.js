var pg = require('pg');
var express = require('express');
var common = require('../../common/srv/common.js');
var dateHelper = require('../../common/srv/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var employeePage = fs.readFileSync(__dirname + "/../client/employee.html", "utf8");
	var timeOffPage = fs.readFileSync(__dirname + "/../client/employee_timeoff.html", "utf8");
	var requestTimeOffPage = fs.readFileSync(__dirname + "/../client/employee_request_timeoff.html", "utf8");
	var rosterPage = fs.readFileSync(__dirname + "/../client/employee_roster.html", "utf8");
	var breaksPage = fs.readFileSync(__dirname + "/../client/employee_breaks.html", "utf8");
	var helpPage = fs.readFileSync(__dirname + "/../client/employee_help.html", "utf8");
	var shopDetailsPage = fs.readFileSync(__dirname + "/../client/employee_shopdetails.html", "utf8");

	app.use('/scripts/m_employee.js', express.static(__dirname + '"/../client/m_employee.js'));

	app.get('/employee', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		if (employeeid && employeeid != -1) {
			var employeeDetails = common.getEmployeeDetails(req.cookies['identifier']);
			
			var formatted = employeePage;

			if (employeeDetails && employeeDetails.job_title_id && employeeDetails.job_title_id == 9) {
				while (formatted.includes('display: none')) {
					formatted = formatted.replace('display: none', 'display: inline');
				}
			}

			res.send(formatted);
		} else {
			res.redirect(common.getLoginUrl('/employee'));
		}
	});

	app.post('/employee', urlencodedParser, function(req, res) {
		var identifier = req.body.identifier;

		if (identifier) {
			res.cookie('identifier', identifier, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true });
			var employeeDetails = common.getEmployeeDetails(identifier);

			var formatted = employeePage;

			// if manager/owner then display contacts!
			if (employeeDetails && employeeDetails.job_title_id && employeeDetails.job_title_id == 9) {
				while (formatted.includes('display: none')) {
					formatted = formatted.replace('display: none', 'display: inline');
				}
			}

			res.send(formatted);
		} else {
			res.redirect(common.getLoginUrl('/employee'));
		}
	});

	app.get('/employee_timeoff', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(timeOffPage);
		} else {
			res.redirect(common.getLoginUrl('/employee_timeoff'));
		}
	});

	app.get('/employee_request_timeoff', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		var id = req.query.id || 0;

		if (employeeid && employeeid != -1) {
			var formatted = requestTimeOffPage;
			formatted = formatted.replace('<input type="hidden" id="id" value="0">', '<input type="hidden" id="id" value="' + id + '">');
			res.send(formatted);
		} else {
			res.redirect(common.getLoginUrl('/employee_request_timeoff'));
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

	app.get('/employee_help', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(helpPage);
		} else {
			res.redirect(common.getLoginUrl('/employee_help'));
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

	app.post('/employee_timeoff', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		var timeoff = [];

		sql = "select id, employee_id, start_date, end_date, role, paid, reason, approved, unapproved_reason from espresso.timeoff ";
		sql += "where employee_id = $1 and  (('now'::timestamp - '12 month'::interval) < start_date) order by start_date";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid], function(err, result) {
				done();

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						timeoff.push({
							id: result.rows[i].id,
							employee_id: result.rows[i].employee_id,
							start_date: result.rows[i].start_date,
							end_date: result.rows[i].end_date,
							role: result.rows[i].role,
							paid: result.rows[i].paid,
							reason: result.rows[i].reason,
							approved: result.rows[i].approved,
							unapproved_reason: result.rows[i].unapproved_reason
						});
					}
				}
					
				res.send(timeoff);
			});
		});
	});

	app.post('/employee_gettimeoffquest', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		var timeoff = [];
		var id = req.body.id;

		sql = "select id, employee_id, start_date, end_date, role, paid, reason, approved, unapproved_reason from espresso.timeoff ";
		sql += "where employee_id = $1 and id = $2 limit 1";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid, id], function(err, result) {
				done();

				if (result && result.rowCount > 0) {
					timeoff.push({
						id: result.rows[0].id,
						employee_id: result.rows[0].employee_id,
						start_date: result.rows[0].start_date,
						end_date: result.rows[0].end_date,
						role: result.rows[0].role,
						paid: result.rows[0].paid,
						reason: result.rows[0].reason,
						approved: result.rows[0].approved,
						unapproved_reason: result.rows[0].unapproved_reason
					});
				}
					
				res.send(timeoff);
			});
		});
	});

	app.post('/employee_timeoff_update', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		var id = req.body.id;
		var start_date = req.body.start_date;
		var end_date = req.body.end_date;
		var role = req.body.role;
		var paid = req.body.paid;
		var reason = req.body.reason;

        var values = [];

        if (id == 0) {
            console.log('insert');
            sql = "INSERT INTO espresso.timeoff (employee_id, start_date, end_date, role, paid, reason, approved)";
            sql += " values ($1, $2, $3, $4, $5, $6, 0) returning id";
            values = [employeeid, start_date, end_date, role, paid, reason];
        } else {
            console.log('update');
            sql = "UPDATE espresso.timeoff SET start_date = $2, end_date = $3, role = $4, paid = $5,";
			sql += " reason = $6";
            sql += " WHERE id = $1";
            values = [id, start_date, end_date, role, paid, reason];
        }

		pool.connect(function(err, connection, done) {
			connection.query(sql, values, function(err, result) {
				done();

				if (err) {
					console.error(err);
					var result = { "result": "fail", "error": err };
					res.send({ result: 'fail', "error": err });
				} else if (result && result.rowCount == 1) {
					if (id == 0) {
						id = result.rows[0].id;
					}
					res.send({ result: 'success', id: id });
				} else {
					res.send({ result: 'fail', "error": "unknown error ?!?" });
				}
			});
		});
	});
}