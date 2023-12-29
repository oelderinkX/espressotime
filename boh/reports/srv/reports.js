var fs = require("fs");
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var dateHelper = require('../../../common/srv/dateHelper.js');

var pool = new pg.Pool(common.postgresConfig());
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { stringify } = require('querystring');

var pool = new pg.Pool(common.postgresConfig());

var table = fs.readFileSync(__dirname + "/../client/table.html", "utf8");
var labelsPage = fs.readFileSync(__dirname + "/../client/labels.html", "utf8");
var reportsPage = fs.readFileSync(__dirname + "/../client/reports.html", "utf8");

function CustomLabelsReport(res, name, description, price, specials) {
	var response = labelsPage;

	var labels = [];

	labels.push({
		name: name,
		description: description,
		price: price,
		specials: specials
	});

	response = common.replaceAll(response, 'var labels = []; // set', 'var labels = ' + JSON.stringify(labels) + ';');

	res.send(response);
}
module.exports.CustomLabelsReport = CustomLabelsReport;

function LabelsReport(res, shopId) {
	var response = labelsPage;

	var sql = 'select espresso.product.id as pid';
	sql += ', espresso.product.name as pname';
	sql += ', espresso.product.saleprice as pprice';
	sql += ', coalesce(espresso.product_detail.description, \'\') as ddesc';
	sql += ', espresso.product_detail.vegetarian as pdvegetarian';
	sql += ', espresso.product_detail.vegan as pdvegan';
	sql += ', espresso.product_detail.glutenfree as pdglutenfree';
	sql += ', espresso.product_detail.dairyfree as pddairyfree';
	sql += ', espresso.product_detail.keto as pdketo';
	sql += ', espresso.product_detail.kosher as pdkosher';
	sql += ', espresso.product_detail.halal as pdhalal';
	//sql += ', espresso.product.name as pname';  //specials
	sql += '  from espresso.product';
	sql += ' full join espresso.product_detail on espresso.product.id = espresso.product_detail.product_id';
	sql += ' where espresso.product.shopid = $1';
	sql += ' order by pname';

	var labels = [];

	pool.connect(function(err, connection, done) {
		connection.query(sql, [shopId], function(err, result) {
			done();
			if (result && result.rowCount > 0) {
				for(var i = 0; i < result.rowCount; i++) {
					var specials = [];

					if (result.rows[i].pdvegetarian) {
						specials.push('V');
					}

					if (result.rows[i].pdvegan) {
						specials.push('VG');
					}

					if (result.rows[i].pdglutenfree) {
						specials.push('GF');
					}

					if (result.rows[i].pddairyfree) {
						specials.push('DF');
					}

					if (result.rows[i].pdkosher) {
						specials.push('KO');
					}

					if (result.rows[i].pdketo) {
						specials.push('K');
					}

					if (result.rows[i].pdhalal) {
						specials.push('H');
					}

					labels.push({
						name: result.rows[i].pname,
						description: result.rows[i].ddesc,
						price: result.rows[i].pprice,
						specials: specials.join(' * ')
					});
				}
			}

			response = common.replaceAll(response, 'var labels = []; // set', 'var labels = ' + JSON.stringify(labels) + ';');

			res.send(response);
		});
	});
}
module.exports.LabelsReport = LabelsReport;

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
							headings += '<th scope="col">Name</th>\n';
							headings += '<th scope="col">Done at</th>\n';
							headings += '<th scope="col">Done by</th>\n';
							headings += '<th scope="col">Value</th>\n';
							headings += '<th scope="col">Notes</th>\n';

							var rows = '';

							var currentDate = '';

							var tasksDone = [];
							if (result && result.rowCount > 0) {
								for(var i = 0; i < result.rowCount; i++) {
									rows += '<tr>\n';

									var rowDate = dateHelper.formatDate(result.rows[i].timestamp);
									if (currentDate == rowDate) {
										rows += '<td></td>\n';
									} else {
										if (currentDate != '') {
											// output all the not done things! after date switch!
											// all tds and trs
											tasksDone = [];
										}
										currentDate = rowDate;
										rows += '<td>' + currentDate + '</td>\n';
									}
									
									tasksDone.push(result.rows[i].taskid);
									rows += '<td>' + getTaskNameById(tasks, result.rows[i].taskid) + '</td>\n';
									rows += '<td>' + dateHelper.formatTime(result.rows[i].timestamp) + '</td>\n';
									rows += '<td>' + getEmployeeNameById(employees, result.rows[i].by) + '</td>\n';
									rows += '<td>' + result.rows[i].input + '</td>\n';
									rows += '<td>' + result.rows[i].notes + '</td>\n';
									rows += ' </tr>\n';
								}
								
								// not DONE tasks
								for(var i = 0; i < tasks.length; i++) {
									if (!tasksDone.includes(tasks[i].id)) {
										rows += '<tr>\n';
										rows += '<td>' + getTaskNameById(tasks, result.rows[i].taskid) + '</td>\n';
										rows += '<td> X </td>\n';
										rows += '<td> X </td>\n';
										rows += '<td> X </td>\n';
										rows += '<td> X </td>\n';
										rows += ' </tr>\n';
									}
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

function FeedbackReport(res, shopId, start, end) {
	var response = table;
	var starttime = start + ' 00:00:00'
	var endtime = end + ' 23:59:59'

	var sql = "select description0, rating0, description1, rating1, description2, rating2, description3, rating3, additional, timestamp from espresso.feedback where shopid = $1";

	pool.connect(function(err, connection, done) {
		connection.query(sql, [shopId], function(err, result) {
			done();

			if (result && result.rowCount > 0) {
				var headings = '<th scope="col">' + result.rows[0].description0 + '</th>\n';
				headings += '<th scope="col">' + result.rows[0].description1 + '</th>\n';
				headings += '<th scope="col">' + result.rows[0].description2 + '</th>\n';
				headings += '<th scope="col">' + result.rows[0].description3 + '</th>\n';
				headings += '<th scope="col">Additional Notes</th>\n';
				headings += '<th scope="col">Timestamp</th>\n';

				var rows = '';

				for(var i = 0; i < result.rowCount; i++) {
					rows += '<tr>\n';
				
					rows += '<td>' + result.rows[i].rating0 + '</td>\n';
					rows += '<td>' + result.rows[i].rating1 + '</td>\n';
					rows += '<td>' + result.rows[i].rating2 + '</td>\n';
					rows += '<td>' + result.rows[i].rating3 + '</td>\n';
					rows += '<td>' + result.rows[i].additional + '</td>\n';
					rows += '<td>' + result.rows[i].timestamp + '</td>\n';
					rows += ' </tr>\n';
				}
			}
			
			response = common.replaceAll(response, '!%REPORTNAME%!', 'Feedback');
			response = common.replaceAll(response, '!%HEADINGS%!', headings);
			response = common.replaceAll(response, '!%ROWS%!', rows);

			res.send(response);
		});
	});
}
module.exports.FeedbackReport = FeedbackReport;

module.exports = function(app) {
	app.use('/scripts/reports.js', express.static(__dirname + '/../client/reports.js'));

	app.get('/reports', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(reportsPage);
		} else {
			res.redirect(common.getLoginUrl('/reports'));
		}
	});	

	app.post('/runreport', urlencodedParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var request = req.body.request;
		var report = JSON.parse(request);

		if (report.id == 'assetreport') {
			AssetReport(res, shopId)
		} else if (report.id == 'dailytasks') {
			DailyTasks(res, shopId, report.start, report.end)
		} else if (report.id == 'feedback') {
			FeedbackReport(res, shopId, report.start, report.end)
		} else if (report.id == 'labels') {
			LabelsReport(res, shopId)
		} else if (report.id == 'customlabel') {
			CustomLabelsReport(res, report.name, report.description, report.price, report.specials);
		} else {
			res.send('<html><body>Report function not found: ' + report.id + '</body></html>');
		}
	});
};