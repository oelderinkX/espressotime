var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var timeSheetPage = fs.readFileSync(__dirname + "/../client/timesheet.html", "utf8");
	app.use('/scripts/timesheet.js', express.static(__dirname + '"/../client/timesheet.js'));

	app.get('/timesheet', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(timeSheetPage);
		} else {
			res.redirect(common.getLoginUrl('/timesheet'));
		}
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
												breaks: [],
												notes: ''
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

						var sql3 = 'select employeeid, date, notes from espresso.shift_notes where shopId = $1 and date > $2 and date < $3';

						pool.connect(function(err, connection, done) {
							connection.query(sql3, [shopId, dateFrom, dateTo], function(err, result) {
								done();

								if (err) {
									schedule.push({error: err});
								} else {
									if (result && result.rowCount > 0) {
										for(var i = 0; i < result.rowCount; i++) {
											var notes_employee_id = result.rows[i].employeeid;
											var notes = result.rows[i].notes;
											var date = result.rows[i].date;

											for(var x = 0; x < schedule.length; x++) {
												if (notes_employee_id == schedule[x].id) {
													var startTime = new Date(schedule[x].starttime);
													var newDate = new Date(schedule[x].starttime);
													newDate.setHours(0,0,0,0);

													if (date.toString() == newDate.toString()) {
														schedule[x].notes = notes;
													}
												}
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
		});
	});
}