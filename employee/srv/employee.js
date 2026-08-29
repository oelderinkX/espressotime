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
	var employeeDetailsPage = fs.readFileSync(__dirname + "/../client/employee_details.html", "utf8");

	app.use('/scripts/m_employee.js', express.static(__dirname + '"/../client/m_employee.js'));

	function getEmployeeId(req, res) {
		const employeeid = common.getEmployeeId(req.cookies['identifier']);
		console.log(`getEmployeeId '${employeeid}'`);

		if (typeof employeeid === 'undefined' || employeeid === null || employeeid === -1) {
			res.redirect(common.getLoginUrl(req.originalUrl));
			return -1;
		} else {
			return employeeid;
		}
	}

    app.get('/employee', urlencodedParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
            const employeeDetails = common.getEmployeeDetails(req.cookies['identifier']);
            console.log('get /employee, employeeDetails: ' + JSON.stringify(employeeDetails));

            let formatted = employeePage;

            if (employeeDetails && employeeDetails.role && (employeeDetails.role.toLowerCase().includes('manager') || employeeDetails.role.toLowerCase().includes('supervisor'))) {
                while (formatted.includes('display: none')) {
                    formatted = formatted.replace('display: none', 'display: inline');
                }
            }

            res.send(formatted);
        }
    });

	app.post('/employee', urlencodedParser, function(req, res) {
		var identifier = req.body.identifier;
		console.log('post /employee, identifier: ' + identifier);

		if (identifier) {
			res.cookie('identifier', identifier, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true });
			var employeeDetails = common.getEmployeeDetails(identifier);

			var formatted = employeePage;

			// if manager/owner then display contacts!
			if (employeeDetails && employeeDetails.role && (employeeDetails.role.toLowerCase().includes('manager') || employeeDetails.role.toLowerCase().includes('supervisor'))) {
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
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			res.send(timeOffPage);
		}
	});

	app.get('/employee_request_timeoff', urlencodedParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const id = req.query.id || 0;
			let formatted = requestTimeOffPage;
			formatted = formatted.replace('<input type="hidden" id="id" value="0">', '<input type="hidden" id="id" value="' + id + '">');
			res.send(formatted);
		}
	});

	app.get('/employee_roster', urlencodedParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			res.send(rosterPage);
		}
	});

	app.get('/employee_breaks', urlencodedParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			res.send(breaksPage);
		}
	});

	app.get('/employee_details', urlencodedParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			res.send(employeeDetailsPage);
		}
	});

	app.get('/employee_help', urlencodedParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			res.send(helpPage);
		}
	});

	app.get('/employee_shopdetails', urlencodedParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			res.send(shopDetailsPage);
		}
	});

	app.post('/getemployeeweek', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const date = req.body.date;
			const employeestimes = [];

			const sql = "select employeeid, date, start, finish, role from espresso.roster where employeeid = $1 and date between '" +  date + "' and '" + date + "'::date + interval '1 week'  order by date;";

			pool.connect(function(err, connection, done) {
				connection.query(sql, [employeeid], function(err, result) {
					done();

					employeestimes.push({
						id: employeeid,
						times: []			
					});

					if (result && result.rowCount > 0) {
						for(let i = 0; i < result.rowCount; i++) {
							for(let x = 0; x < employeestimes.length; x++) {
								if (employeestimes[x].id == result.rows[i].employeeid) {
									const d = new Date(result.rows[i].date);
									const dateStr = dateHelper.pad(d.getFullYear()) + '-' + dateHelper.pad(d.getMonth() + 1) + '-' + dateHelper.pad(d.getDate());

									const start = new Date(result.rows[i].start);
									const startStr = dateHelper.formatTime(start);

									const end = new Date(result.rows[i].finish);
									const endStr = dateHelper.formatTime(end);

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
		}
	});

	app.post('/employee_breaks', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const date = req.body.date;
			let employee_breaks = {};
			const breaks = [];

			let sql = "select starttime, breaktype, finishtime from espresso.break where employeeid = $1 and starttime::date = $2 order by starttime asc";

			console.log(`date '${date}'`);

			if (typeof employeeid === 'undefined' || employeeid === null) {
				res.send(employee_breaks);
				return;
			}

			if (typeof date === 'undefined' || date === null) {
				res.send(employee_breaks);
				return;
			}

			pool.connect(function(err, connection, done) {
				connection.query(sql, [employeeid, date], function(err, result) {

					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {

							var finishtime = '-';
							if (result.rows[i].finishtime) {
								finishtime = result.rows[i].finishtime;
							}

							breaks.push({
								starttime: result.rows[i].starttime,
								breaktype: result.rows[i].breaktype,
								finishtime: finishtime,
							});
						}
					}
					
					employee_breaks.breaks = breaks;

					sql = "select start, finish from espresso.roster where employeeid = $1 and start::date = $2";

					connection.query(sql, [employeeid, date], function(err, result) {
						done();

						var roster = {};
						if (result && result.rowCount == 1) {
							roster.start = result.rows[0].start;
							roster.finish = result.rows[0].finish;

							employee_breaks.roster = roster;
						}
						

						res.send(employee_breaks);
					});			
				});
			});
		}
	});

	app.post('/employee_timeoff', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const timeoff = [];

			let sql = "select ";
			sql += "t.id, t.employee_id, t.start_date, t.end_date, t.role, t.paid, t.reason, t.approved, t.unapproved_reason, ";
			sql += "e.start_date as employee_start_date, e.start_date is not NULL as has_employee_start_date ";
			sql += "from espresso.timeoff t ";
			sql += "join espresso.employee as e on e.id = t.employee_id ";
			sql += "where t.employee_id = $1 and (('now'::timestamp - '12 month'::interval) < t.start_date) order by t.start_date desc";

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
								unapproved_reason: result.rows[i].unapproved_reason,
								employee_start_date: result.rows[i].employee_start_date,
								has_employee_start_date: result.rows[i].has_employee_start_date
							});
						}
					}
						
					res.send(timeoff);
				});
			});
		}
	});

	app.post('/employee_gettimeoffquest', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const timeoff = [];
			const id = req.body.id;

			let sql = "select id, employee_id, start_date, end_date, role, paid, reason, approved, unapproved_reason from espresso.timeoff ";
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
		}
	});

	app.post('/employee_timeoff_update', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			let id = req.body.id;
			const start_date = req.body.start_date;
			const end_date = req.body.end_date;
			const role = req.body.role;
			const paid = req.body.paid;
			const reason = req.body.reason;

			let values = [];

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
		}
	});

	app.post('/employee_timeoff_delete', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const id = req.body.id;

			const sql = "DELETE FROM espresso.timeoff where employee_id = $1 and id = $2";
			const values = [employeeid, id];

			pool.connect(function(err, connection, done) {
				connection.query(sql, values, function(err, result) {
					done();

					if (err) {
						console.error(err);
						var result = { "result": "fail", "error": err };
						res.send({ result: 'fail', "error": err });
					} else if (result && result.rowCount == 1) {
						res.send({ result: 'success', id: id });
					} else {
						res.send({ result: 'fail', "error": "unknown error ?!?" });
					}
				});
			});
		}
	});

	app.post('/employee_get_details', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			let sql = "select espresso.employee.name,";
			sql += " espresso.employee.contact,";
			sql += " espresso.employee.pin,";
			sql += " espresso.employee.start_date,";
			sql += " espresso.role.name as role";
			sql += " from espresso.employee";
			sql += " join espresso.role on espresso.employee.job_title = espresso.role.id";
			sql += " where espresso.employee.id = $1 limit 1";

			const values = [employeeid];

			pool.connect(function(err, connection, done) {
				connection.query(sql, values, function(err, result) {
					done();

					var employee = {};
					if (result && result.rowCount > 0) {
						employee.name = result.rows[0].name;
						employee.contact = result.rows[0].contact;
						employee.pin = result.rows[0].pin;
						employee.start_date = result.rows[0].start_date;
						employee.role = result.rows[0].role;
					}
						
					res.send(employee);
				});
			});
		}
	});

	app.post('/employee_set_details', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const contact = req.body.contact;
			const pin = req.body.pin;

			const sql = "UPDATE espresso.employee SET contact = $2, pin = $3 where id = $1";
			const values = [employeeid, contact, pin];

			pool.connect(function(err, connection, done) {
				connection.query(sql, values, function(err, result) {
					done();
						
					if (err) {
						res.send({ result: 'fail', "error": err })
					} else {
						res.send({ result: 'success' });
					}
				});
			});
		}
	});


	app.post('/employee_get_shop_details', jsonParser, function(req, res) {
		const employeeid = getEmployeeId(req, res);
		
		if (employeeid > 0) {
			const sql = "select name, phone, address, options from espresso.shop where id = (select shopid from espresso.employee where id = $1);";
			const values = [employeeid];

			pool.connect(function(err, connection, done) {
				connection.query(sql, values, function(err, result) {
					done();
						
					let shop = {};
					if (result && result.rowCount == 1) {
						shop.name = result.rows[0].name;
						shop.phone = result.rows[0].phone;
						shop.address = result.rows[0].address;
						shop.options = result.rows[0].options;
					}
						
					res.send(shop);
				});
			});
		}
	});
}