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
		const datetime = new Date(req.body.date);
		const day = req.body.day;
		const month = req.body.month;
		const monthly = 9;

		let firstDayOfMonth = new Date(datetime.getFullYear(), datetime.getMonth(), 1);
		firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
		const firstDayOfMonthDb = dateHelper.formatDate(firstDayOfMonth);

		let firstDayOfNextMonth = new Date(datetime.getFullYear(), datetime.getMonth()+1, 1);
		firstDayOfNextMonth.setDate(firstDayOfNextMonth.getDate() + 7);  // this is probably invalid since it would be the future
		const firstDayOfNextMonthDb = dateHelper.formatDate(firstDayOfNextMonth);

		const days = [];

		for(let i = 1; i <= day; i++) {
			days.push(i);
		}
		if (day === 0) {
			for(let i = 0; i <= 6; i++) {
				days.push(i);
			}
		}

		let firstDateOfWeek = datetime;	
		firstDateOfWeek.setDate(datetime.getDate() - days.length);
		const firstDateOfWeekDb = dateHelper.formatDate(firstDateOfWeek);
		console.log(`first date of week ${firstDateOfWeekDb}`);

		let lastDateOfWeek = new Date(firstDateOfWeek);
		lastDateOfWeek.setDate(lastDateOfWeek.getDate() + 7);
		const lastDateOfWeekDb = dateHelper.formatDate(lastDateOfWeek);
		console.log(`last date of week ${lastDateOfWeekDb}`);

		let getTasksSql = "select id, name, description, recur, inputtype,";
		getTasksSql += ` exists(select taskid from espresso.recurring_task_complete where timestamp is not null and timestamp >= '${firstDateOfWeekDb}' and timestamp <= '${lastDateOfWeekDb}' ) as completed`
		getTasksSql += " from espresso.recurring_task";
		getTasksSql += ` where recur in (${monthly}, ${days.join(',')}, ${month}) and shopid = ${shopId}`;
		console.log('/getrecurringtasks ' + getTasksSql);

		pool.connect(function(err, connection, done) {
			connection.query(getTasksSql, [], function(err, result) {
				done();

				const tasks = [];
				const incomplete_tasks = [];
				const recurIds = [];

				// also, need to check what is valid!  for the current date
				// also create array of ids
				if (result && result.rowCount > 0) {
					for(let i = 0; i < result.rowCount; i++) {
						const recur = result.rows[i].recur;

						if (days.includes(recur) || recur === 9 || recur === month) {
							recurIds.push(recur);
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

		// next step
		// select * from espresso.recurring_task_complete where taskid in (67) and timestamp > '2026-03-23' and timestamp < '2026-05-07' and shopid = 1
				// const ids = [];
				// for(let i = 0; i < tasks.length; i++) {
				// 	ids.push(tasks[i].id);
				// }
				// let getCompletedTasks = "select taskid, timestamp";
				// getCompletedTasks += " from from espresso.recurring_task_complete ";
				// getCompletedTasks += ` where taskid in (${recurIds.join(',')}) and `;
				// getCompletedTasks += `timestamp >= ${firstDayOfMonthDb} and timestamp <= ${firstDayOfNextMonthDb} and `;
				// getCompletedTasks += `shopid = ${shopId}`;

				// pool.connect(function(err, connection, done) {
				// 	connection.query(getCompletedTasks, [shopId], function(err, employee_result) {
				// 		done();

				// 		if (result && result.rowCount > 0) {
				// 			for(let i = 0; i < result.rowCount; i++) {
				// 				const taskid =  result.rows[i].taskid;
				// 				const timestamp = result.rows[i].timestamp;
				// 				const taskIndex =  tasks.map(t => t.id) === taskid;
				// 				const task = tasks[taskIndex];
				// 				if (tasks[i].recur >= 0 && tasks[i].recur <= 6) {

				// 				// weekly
				// 				if (tasks[i].)
				// 				tasks.splice(index, 1);
				// 			} else if (tasks.recur === 9) {
				// 				// monthly
				// 			} else {
				// 				// a month!
				// 			}
				// 		}

						res.send(tasks);
					});
				});
			});
		// });
	// });

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