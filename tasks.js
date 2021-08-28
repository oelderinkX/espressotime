var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var loginPage = fs.readFileSync(__dirname + "/webpage/login.html", "utf8");
var tasksPage = fs.readFileSync(__dirname + "/webpage/tasks.html", "utf8");
var tasksMobilePage = fs.readFileSync(__dirname + "/webpage/tasksmobile.html", "utf8");

module.exports = function(app){
	app.get('/tasks', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = tasksPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/tasks');
		}

		res.send(webpage);
	});

	app.get('/tasksmobile', urlencodedParser, function(req, res) {
		var webpage = loginPage;

		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = tasksMobilePage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/tasksmobile');
		}

		res.send(webpage);
	});	

	app.post('/gettasks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var dayStart = req.body.date + ' 00:00:00';
		var dayEnd = req.body.date + ' 23:59:59';
		var time = req.body.time;

		var sql = "select id, name, inputtype, description, starttime from espresso.task";
		sql += " where shopid = $1 and starttime <= $2 and id not in (select taskid from espresso.task_complete where timestamp > $3 and timestamp <= $4)";
		sql += " order by starttime;";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, time, dayStart, dayEnd], function(err, result) {
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

	app.post('/getalltasks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var dayStart = req.body.date + ' 00:00:00';
		var dayEnd = req.body.date + ' 23:59:59';

		var sql = "select name, starttime,";
		sql += " exists(select taskid from espresso.task_complete where timestamp > $1 and timestamp <= $2) as completed";
		sql += " from espresso.task";
		sql += " where shopid = $3";
		sql += " order by starttime;";

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

	app.post('/gettaskemployees', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var date = req.body.date;
		
		var sql = "select id, name from espresso.employee where shopid = $1 and ex = false";

		/*var sql = "select distinct(espresso.employee.id) as id, espresso.employee.name as name from espresso.start_finish ";
		sql += "left join espresso.employee on espresso.employee.id = espresso.start_finish.employeeid ";
		sql += "where espresso.employee.shopid = $1 and espresso.start_finish.starttime >= $2 order by espresso.employee.name";*/

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
			//connection.query(sql, [shopId, date], function(err, result) {
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

	app.post('/completetask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var taskid = req.body.taskid;
		var timestamp = req.body.timestamp;
		var by = req.body.by;
		var value = req.body.value;
		var notes = req.body.notes;

		var sql = "INSERT INTO espresso.task_complete (taskid, timestamp, by, shopid, input, notes) VALUES ($1,$2,$3,$4,$5,$6);";

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