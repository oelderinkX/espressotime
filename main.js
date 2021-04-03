var pg = require('pg');
var common = require('./script/common.js');
var dateHelper = require('./script/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

var loginPage = fs.readFileSync(__dirname + "/webpage/login.html", "utf8");
var mainPage = fs.readFileSync(__dirname + "/webpage/main.html", "utf8");

module.exports = function(app){
	app.get('/', urlencodedParser, function(req, res) {
		var webpage = loginPage;
	
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			webpage = mainPage;
		} else {
			webpage = common.replaceAll(webpage, '!%REDIRECT_URL%!', '/');
		}

		res.send(webpage);
	});	

	app.post('/login', jsonParser, function(req, res) {
		var name = req.body.name;
		var pass = req.body.password;
		
		var sql = "SELECT id, name from espresso.shop where name = $1 and password = $2"

		pool.connect(function(err, connection, done) {
			connection.query(sql, [name, pass], function(err, result) {
				done();

				var login = { success: false, reason: "unknown error" };

				if (result && result.rowCount == 1) {
					var encode = Buffer.from(result.rows[0].name + ';12121976;' + result.rows[0].id).toString('base64');
					login = { success: true, identifier: encode };
				} else if (result && result.rowCount > 1 ) {
					login = { success: false, reason: "multiple shops found, call administrator" };
				} else {
					login = { success: false, reason: "shop name or password incorrect" };
				}
					
				res.send(login);
			});
		});
	});
	
	app.post('/getemployees', urlencodedParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		
		var sql = "SELECT id, name from espresso.employee where shopid = $1 and ex = false order by name;"

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employees = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({	id: result.rows[i].id,
											name: result.rows[i].name
										});
					}
				}
					
				res.send(employees);
			});
		});
	});

	app.post('/getemployeedetails', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var dateFrom = req.body.date + ' 00:00:00' ;
		var dateTo = req.body.date + ' 23:59:59';
		
		var sqlEmployeeDetails = "SELECT id, name, contact from espresso.employee where id = $1 and shopid = $2 limit 1;";

		var sqlStartTime = "SELECT employeeid, starttime, finishtime from espresso.start_finish where employeeid = $1";
		sqlStartTime += " and starttime >= $2 and starttime <= $3 order by finishtime desc limit 1;";
		
		var sqlBreaks = "select starttime, finishtime, breaktype from espresso.break where employeeid = $1 and starttime >= $2 and starttime <= $3;";

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
										employee.breaks.push({ startTime: breaksResult.rows[i].starttime, finishTime: breaksResult.rows[i].finishtime, breakType: breaksResult.rows[i].breaktype });
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
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;
		var startTime = req.body.startTime;
		
		var sql = "INSERT INTO espresso.start_finish (employeeid, starttime)";
		sql += " SELECT '" + employeeId + "', '" + startTime +"'";
		sql += " WHERE EXISTS ( SELECT id FROM espresso.employee WHERE id = '" + employeeId + "' and pin = '" + employeePin + "' ) "
		sql += " and NOT EXISTS (select id from espresso.start_finish where employeeid = " + employeeId + "";
		sql += " and starttime > '" + startTime + "'::timestamp::date and finishtime is null)"

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
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;
		var date = req.body.date;
		var finishTime = req.body.finishTime;

		var dateFrom = date + ' 00:00:00' ;
		var dateTo = date + ' 23:59:59';


		var sql = "UPDATE espresso.start_finish SET finishtime = '" + finishTime + "' WHERE id =";
		sql += " (SELECT id FROM espresso.start_finish WHERE employeeid = '" + employeeId + "' and starttime >= '" + dateFrom + "' and starttime <= '" + dateTo + "'";
		sql += " and finishtime is null ORDER BY starttime DESC LIMIT 1);"

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

	app.post('/employeebreakstart', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var startTime = req.body.startTime;
		var breakType = req.body.breakType;
		
		var sql = "INSERT INTO espresso.break (employeeid, starttime, breakType)";
		sql += " SELECT '" + employeeId + "', '" + startTime + "', " + "'" + breakType + "'";
		sql += " WHERE EXISTS ( SELECT id FROM espresso.employee WHERE id = '" + employeeId + "');"

		pool.connect(function(err, connection, done) {
			connection.query(sql, function(err, result) {
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

	app.post('/employeebreakfinish', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var finishTime = req.body.finishTime;
		var breakType = req.body.breakType;

		var sql = "UPDATE espresso.break SET finishtime = '" + finishTime + "' WHERE id =";
		sql += " (SELECT id FROM espresso.break WHERE employeeid = '" + employeeId + "' and breakType = '" + breakType + "' and starttime <= '" + finishTime + "'";
		sql += " ORDER BY starttime DESC LIMIT 1);"

		pool.connect(function(err, connection, done) {
			connection.query(sql, function(err, result) {
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