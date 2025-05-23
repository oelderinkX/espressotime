var express = require('express');
var pg = require('pg');
var common = require('../../../common/srv/common.js');
var cache = require('../../../common/srv/cache.js');
var logging = require('../../../common/srv/logging.js');
var dateHelper = require('../../../common/srv/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var mainPage = fs.readFileSync(__dirname + "/../client/main.html", "utf8");
	app.use('/scripts/employee.js', express.static(__dirname + '/../client/employee.js'));

	app.get('/device', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(mainPage);
		} else {
			res.redirect(common.getLoginUrl('/device'));
		}
	});	

	app.post('/device', urlencodedParser, function(req, res) {
		var identifier = req.body.identifier;
		var redirect = req.body.redirect;
		
		if (identifier) {
			res.cookie('identifier', identifier, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true });

			if (redirect) {
				res.redirect(redirect);
			} else {
				res.send(mainPage);
			}
		} else {
			res.redirect(common.getLoginUrl('/device'));
		}
	});	
	
	app.post('/getemployees', urlencodedParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = "SELECT id, name from espresso.employee where shopid = $1 and ex = false order by name;"

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employees = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({	id: result.rows[i].id,
											name: result.rows[i].name
										});
					}
				}
					
				res.send(employees);
			});
		});
	});

	app.post('/getemployees_new', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var date = req.body.date;

		var sql_employee = 'select name, id from espresso.employee where ex = false';
		sql_employee += ' and shopid = $1';

		var sql_start_finish = "select employeeid, starttime, finishtime from espresso.start_finish";
		sql_start_finish += " where starttime >= '" + date + " 00:00:00' and employeeid in ($1)";

		var sql_roster = "select employeeid, start, finish, role from espresso.roster";
		sql_roster += " where date = '" + date + "' and shopid = $1";

		var sql_break = "select employeeid, starttime, finishtime, breaktype from espresso.break";
		sql_break += " where starttime >= '" + date + " 00:00:00' and starttime <= '" + date + " 23:59:59' and employeeid in ($1)";

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql_employee, [shopId], function(err, result) {
				var employees = [];
				var employeeids = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						var id = result.rows[i].id;
						var name = result.rows[i].name;

						employees.push({	id: id,
											name: name,
											starttime: '',
											finishtime: '',
											roster_start: '',
											roster_finish: '',
											role: '',
											breaks: []
										 });
						employeeids.push(id);
					}
				}
				
				sql_start_finish = sql_start_finish.replace('$1', employeeids.join(','));

				connection.query(sql_start_finish, function(err, result) {
					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							for(var e = 0; e < employees.length; e++) {
								if (result.rows[i].employeeid == employees[e].id) {
									employees[e].starttime = result.rows[i].starttime;
									employees[e].finishtime = result.rows[i].finishtime;
								}
							}
						}
					}

					connection.query(sql_roster, [shopId], function(err, result) {
						if (result && result.rowCount > 0) {
							for(var i = 0; i < result.rowCount; i++) {
								for(var e = 0; e < employees.length; e++) {
									if (result.rows[i].employeeid == employees[e].id) {
										employees[e].roster_start = result.rows[i].start;
										employees[e].roster_finish = result.rows[i].finish;
										employees[e].role = result.rows[i].role;
									}
								}
							}
						}

						sql_break = sql_break.replace('$1', employeeids.join(','));

						connection.query(sql_break, function(err, result) {
							done();

							if (result && result.rowCount > 0) {
								for(var i = 0; i < result.rowCount; i++) {
									for(var e = 0; e < employees.length; e++) {
										if (result.rows[i].employeeid == employees[e].id) {
											employees[e].breaks.push({ 
												starttime: result.rows[i].starttime,
												finishtime: result.rows[i].finishtime,
												breaktype: result.rows[i].breaktype
											});
										}
									}
								}
							}

							res.send(employees);
						});		
					});
				});				
			});
		});
	});

	app.post('/getemployeedetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var dateFrom = req.body.date + ' 00:00:00' ;
		var dateTo = req.body.date + ' 23:59:59';
		
		var sqlEmployeeDetails = "SELECT id, name, contact from espresso.employee where id = $1 and shopid = $2 limit 1;";

		var sqlStartTime = "SELECT id, employeeid, starttime, finishtime from espresso.start_finish where employeeid = $1";
		sqlStartTime += " and starttime >= $2 and starttime <= $3 order by finishtime desc;";
		
		var sqlBreaks = "select id, starttime, finishtime, breaktype from espresso.break where employeeid = $1 and starttime >= $2 and starttime <= $3;";

		var sqlNotes = "select id, shopid, employeeid, date, notes from espresso.shift_notes where shopid = $1 AND employeeid = $2 AND date = $3 limit 1";

		logging.logPoolConnect();
		pool.connect(function(err, client, done) {
			logging.logDbStats(pool);
			//client.query(sqlEmployeeDetails, [employeeId, shopId], function(err, employeeResult) {
			cache.query(client, sqlEmployeeDetails, [employeeId, shopId], 240, function(err, employeeResult) {
				var employee = {};

				if (employeeResult && employeeResult.rowCount == 1) {
					employee = {
						id: employeeResult.rows[0].id,
						name: employeeResult.rows[0].name,
						contact: employeeResult.rows[0].contact,
						starttime: '',
						finishtime: '',
						starttimes: [],
						finishtimes: [],
						breaks: [],
						notes: ''
					};
				}

				client.query(sqlStartTime, [employeeId, dateFrom, dateTo], function(err, startFinishResult) {
					if (startFinishResult && startFinishResult.rowCount > 0) {
						employee.starttime = startFinishResult.rows[0].starttime;
						employee.finishtime = startFinishResult.rows[0].finishtime;
					}

					for(var i = 0; i < startFinishResult.rows.length; i++) {
						employee.starttimes.push({ id: startFinishResult.rows[i].id, time: startFinishResult.rows[i].starttime });
						employee.finishtimes.push({ id: startFinishResult.rows[i].id, time: startFinishResult.rows[i].finishtime });
					}

					client.query(sqlBreaks, [employeeId, dateFrom, dateTo], function(err, breaksResult) {
						if (breaksResult && breaksResult.rowCount > 0) {
							for(var i = 0; i < breaksResult.rowCount; i++) {
								employee.breaks.push({ id: breaksResult.rows[i].id, startTime: breaksResult.rows[i].starttime, finishTime: breaksResult.rows[i].finishtime, breakType: breaksResult.rows[i].breaktype });
							}
						}

						client.query(sqlNotes, [shopId, employeeId, dateFrom], function(err, notesResult) {
							done();

							if (notesResult && notesResult.rowCount > 0) {
								employee.notes = notesResult.rows[0].notes;
							} 

							if (err) {
								console.log('Error getting sql notes: ' + err);
							}

							res.send(employee);
						});
					});
				});
			});
		});
	});

	app.post('/employeestart', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var startTime = req.body.startTime;
		
		var sql = "INSERT INTO espresso.start_finish (employeeid, starttime)";
		sql += " SELECT '" + employeeId + "', '" + startTime +"'";
		sql += " WHERE EXISTS ( SELECT id FROM espresso.employee WHERE id = '" + employeeId + "' ) "
		sql += " and NOT EXISTS (select id from espresso.start_finish where employeeid = " + employeeId + "";
		sql += " and starttime > '" + startTime + "'::timestamp::date and finishtime is null)"

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql, function(err, result) {
				done();

				if (err) {
					console.error(err);
					var result = { "result": "fail" };
				} else {
					var result = { "result": "success" };
				}

				res.send(result);
			});
		});
	});

	app.post('/employeefinish', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var date = req.body.date;
		var finishTime = req.body.finishTime;

		var dateFrom = date + ' 00:00:00' ;
		var dateTo = date + ' 23:59:59';

		var sql = "UPDATE espresso.start_finish SET finishtime = '" + finishTime + "' WHERE id =";
		sql += " (SELECT id FROM espresso.start_finish WHERE employeeid = '" + employeeId + "' and starttime >= '" + dateFrom + "' and starttime <= '" + dateTo + "'";
		sql += " and finishtime is null ORDER BY starttime DESC LIMIT 1);"

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql, function(err, result) {
				done();

				if (err) {
					console.error(err);
					var result = { "result": "fail" };
				} else {
					var result = { "result": "success" };
				}

				res.send(result);
			});
		});
	});

	app.post('/employeebreakstart', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var startTime = req.body.startTime;
		var breakType = req.body.breakType;
		
		var sql = "INSERT INTO espresso.break (employeeid, starttime, breakType)";
		sql += " SELECT '" + employeeId + "', '" + startTime + "', " + "'" + breakType + "'";
		sql += " WHERE EXISTS ( SELECT id FROM espresso.employee WHERE id = '" + employeeId + "');"

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql, function(err, result) {
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

	app.post('/employeebreakfinish', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var finishTime = req.body.finishTime;
		var breakType = req.body.breakType;

		var sql = "UPDATE espresso.break SET finishtime = '" + finishTime + "' WHERE id =";
		sql += " (SELECT id FROM espresso.break WHERE employeeid = '" + employeeId + "' and breakType = '" + breakType + "' and starttime <= '" + finishTime + "'";
		sql += " ORDER BY starttime DESC LIMIT 1);"

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql, function(err, result) {
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

	app.post('/employeehavebreak', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var startTime = req.body.startTime;
		var finishTime = req.body.finishTime;
		var breakType = req.body.breakType;

		var sql = "INSERT INTO espresso.break (employeeid, starttime, finishtime, breakType)";
		sql += " VALUES ($1,$2,$3,$4);";

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql, [employeeId, startTime, finishTime, breakType], function(err, result) {
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

	app.post('/allemployeestatus', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var starttime = req.body.starttime;

		var working = [];

		var sql = 'select espresso.employee.id as id, espresso.employee.name as name, espresso.start_finish.starttime as starttime,';
		sql += ' espresso.start_finish.finishtime as finishtime from espresso.start_finish';
		sql += ' left join espresso.employee on espresso.employee.id = espresso.start_finish.employeeid';
		sql += ' where espresso.employee.shopid = $1 and espresso.start_finish.starttime >= $2 order by espresso.employee.name';

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(sql, [shopId, starttime], function(err, result) {
				if (err) {
					console.error(err);
					var result = { "result": "fail", "error": err };
				} else {
					var ids = [];

					for(var i = 0; i < result.rowCount; i++) {
						var finishtime = result.rows[i].finishtime;
						var id = result.rows[i].id;
						var name = result.rows[i].name;

						ids.push(id);

						var workingstatus = {
							id: id,
							name: name,
							finishtime: finishtime,
							status: 'W'
						};
						if (finishtime) {
							workingstatus.status = 'F';
						}

						working.push(workingstatus);
					}

					if (ids.length > 0) {
						var breaksql = 'select employeeid, starttime, breaktype, finishtime from espresso.break';
						breaksql += ' where employeeid in (' + ids.join(',') + ') and espresso.break.starttime >= $1';

						connection.query(breaksql, [starttime], function(err, result) {
							done();

							for(var i = 0; i < result.rowCount; i++) {
								var id = result.rows[i].employeeid;
								var finishtime = result.rows[i].finishtime;
		
								for(var x = 0; x < working.length; x++) {
									if (id == working[x].id) {
										if (!finishtime) {
											working[x].status = result.rows[i].breaktype;
										}
									}
								}
							}

							res.send(working);
						});
					} else {
						res.send(working);
					}
				}
			});
		});
	});

	app.post('/savenotes', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var date = req.body.date;
		var notes = req.body.notes;

		var updateSql = "UPDATE espresso.shift_notes SET notes=$4 WHERE shopid=$1 AND employeeid=$2 AND date=$3;";
		var insertSql = "INSERT INTO espresso.shift_notes (shopid, employeeid, date, notes)";
		insertSql += " SELECT $1, $2, $3, $4";
		insertSql += " WHERE NOT EXISTS (SELECT 1 FROM espresso.shift_notes WHERE shopid=$1 AND employeeid=$2 AND date=$3);";

		logging.logPoolConnect();
		pool.connect(function(err, connection, done) {
			logging.logDbStats(pool);
			connection.query(updateSql, [shopId, employeeId, date, notes], function(err, result) {
				done();

				var results = [];

				if (err) {
					console.error(err);
					results.push({ "result": "fail", "error": err });
				} else {
					results.push({ "result": "success" });
				}

				logging.logPoolConnect();
				pool.connect(function(err, connection, done) {
					logging.logDbStats(pool);
					connection.query(insertSql, [shopId, employeeId, date, notes], function(err, result) {
						done();

						if (err) {
							console.error(err);
							results.push({ "result": "fail", "error": err });
						} else {
							results.push({ "result": "success" });
						}

						res.send({ "results": results });
					});
				});
			});
		});
	});

	app.post('/get_shop_options', urlencodedParser, function(req, res) {
		let shopId = common.getShopId(req.cookies['identifier']);

		let sql = "SELECT options from espresso.shop where id = $1;"

		let shopOptions = cache.getCache(shopId, cache.shopOptions);

		if (shopOptions !== null) {
			res.send(shopOptions);
		} else {
			pool.connect(function(err, client, done) {
				client.query(sql, [shopId], function(err, result) {
					done();
	
					var options = {};
	
					if (result && result.rowCount == 1) {
						options = result.rows[0].options;
						cache.setCache(shopId, cache.shopOptions, options, 240);
					}
						
					res.send(options);
				});
			});	
		}
	});
}