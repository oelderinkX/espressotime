var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var adminPage = fs.readFileSync(__dirname + "/webpage/admin.html", "utf8");
var employeeListEditPage = fs.readFileSync(__dirname + "/webpage/employeelistedit.html", "utf8");
var timesheetPage = fs.readFileSync(__dirname + "/webpage/timesheet.html", "utf8");
var shopPage = fs.readFileSync(__dirname + "/webpage/shop.html", "utf8");

module.exports = function(app){
	app.get('/admin', urlencodedParser, function(req, res) {
		var webpage = adminPage;
	
		// if shop and password missing, just say you should go through other page and redirect to there

		res.send(webpage);
	});	

	app.get('/employeelistedit', urlencodedParser, function(req, res) {
		var webpage = employeeListEditPage;
	
		// if shop and password missing, just say you should go through other page and redirect to there

		res.send(webpage);
	});	

	app.get('/timesheet', urlencodedParser, function(req, res) {
		var webpage = timesheetPage;
	
		// if shop and password missing, just say you should go through other page and redirect to there

		res.send(webpage);
	});	

	app.get('/shop', urlencodedParser, function(req, res) {
		var webpage = shopPage;
	
		// if shop and password missing, just say you should go through other page and redirect to there

		res.send(webpage);
	});	

	app.post('/admin_getemployees', urlencodedParser, function(req, res) {
		//var shopId = req.body.shopId;
		var shopId = 1;
		var pass = req.body.pass;
		
		var sql = "SELECT id, name, contact, pin, ex from espresso.employee where shopid = $1;"

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
		//var shopId = req.body.shopId;
		var shopId = 1;
		var pass = req.body.pass;
		var dateFrom = req.body.dateFrom; //'2021-03-22 00:00:00'
		var dateTo = req.body.dateTo; //'2021-03-27 23:59:59'
		
		var sql = "select employee.name as name, start_finish.employeeid as id, start_finish.starttime as starttime, start_finish.finishtime as finishtime";
		sql += " from espresso.start_finish";
		sql += " INNER JOIN espresso.employee ON espresso.employee.id = espresso.start_finish.employeeid";
		sql += " where start_finish.starttime >= $1 and start_finish.finishtime <= $2 and shopid = $3"
		sql += " order by start_finish.employeeid, start_finish.starttime";

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

				console.log(sql2);
				console.log(dateFrom);
				console.log(dateTo);
				console.log(shopId);

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
								var breakDate = new Date(allBreaks[i].starttime);
								var scheduleDate = new Date(schedule[i].starttime);

								console.log(allBreaks[i].employeeid + ' == ' +  schedule[i].id + ' ? ');
								var equal1 = allBreaks[i].employeeid == schedule[i].id;
								console.log(equal1);
								console.log('');
								console.log(dateHelper.getDbFormat(breakDate) + ' == ' +  dateHelper.getDbFormat(scheduleDate) + ' ? ');
								var equal2 = dateHelper.getDbFormat(breakDate) == dateHelper.getDbFormat(scheduleDate);
								console.log(equal2);
								console.log('');
								console.log('');
								
								if (allBreaks[i].employeeid == schedule[i].id) {
									if (dateHelper.getDbFormat(breakDate) == dateHelper.getDbFormat(scheduleDate)) {
										schedule[i].breaks.push({	employeeid: allBreaks[i].employeeid,
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
}