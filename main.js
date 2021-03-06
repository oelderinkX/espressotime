var pg = require('pg');
var common = require('./script/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//var pool = new pg.Pool(common.postgresConfig());

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

		var employees = [ { "name": "Bob" }, { "name": "Slob" } ];
		

	});

	app.post('/getemployeedetails', urlencodedParser, function(req, res) {
		var shopId = req.body.shopId;
		var pass = req.body.pass;
		var employeeId = req.body.employeeId;
		
		var employee = { "id": "123", "name": "Bob", "starttime": "123", "finishtime": "343", "breaks": [] };
		
		res.send(employee);
	});

	app.post('/employeestart', urlencodedParser, function(req, res) {
		var shopId = req.body.shopId;
		var pass = req.body.pass;
		var employeeId = req.body.employeeId;
		var employeePin = req.body.employeePin;
		
		var result = { "result": "success" };
		
		res.send(result);
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