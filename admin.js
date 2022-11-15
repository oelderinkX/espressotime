var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");
var reports = require('./reports.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var loginPage = fs.readFileSync(__dirname + "/webpage/login.html", "utf8");
var adminPage = fs.readFileSync(__dirname + "/webpage/admin.html", "utf8");
var employeeListEditPage = fs.readFileSync(__dirname + "/webpage/employeelistedit.html", "utf8");
var timesheetPage = fs.readFileSync(__dirname + "/webpage/timesheet.html", "utf8");
var shopPage = fs.readFileSync(__dirname + "/webpage/shop.html", "utf8");
var editTimesPage = fs.readFileSync(__dirname + "/webpage/edittimes.html", "utf8");
var taskEditPage = fs.readFileSync(__dirname + "/webpage/taskedit.html", "utf8");
var assetsPage = fs.readFileSync(__dirname + "/webpage/assets.html", "utf8");
var reportsPage = fs.readFileSync(__dirname + "/webpage/reports.html", "utf8");
var feedbackPage = fs.readFileSync(__dirname + "/webpage/feedback.html", "utf8");

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
	
	// edit time of staff!  when they clocked in!
	app.get('/edittimes', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);

		if (shopid && shopid != -1) {
			webpage = editTimesPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/edit');
		}

		res.send(webpage);
	});	

	app.get('/taskedit', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = taskEditPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/taskedit');
		}

		res.send(webpage);
	});	

	app.get('/assets', urlencodedParser, function(req, res) {
		//var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = assetsPage;
		} else {
			//webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/assets');
			res.redirect('https://espressotime-login.herokuapp.com/');
		}

		res.send(webpage);
	});	

	app.get('/reports', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = reportsPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/reports');
		}

		res.send(webpage);
	});	

	app.get('/feedback', urlencodedParser, function(req, res) {
		var webpage = feedbackPage;
	
		var shopid = req.query.shopId;

		webpage = common.replaceAll(webpage, 'var shopId = 0;', 'var shopId = ' + shopid + ';');

		res.send(webpage);
	});	

	app.post('/givefeedback', jsonParser, function(req, res) {
		//var json = { shopId: shopId, feedbackitems: feedbackitems, additional: additional.value, timestamp: timestamp };

		var shopId = req.body.shopId;
		var feedbackitems = req.body.feedbackitems;
		var additional = req.body.additional;
		var timestamp = req.body.timestamp;

		var sql = 'insert into espresso.feedback ';
		sql += '(shopid, description0, rating0, description1, rating1, description2, rating2, description3, rating3, additional, timestamp)';
		sql += 'values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, feedbackitems[0].description, feedbackitems[0].rating, feedbackitems[1].description, feedbackitems[1].rating, feedbackitems[2].description, feedbackitems[2].rating, feedbackitems[3].description, feedbackitems[3].rating, additional, timestamp], function(err, result) {
				done();
				var result = { "result": "success" };
				res.send(result);
			});
		});
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

	app.post('/admin_gettasks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var showOld = req.body.showOld;
		
		var filterOld = '';
		if (showOld == false) {
			filterOld = " and starttime <> '00:00:00'";
		}

		var sql = 'select id, name, inputtype, description, starttime from espresso.task where shopid = $1' + filterOld +' order by starttime';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var tasks = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						tasks.push({	id: result.rows[i].id,
											name: result.rows[i].name,
											inputtype: result.rows[i].inputtype,
											description: result.rows[i].description,
											starttime: result.rows[i].starttime
										});
					}
				}
					
				res.send(tasks);
			});
		});
	});

	app.post('/updatetask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
		var name = req.body.name;
		var description = req.body.description;
		var starttime = req.body.starttime;
		var inputtype = req.body.inputtype;

		var sql = "UPDATE espresso.task SET name=$1, inputtype=$2, description=$3, starttime=$4 WHERE id=$5 and shopid=$6";
		console.log(sql);

		pool.connect(function(err, connection, done) {
			connection.query(sql, [name, inputtype, description, starttime, id, shopId], function(err, result) {
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

	app.post('/addtask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var name = req.body.name;
		var description = req.body.description;
		var starttime = req.body.starttime;
		var inputtype = req.body.inputtype;

		var sql = "INSERT INTO espresso.task (shopid, name, inputtype, description, starttime) VALUES ($1, $2, $3, $4, $5)";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, name, inputtype, description, starttime], function(err, result) {
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

	app.post('/getassets', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		
		var sql = 'select id, name, cost, status, employeeid, notes, assigneddate, status_change_date from espresso.asset where shopid = $1 order by name'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var assets = [];
				assets.push({	id: 0,
								name: '(New Asset)',
								cost: '$0.00',
								status: 0,
								employeeid: 0,
								notes: '',
								assigneddate: new Date(),
								status_change_date: new Date()
				});

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						assets.push({	id: result.rows[i].id,
										name: result.rows[i].name,
										cost: result.rows[i].cost,
										status: result.rows[i].status,
										employeeid: result.rows[i].employeeid,
										notes: result.rows[i].notes,
										assigneddate: result.rows[i].assigneddate,
										status_change_date: result.rows[i].status_change_date,
						});
					}
				}
					
				res.send(assets);
			});
		});
	});

	app.post('/saveasset', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
		var name = req.body.name;
		var cost = req.body.cost;
		var status = req.body.status;
		var employeeid = req.body.employeeid;
		var notes = req.body.notes;
	
		var dateassigned = req.body.dateassigned;
		var statuschangedate = req.body.statuschangedate;

		if (id == 0) {
			var sql = 'insert into espresso.asset (shopid, name, cost, status, employeeid, notes, assigneddate, status_change_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) '
			pool.connect(function(err, connection, done) {
				connection.query(sql, [shopId, name, cost, status, employeeid, notes, dateassigned, statuschangedate], function(err, result) {
					done();
					res.send({success: true});
				});
			});
		} else {
			var sql = 'update espresso.asset set name=$1, cost=$2, status=$3, employeeid=$4, notes=$5, assigneddate=$6, status_change_date=$7 where id=$8 and shopId=$9';
			pool.connect(function(err, connection, done) {
				connection.query(sql, [name, cost, status, employeeid, notes, dateassigned, statuschangedate,id,shopId], function(err, result) {
					done();
					res.send({success: true});
				});
			});
		}
	});

	app.post('/getemployeesforassets', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		
		var sql = 'select id,name from espresso.employee where shopid = $1 and ex=false or id in (select employeeid from espresso.asset where shopid = $1) order by id'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employees = [];
				employees.push({id: 0, name: ''});

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({	id: result.rows[i].id,
										name: result.rows[i].name,
						});
					}
				}
					
				res.send(employees);
			});
		});
	});

	app.post('/updatetimes', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']); // not used, so a bit dangerous

		var employeeid = req.body.employeeid;

		var starttime_rowid = req.body.starttime_rowid;
		var new_starttime = req.body.new_starttime;

		var finishtime_rowid = req.body.finishtime_rowid;
		var new_finishtime = req.body.new_finishtime;

		var startsql = "update espresso.start_finish set starttime = $1 where id = $2 and employeeid = $3";
		var finishsql = "update espresso.start_finish set finishtime = $1 where id = $2 and employeeid = $3";

		pool.connect(function(err, connection, done) {
			connection.query(startsql, [new_starttime, starttime_rowid, employeeid], function(err, result) {
				done();

				pool.connect(function(err, connection, done) {
					connection.query(finishsql, [new_finishtime, finishtime_rowid, employeeid], function(err, result) {
						done();

						res.send({success: true});
					});
				});
			});
		});
	});

	app.post('/updatebreaks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']); // not used, so a bit dangerous

		var rowid = req.body.rowid;
		var employeeid = req.body.employeeid;
		var starttime = req.body.starttime;
		var new_finishtime = req.body.new_finishtime;
		var type = req.body.type;

		var sql = "update espresso.break set starttime = $1, finishtime = $2, breaktype = $3 where id = $4 and employeeid = $5";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [starttime, new_finishtime, type, rowid, employeeid], function(err, result) {
				done();

				res.send({success: true});
			});
		});
	});

	app.post('/getshopdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']); // not used, so a bit dangerous

		var sql = "select name, options from espresso.shop where id = $1";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var shop = {};

				if (result && result.rowCount > 0) {
					shop = { name: result.rows[0].name, options: result.rows[0].options };
				}

				res.send(shop);
			});
		});
	});

	app.post('/saveshopdetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var options = req.body.options;

		var sql = "update espresso.shop set options = $1 where id = $2";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [options, shopId], function(err, result) {
				done();

				res.send({success: true});
			});
		});
	});

	app.post('/runreport', urlencodedParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var request = req.body.request;
		var report = JSON.parse(request);

		if (report.id == 'assetreport') {
			reports.AssetReport(res, shopId)
		} else if (report.id == 'dailytasks') {
			reports.DailyTasks(res, shopId, report.start, report.end)
		} else if (report.id == 'feedback') {
			reports.FeedbackReport(res, shopId, report.start, report.end)
		} else if (report.id == 'labels') {
			reports.LabelsReport(res, shopId)
		} else if (report.id == 'customlabel') {
			reports.CustomLabelsReport(res, report.name, report.description, report.price, report.specials);
		} else {
			res.send('<html><body>Report function not found: ' + report.id + '</body></html>');
		}
	});
}

//customlabel