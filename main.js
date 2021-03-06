var pg = require('pg');
var common = require('./script/common.js');
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
		
		var d = new Date();
		var month = d.getMonth() + 1;
		var date = d.getFullYear() + '-' + month + '-' + d.getDate();

		//var sql = "SELECT id, name, contact from espresso.employee where id = $1 and shopid = $2 limit 1;"
		var sql = "SELECT espresso.employee.id, espresso.employee.name, espresso.employee.contact, espresso.start_finish.starttime from espresso.employee";
		sql += " left join espresso.start_finish on espresso.employee.id = espresso.start_finish.employeeid";
		sql += " where espresso.employee.id = $1 and espresso.employee.shopid = $2 and (espresso.start_finish.date = $3 or espresso.start_finish.date is null) limit 1;";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeId, shopId, date], function(err, result) {
				done();

				var employee = {};

				if (result && result.rowCount == 1) {
					employee = {
						id: result.rows[0].id,
						name: result.rows[0].name,
						contact: result.rows[0].contact,
						starttime: "Not yet",
						finishtime: "Not yet",
						breaks: []
					};
				}

				res.send(employee);
			});
		});
	});

	app.post('/employeestart', jsonParser, function(req, res) {
		var shopId = 1; //req.body.shopId;
		//var pass = req.body.pass;
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;


		//these dates are wrong.  need to be 24!
		var d = new Date();
		var month = d.getMonth() + 1;
		var date = d.getFullYear() + '-' + month + '-' + d.getDate();
		var startTime = d.getHours() + ':' + d.getMinutes();
		
		var sql = "INSERT INTO espresso.start_finish (employeeid, date, starttime)";
		sql += " SELECT '" + employeeId + "', '" + date + "', '" + date + " " + startTime + ":00'";
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

	app.post('/employeefinish', urlencodedParser, function(req, res) {
		var shopId = req.body.shopId;
		var pass = req.body.pass;
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;
		
		var result = { "result": "success" };
		
		res.send(employee);
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