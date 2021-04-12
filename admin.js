var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var loginPage = fs.readFileSync(__dirname + "/webpage/login.html", "utf8");
var adminPage = fs.readFileSync(__dirname + "/webpage/admin.html", "utf8");
var employeeListEditPage = fs.readFileSync(__dirname + "/webpage/employeelistedit.html", "utf8");
var timesheetPage = fs.readFileSync(__dirname + "/webpage/timesheet.html", "utf8");
var shopPage = fs.readFileSync(__dirname + "/webpage/shop.html", "utf8");
var editPage = fs.readFileSync(__dirname + "/webpage/edit.html", "utf8");

module.exports = function(app){
	app.get('/admin', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = adminPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/admin');
		}

		res.send(webpage);
	});	

	app.get('/employeelistedit', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = employeeListEditPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/employeelistedit');
		}

		res.send(webpage);
	});	

	app.get('/timesheet', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = timesheetPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/timesheet');
		}

		res.send(webpage);
	});	

	app.get('/shop', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);

		if (shopid && shopid != -1) {
			webpage = shopPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/shop');
		}

		res.send(webpage);
	});	
	
	app.get('/edit', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);

		if (shopid && shopid != -1) {
			webpage = editPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/edit');
		}

		res.send(webpage);
	});	

	app.post('/admin_getemployees', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var showEx = req.body.showEx;
		
		var filterEx = '';
		if (showEx == false) {
			filterEx = ' and ex = false';
		}

		var sql = 'SELECT id, name, contact, pin, ex from espresso.employee where shopid = $1' + filterEx + ' order by name;'

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

	app.post('/admin_getschedule', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var dateFrom = req.body.dateFrom; //'2021-03-22 00:00:00'
		var dateTo = req.body.dateTo; //'2021-03-27 23:59:59'
		
		var sql = "select employee.name as name, start_finish.employeeid as id, start_finish.starttime as starttime, start_finish.finishtime as finishtime";
		sql += " from espresso.start_finish";
		sql += " INNER JOIN espresso.employee ON espresso.employee.id = espresso.start_finish.employeeid";
		sql += " where start_finish.starttime >= $1 and start_finish.finishtime <= $2 and shopid = $3"
		sql += " order by employee.name, start_finish.employeeid, start_finish.starttime";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [dateFrom, dateTo, shopId], function(err, result) {
				done();

				var schedule = [];

				if (err) {
					schedule.push({error: err});
				} else {
					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							schedule.push({	name: result.rows[i].name,
												id: result.rows[i].id,
												starttime: result.rows[i].starttime,
												finishtime: result.rows[i].finishtime,
												breaks: []
											});
						}
					}
				}
				
				var sql2 = "select employeeid, starttime, finishtime, breaktype";
				sql2 += " from espresso.break";
				sql2 += " INNER JOIN espresso.employee ON espresso.employee.id = espresso.break.employeeid";
				sql2 += " where break.starttime >= $1 and break.finishtime <= $2 and shopid = $3";
				sql2 += " order by employeeid, break.starttime";

				pool.connect(function(err, connection, done) {
					connection.query(sql2, [dateFrom, dateTo, shopId], function(err, result) {
						done();

						var allBreaks = [];

						if (err) {
							schedule.push({error: err});
						} else {
							if (result && result.rowCount > 0) {

								for(var i = 0; i < result.rowCount; i++) {
									allBreaks.push({	employeeid: result.rows[i].employeeid,
														starttime: result.rows[i].starttime,
														finishtime: result.rows[i].finishtime,
														breaktype: result.rows[i].breaktype
													});
								}
							}
						}

						for(var i = 0; i < allBreaks.length; i++) {
							for(var x = 0; x < schedule.length; x++) {
								if (allBreaks[i].employeeid == schedule[x].id) {
									if (allBreaks[i].starttime >= schedule[x].starttime && allBreaks[i].starttime <= schedule[x].finishtime ) {
										schedule[x].breaks.push({	employeeid: allBreaks[i].employeeid,
																	starttime: allBreaks[i].starttime,
																	finishtime: allBreaks[i].finishtime,
																	breaktype: allBreaks[i].breaktype,
										});
									}
								}
							}
						}

						res.send(schedule);
					});
				});
			});
		});
	});

	app.post('/updateemployee', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var employeeName = req.body.employeeName;
		var employeeContact = req.body.employeeContact;
		var employeePin = req.body.employeePin;
		var employeeEx = req.body.employeeEx;

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

	app.post('/addemployee', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeName = req.body.employeeName;
		var employeeContact = req.body.employeeContact;
		var employeePin = req.body.employeePin;
		var employeeEx = req.body.employeeEx;

		var sql = "insert into espresso.employee (shopid, name, contact, pin, ex) VALUES ($1, $2, $3, $4, $5);";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, employeeName, employeeContact, employeePin, employeeEx], function(err, result) {
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