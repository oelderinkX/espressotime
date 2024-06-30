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
	var managerContactsPage = fs.readFileSync(__dirname + "/../client/manager_contacts.html", "utf8");
	var managerRosterPage = fs.readFileSync(__dirname + "/../client/manager_roster.html", "utf8");
	var managerSignInOutPage = fs.readFileSync(__dirname + "/../client/manager_signinout.html", "utf8");

	app.use('/scripts/m_manager.js', express.static(__dirname + '"/../client/m_manager.js'));

	app.get('/manager_contacts', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(managerContactsPage);
		} else {
			res.redirect(common.getLoginUrl('/manager_contacts'));
		}
	});

	app.get('/manager_roster', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(managerRosterPage);
		} else {
			res.redirect(common.getLoginUrl('/manager_roster'));
		}
	});

	app.get('/manager_signinout', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(managerSignInOutPage);
		} else {
			res.redirect(common.getLoginUrl('/manager_signinout'));
		}
	});

	app.post('/manager_name_contact', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		var namephone = [];

		sql = "select name, contact from espresso.employee ";
		sql += "where shopid = (select shopid from espresso.employee where id = $1) and ex = false order by name";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid], function(err, result) {
				done();

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						namephone.push({
							name: result.rows[i].name,
							contact: result.rows[i].contact
						});
					}
				}
					
				res.send(namephone);
			});
		});
	});

	app.post('/manager_getroles', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		var sql = 'select id, name, colour, textcolour, rights, isjob from espresso.role';
		sql += ' where shopid = (select shopid from espresso.employee where id = $1) order by id'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid], function(err, result) {
				done();

				var roles = [];
				roles.push({ id: 0, 
                             name: '-', 
                             colour: '#FFFFFF', 
                             textcolour: '#000000', 
                             rights: 0
                });

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						roles.push({ id: result.rows[i].id,
									 name: result.rows[i].name,
                                     colour: result.rows[i].colour,
                                     textcolour: result.rows[i].textcolour,
                                     rights: result.rows[i].rights,
									 isjob: result.rows[i].isjob
						});
					}
				}
					
				res.send(roles);
			});
		});
	});

	app.post('/manager_getemployeetimes', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		var date = req.body.date;
		var employeestimes = [];

		sql = "select employeeid, date, start, finish, role from espresso.roster";
		sql += " where shopid = (select shopid from espresso.employee where id = $1) and date between '" +  date + "' and '" + date + "'::date + interval '1 week';";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid], function(err, result) {
				done();

				var ids = [];
				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						var employeeid = result.rows[i].employeeid;
						if (ids.indexOf(employeeid) == -1) {
							ids.push(employeeid);
						}
					}
				}

				var sql = '';
				if (ids.length > 0) {
					sql = 'select id, name from espresso.employee where shopid = (select shopid from espresso.employee where id = $1) and (ex = false or id in (' + ids.join(',') + ')) order by name';
				} else {
					sql = 'select id, name from espresso.employee where shopid = (select shopid from espresso.employee where id = $1) and ex = false order by name';
				}

				pool.connect(function(err, connection, done) {
					connection.query(sql, [employeeid], function(err, employee_result) {
						done();

						if (employee_result && employee_result.rowCount > 0) {
							for(var i = 0; i < employee_result.rowCount; i++) {
								employeestimes.push({
									id: employee_result.rows[i].id,
									name: employee_result.rows[i].name,
									times: []			
								});
							}
						}

						if (result && result.rowCount > 0) {
							for(var i = 0; i < result.rowCount; i++) {
								for(var x = 0; x < employeestimes.length; x++) {
									if (employeestimes[x].id == result.rows[i].employeeid) {
										var d = new Date(result.rows[i].date);
										dateStr = dateHelper.pad(d.getFullYear()) + '-' + dateHelper.pad(d.getMonth() + 1) + '-' + dateHelper.pad(d.getDate());

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
		});
	});


	app.post('/manager_signinout', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		var date = req.body.date;

		var sql_employee = 'select name, id from espresso.employee where ex = false';
		sql_employee += ' and shopid = (select shopid from espresso.employee where id = $1)';

		var sql_start_finish = "select employeeid, starttime, finishtime from espresso.start_finish";
		sql_start_finish += " where starttime >= '" + date + " 00:00:00' and employeeid in ($1)";

		var sql_roster = "select employeeid, start, finish, role from espresso.roster";
		sql_roster += " where date = '" + date + "' and shopid = (select shopid from espresso.employee where id = $1)";

		var sql_break = "select employeeid, finishtime-starttime as breakduration, breaktype from espresso.break";
		sql_break += " where starttime >= '" + date + " 00:00:00' and starttime <= '" + date + " 23:59:59' and employeeid in ($1)";

		var signinout = [];

		pool.connect(function(err, connection, done) {
			connection.query(sql_employee, [employeeid], function(err, result) {
				done();

				var employees = [];
				var employeeids = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({ id: result.rows[i].id,
									 name: result.rows[i].name
						});
						employeeids.push(result.rows[i].id);
					}
				}
				var employeeidsComma = employeeids.join(',');

				sql_start_finish = sql_start_finish.replace('$1', employeeidsComma);
				console.log(sql_start_finish);

				connection.query(sql_start_finish, function(err, result) {
					console.log(err);
					done();

					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							signinout.push({
								id: result.rows[i].employeeid,
								name: '',
								starttime: result.rows[i].starttime,
								finishtime: result.rows[i].finishtime,
								roster_start: '',
								roster_finish: '',
								role: '',
								breaks: []
							});
						}
					}

					connection.query(sql_roster, [employeeid], function(err, result) {
						done();

						if (result && result.rowCount > 0) {
							for(var i = 0; i < result.rowCount; i++) {

								var alreadyExists = false;
								for(var x = 0; x < signinout.length; x++) {
									if (signinout[x].id == result.rows[i].employeeid) {
										alreadyExists = true;
									}
								}

								if (!alreadyExists) {
									signinout.push({
										id: result.rows[i].employeeid,
										name: '',
										starttime: '',
										finishtime: '',
										roster_start: result.rows[i].start,
										roster_finish: result.rows[i].finish,
										role: result.rows[i].role,
										breaks: []
									});
								} else {
									for(var x = 0; x < signinout.length; x++) {
										if (signinout[x].id == result.rows[i].employeeid) {
											signinout[x].roster_start = result.rows[i].start;
											signinout[x].roster_finish = result.rows[i].finish;
											signinout[x].role = result.rows[i].role;
										}
									}
								}
							}
						}

						// add all names
						console.log('employeees.length: ' + employees.length);
						for(var i = 0; i < employees.length; i++) {
							for(var x = 0; x < signinout.length; x++) {
								if (signinout[x].id == employees[i].id) {
									signinout[x].name = employees[i].name;
								}
							}
						}

						sql_break = sql_break.replace('$1', employeeidsComma);
						console.log(sql_break);

						connection.query(sql_break, function(err, result) {
							done();

							//employeeid, finishtime-starttime as breakduration, breaktype
							if (result && result.rowCount > 0) {
								for(var i = 0; i < result.rowCount; i++) {
									for(var x = 0; x < signinout.length; x++) {
										if (signinout[x].id == result.rows[i].employeeid) {
											var minutes;
											var breaktype;

											if (result.rows[i].breakduration) {
												if (result.rows[i].breakduration.minutes) {
													minutes = result.rows[i].breakduration.minutes;
												}
												if (result.rows[i].breakduration.hours) {
													minutes += (result.rows[i].breakduration.hours*60);
												}
											}

											if (result.rows[i].breaktype) {
												breaktype = result.rows[i].breaktype;
											}

											signinout[x].breaks.push({ duration: minutes, breaktype: breaktype });
										}
									}
								}
							}

							res.send(signinout);
						});
					})				
				});				
			});
		});
	});
}