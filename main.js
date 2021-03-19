var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var mainPage = fs.readFileSync(__dirname + "/webpage/main.html", "utf8");

module.exports = function(app){
	app.get('/', urlencodedParser, function(req, res) {
		var webpage = mainPage;
	
		res.send(webpage);
	});	

	app.post('/', urlencodedParser, function(req, res) {
		var shopId = req.body.shopId;
		var pass = req.body.pass;

		var webpage = mainPage;

		//if invalid, don't set shopId and pass
		webpage = common.replaceAll(webpage, '-1234567890121212', shopId);
		webpage = common.replaceAll(webpage, '!!%PASS%!!', pass);
	
		res.send(webpage);
	});	
	
	app.post('/getemployees', urlencodedParser, function(req, res) {
		//var shopId = req.body.shopId;
		var shopId = 1;
		var pass = req.body.pass;
		
		var sql = "SELECT id, name from espresso.employee where shopid = $1;"

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
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

	app.post('/getemployeedetails', jsonParser, function(req, res) {
		var employeeId = req.body.employeeId;
		var shopId = 1;
		var dateFrom = dateHelper.getDate() + ' 00:00:00' ;
		var dateTo = dateHelper.getDate() + ' 23:59:59';

		
		var sqlEmployeeDetails = "SELECT id, name, contact from espresso.employee where id = $1 and shopid = $2 limit 1;";

		var sqlStartTime = "SELECT employeeid, starttime, finishtime from espresso.start_finish where employeeid = $1";
		sqlStartTime += " and starttime >= $2 and starttime <= $3 order by starttime desc limit 1;";
		
		var sqlBreaks = "select time, breaktype from espresso.break where employeeid = $1 and time >= $2 and time <= $3;";

		console.log(dateFrom);
		console.log(dateTo);
		console.log(sqlStartTime);

		pool.connect(function(err, connection, done) {
			connection.query(sqlEmployeeDetails, [employeeId, shopId], function(err, employeeResult) {
				done();

				var employee = {};

				if (employeeResult && employeeResult.rowCount == 1) {
					employee = {
						id: employeeResult.rows[0].id,
						name: employeeResult.rows[0].name,
						contact: employeeResult.rows[0].contact,
						starttime: '',
						finishtime: '',
						breaks: []
					};
				}


				pool.connect(function(err, connection, done) {
					connection.query(sqlStartTime, [employeeId, dateFrom, dateTo], function(err, startFinishResult) {
						done();

						if (startFinishResult && startFinishResult.rowCount == 1) {
							employee.starttime = startFinishResult.rows[0].starttime;
							employee.finishtime = startFinishResult.rows[0].finishtime;
						}

						pool.connect(function(err, connection, done) {
							connection.query(sqlBreaks, [employeeId, dateFrom, dateTo], function(err, breaksResult) {
								done();

								if (breaksResult && breaksResult.rowCount > 0) {
									for(var i = 0; i < breaksResult.rowCount; i++) {
										employees.breaks.push({ time: breaksResult.rows[i].time, type: breaksResult.rows[i].breaktype });
									}
								}

								res.send(employee);
							});
						});
					});
				});
			});
		});
	});

	app.post('/employeestart', jsonParser, function(req, res) {
		var shopId = 1; //req.body.shopId;
		//var pass = req.body.pass;
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;
		var startTime = req.body.startTime;
		
		var sql = "INSERT INTO espresso.start_finish (employeeid, starttime)";
		sql += " SELECT '" + employeeId + "', '" + startTime +"'";
		sql += " WHERE EXISTS ( SELECT id FROM espresso.employee WHERE id = '" + employeeId + "' and pin = '" + employeePin + "' );"

		console.log(sql);

		pool.connect(function(err, connection, done) {
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
		var shopId = 1; //req.body.shopId;
		//var pass = req.body.pass;
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;
		var date = req.body.date;
		var finishTime = req.body.finishTime;

		var sql = "INSERT INTO espresso.start_finish (employeeid, date, finishtime)";
		sql += " SELECT '" + employeeId + "', '" + date + "', '" + date + " " + finishTime + ":00'";
		sql += " WHERE EXISTS ( SELECT id FROM espresso.employee WHERE id = '" + employeeId + "' and pin = '" + employeePin + "' );"

		pool.connect(function(err, connection, done) {
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

	app.post('/employeebreak', urlencodedParser, function(req, res) {
		var shopId = req.body.shopId;
		var pass = req.body.pass;
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;
		var breakTime = req.body.breakTime;
		
		var result = { };
		
		res.send(employee);
	});
}