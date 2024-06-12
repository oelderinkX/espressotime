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
	var managerRosterPage = fs.readFileSync(__dirname + "/../client/manager_contacts.html", "utf8");

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
}