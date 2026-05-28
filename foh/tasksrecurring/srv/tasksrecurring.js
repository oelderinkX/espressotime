var pg = require('pg');
var express = require('express');
var common = require('../../../common/srv/common.js');
var dateHelper = require('../../../common/srv/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var tasksRecurringPage = fs.readFileSync(__dirname + "/../client/tasksrecurring.html", "utf8");
	app.use('/scripts/tasksrecurring.js', express.static(__dirname + '/../client/tasksrecurring.js'));

	app.get('/tasksrecurring', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(tasksRecurringPage);
		} else {
			res.redirect(common.getLoginUrl('/tasksrecurring'));
		}
	});

	// 1 = Monday
	// 2 = Tuesday
	// 3 = Wednesday
	// 4 = Thursday
	// 5 = Friday
	// 6 = Saturday
	// 0 = Sunday
	// 9 = Monthly
	// 10 = January
	// 11 = February
	// 12 = March
	// 13 = April
	// 14 = May
	// 15 = June
	// 16 = July
	// 17 = August
	// 18 = September
	// 19 = October
	// 20 = November
	// 21 = December
	// -1 = Disabled
	app.post('/getrecurringtasks', jsonParser, function(req, res) {
		const shopId = common.getShopId(req.cookies['identifier']);
		const now = new Date(req.body.date);
		const day = req.body.day;
		const month = req.body.month;
		const monthly = 9;

		const days = [];

		for(let i = 1; i <= day; i++) {
			days.push(i);
		}
		if (day === 0) {
			for(let i = 0; i <= 6; i++) {
				days.push(i);
			}
		}

		const firstDateOfWeek = new Date(req.body.date);	
		firstDateOfWeek.setDate(now.getDate() - (days.length - 1));
		console.log(`first date of week ${firstDateOfWeek}`);
		const firstDateOfWeekDb = dateHelper.getDbFormat2(firstDateOfWeek);
		console.log(`first date of week db ${firstDateOfWeekDb}`);

		const lastDateOfWeek = new Date(firstDateOfWeek);
		lastDateOfWeek.setDate(firstDateOfWeek.getDate() + 6);
		console.log(`last date of week db ${lastDateOfWeek}`);
		const lastDateOfWeekDb = dateHelper.getDbFormat2(lastDateOfWeek);
		console.log(`last date of week db ${lastDateOfWeekDb}`);

		let getTasksWeekSql = "select id, name, description, recur, inputtype,";
		getTasksWeekSql += ` exists(select 1 from espresso.recurring_task_complete complete where task.id = complete.taskid and timestamp is not null and timestamp >= '${firstDateOfWeekDb}' and timestamp <= '${lastDateOfWeekDb}' ) as completed`
		getTasksWeekSql += " from espresso.recurring_task task";
		getTasksWeekSql += ` where recur in (${days.join(',')}) and shopid = ${shopId}`;

		console.log('/getrecurringtasks_week ' + getTasksWeekSql);

		pool.connect(function(err, connection, done) {
			connection.query(getTasksWeekSql, [], function(err, result) {
				done();

				const tasks = [];

				if (result && result.rowCount > 0) {
					for(let i = 0; i < result.rowCount; i++) {
						const recur = result.rows[i].recur;

						if (days.includes(recur)) {
							tasks.push({id: result.rows[i].id,
										name: result.rows[i].name,
										description: result.rows[i].description,
										recur: result.rows[i].recur,
										inputtype: result.rows[i].inputtype,
										completed: result.rows[i].completed
							});
						}
					}
				}

				let firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
				firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
				const firstDayOfMonthDb = dateHelper.getDbFormat2(firstDayOfMonth);

				let firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth()+1, 1);
				firstDayOfNextMonth.setDate(firstDayOfNextMonth.getDate() + 7);  // this is probably invalid since it would be the future
				const firstDayOfNextMonthDb = dateHelper.getDbFormat2(firstDayOfNextMonth);

				let getTasksMonthSql = "select id, name, description, recur, inputtype,";
				getTasksMonthSql += ` exists(select 1 from espresso.recurring_task_complete complete where task.id = complete.taskid and timestamp is not null and timestamp >= '${firstDayOfMonthDb}' and timestamp < '${firstDayOfNextMonthDb}' ) as completed`
				getTasksMonthSql += " from espresso.recurring_task task";
				getTasksMonthSql += ` where recur in (${monthly}, ${month}) and shopid = ${shopId}`;

				console.log('/getrecurringtasks_month ' + getTasksMonthSql);

				pool.connect(function(err, connection, done) {
					connection.query(getTasksMonthSql, [shopId], function(err, employee_result) {
						done();

						if (result && result.rowCount > 0) {
							for(let i = 0; i < result.rowCount; i++) {
								const recur = result.rows[i].recur;

								if (recur === 9 || recur === month) {
									tasks.push({id: result.rows[i].id,
												name: result.rows[i].name,
												description: result.rows[i].description,
												recur: result.rows[i].recur,
												inputtype: result.rows[i].inputtype,
												completed: result.rows[i].completed
									});
								}
							}
						}

						res.send(tasks);
					});
				});
			});
		});
	});

	app.post('/gettaskrecurringemployees', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var date = req.body.date;
		
		var sql = "select distinct(espresso.employee.id) as id, espresso.employee.name as name from espresso.start_finish ";
		sql += "left join espresso.employee on espresso.employee.id = espresso.start_finish.employeeid ";
		sql += "where espresso.employee.shopid = $1 and espresso.start_finish.starttime >= $2 order by espresso.employee.name";

		console.log('/gettaskrecurringemployees ' + sql);

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, date], function(err, result) {
				done();

				var employees = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({ id: result.rows[i].id, name: result.rows[i].name });
					}
				}
					
				res.send(employees);
			});
		});
	});

	app.post('/completerecurringtask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var taskid = req.body.taskid;
		var timestamp = req.body.timestamp;
		var by = req.body.by;
		var inputvalue = req.body.value;
		var notes = req.body.notes;

		var sql = "INSERT INTO espresso.recurring_task_complete (taskid, timestamp, by, shopid, input, notes) VALUES ($1,$2,$3,$4,$5,$6);";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [taskid, timestamp, by, shopId, inputvalue, notes], function(err, result) {
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