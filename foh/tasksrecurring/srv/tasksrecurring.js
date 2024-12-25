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

	app.post('/getalltasksrecurring', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var dayStart = req.body.date + ' 00:00:00';
		var dayEnd = req.body.date + ' 23:59:59';

		var sql = "select name, starttime,";
		sql += " exists(select taskid from espresso.recurring_task_complete where timestamp > $1 and timestamp <= $2 and taskid = espresso.task.id) as completed";
		sql += " from espresso.task";
		sql += " where shopid = $3";
		sql += " and starttime <> '00:00:00'";
		sql += " order by starttime;";

		console.log('/getalltasksrecurring ' + sql);

		pool.connect(function(err, connection, done) {
			connection.query(sql, [dayStart, dayEnd, shopId], function(err, result) {
				done();

				var tasks = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						tasks.push({name: result.rows[i].name,
									starttime: result.rows[i].starttime,
									completed: result.rows[i].completed
						});
					}
				}
					
				res.send(tasks);
			});
		});
	});

	app.post('/getcurrentrecurringtasks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var date = new Date();
		var day = date.getDay();

		var month = date.getMonth();
		var monthly = 1;

		var sql = "select id, name from espresso.recurring_task_complete";
		sql += "  where starttime <> '00:00:00' and shopid = $1";
		sql += " order by starttime";

		console.log('/getcurrentrecurringtasks ' + sql);

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var tasks = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						tasks.push({	name: result.rows[i].name,
										id: result.rows[i].id
						});
					}
				}
					
				res.send(tasks);
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
		var value = req.body.value;
		var notes = req.body.notes;

		var sql = "INSERT INTO espresso.recurring_task_complete (taskid, timestamp, by, shopid, input, notes) VALUES ($1,$2,$3,$4,$5,$6);";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [taskid, timestamp, by, shopId, value, notes], function(err, result) {
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