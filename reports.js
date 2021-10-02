var pg = require('pg');
var fs = require("fs");
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');

var pool = new pg.Pool(common.postgresConfig());

var table = fs.readFileSync(__dirname + "/webpage/table.html", "utf8");

function AssetReport(res, shopId) {
	var response = table;

	var employeesql = "select id, name from espresso.employee where shopid = $1";
	var sql = "select name, cost, status, employeeid, notes from espresso.asset where shopid = $1";

	pool.connect(function(err, connection, done) {
		connection.query(employeesql, [shopId], function(err, result) {
			done();

			var employees = [];

			if (result && result.rowCount > 0) {
				for(var i = 0; i < result.rowCount; i++) {
					employees.push({	id: result.rows[i].id,
										name: result.rows[i].name
									});
				}
			}

			pool.connect(function(err, connection, done) {
				connection.query(sql, [shopId], function(err, result) {
					done();

					var headings = '<th scope="col">Name</th>\n';
					headings += '<th scope="col">Cost</th>\n';
					headings += '<th scope="col">Status</th>\n';
					headings += '<th scope="col">Employee</th>\n';
					headings += '<th scope="col">Notes</th>\n';

					var rows = '';

					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							rows += '<tr>\n';
							rows += '<td>' + result.rows[i].name + '</td>\n';
							rows += '<td>' + result.rows[i].cost + '</td>\n';
							rows += '<td>' + getStatusName(result.rows[i].status) + '</td>\n';
							rows += '<td>' + getEmployeeNameById(employees, result.rows[i].employeeid) + '</td>\n';
							rows += '<td>' + result.rows[i].notes + '</td>\n';
							rows += ' </tr>\n';
						}
					}
					
					response = common.replaceAll(response, '!%REPORTNAME%!', 'Asset Report');
					response = common.replaceAll(response, '!%HEADINGS%!', headings);
					response = common.replaceAll(response, '!%ROWS%!', rows);

					res.send(response);
				});
			});
		});
	});

	
}
module.exports.AssetReport = AssetReport;

function getEmployeeNameById(employees, id)
{
	for(var i = 0; i < employees.length; i++) {
		if (employees[i].id == id) {
			return employees[i].name;
		}
	}
	return '';
}

function getStatusName(status)
{
	if (status == 0) {
		return 'Unassigned';
	} else if (status == 1) {
		return 'Assigned';
	} else if (status == 2) {
		return 'Lost';
	} else if (status == 3) {
		return 'Damaged';
	} else if (status == 4) {
		return 'Cost-recouped';
	} else {
		return 'Unknown'
	}
}

function DailyTasks(res, shopId, start, end) {
	var response = table;
	var starttime = start + ' 00:00:00'
	var endtime = end + ' 23:59:59'

	var employeesql = "select id, name from espresso.employee where shopid = $1";
	var tasksql = "select id, name, starttime, inputtype from espresso.task where shopid = $1 and starttime <> '00:00:00'";
	var completedtasksql = "select taskid, timestamp, by, input, notes from espresso.task_complete where shopid = $1";
	completedtasksql += " and timestamp >= $2 and timestamp <= $3 order by timestamp";

	pool.connect(function(err, connection, done) {
		connection.query(employeesql, [shopId], function(err, result) {
			done();

			var employees = [];

			if (result && result.rowCount > 0) {
				for(var i = 0; i < result.rowCount; i++) {
					employees.push({	id: result.rows[i].id,
										name: result.rows[i].name
									});
				}
			}

			pool.connect(function(err, connection, done) {
				connection.query(tasksql, [shopId], function(err, result) {
					done();

					var tasks = [];

					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							tasks.push({	id: result.rows[i].id,
											name: result.rows[i].name,
											starttime: result.rows[i].starttime,
											inputtype: result.rows[i].inputtype
										});
						}
					}

					pool.connect(function(err, connection, done) {
						connection.query(completedtasksql, [shopId, starttime, endtime], function(err, result) {
							done();

							var headings = '<th scope="col">Date</th>\n';
							headings += '<th scope="col"Name</th>\n';
							headings += '<th scope="col">Done at</th>\n';
							headings += '<th scope="col">Done by</th>\n';
							headings += '<th scope="col">Value</th>\n';
							headings += '<th scope="col">Notes</th>\n';

							var rows = '';

							var currentDate = '';

							if (result && result.rowCount > 0) {
								for(var i = 0; i < result.rowCount; i++) {
									rows += '<tr>\n';

									var rowDate = dateHelper.formatDate(result.rows[i].timestamp);
									if (currentDate == rowDate) {
										rows += '<td></td>\n';
									} else {
										currentDate = rowDate;
										rows += '<td>' + currentDate + '</td>\n';
									}
									
									rows += '<td>' + getTaskNameById(tasks, result.rows[i].taskid) + '</td>\n';
									rows += '<td>' + dateHelper.formatTime(result.rows[i].timestamp) + '</td>\n';
									rows += '<td>' + getEmployeeNameById(employees, result.rows[i].by) + '</td>\n';
									rows += '<td>' + result.rows[i].input + '</td>\n';
									rows += '<td>' + result.rows[i].notes + '</td>\n';
									rows += ' </tr>\n';
								}
							}
							
							response = common.replaceAll(response, '!%REPORTNAME%!', 'Daily Tasks');
							response = common.replaceAll(response, '!%HEADINGS%!', headings);
							response = common.replaceAll(response, '!%ROWS%!', rows);

							res.send(response);
						});
					});
				});
			});
		});
	});

	
}
module.exports.DailyTasks = DailyTasks;

function getTaskNameById(tasks, id)
{
	for(var i = 0; i < tasks.length; i++) {
		if (tasks[i].id == id) {
			return tasks[i].name;
		}
	}
	return '';
}