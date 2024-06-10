var pg = require('pg');
var express = require('express');
var common = require('../../common/srv/common.js');
var dateHelper = require('../../common/srv/dateHelper.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var employeeContactsPage = fs.readFileSync(__dirname + "/../client/employee_contacts.html", "utf8");

	app.get('/employee_contacts', urlencodedParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);
		
		if (employeeid && employeeid != -1) {
			res.send(employeeContactsPage);
		} else {
			res.redirect(common.getLoginUrl('/employee_contacts'));
		}
	});

	app.post('/employee_name_contact', jsonParser, function(req, res) {
		var employeeid = common.getEmployeeId(req.cookies['identifier']);

		var namephone = [];

		sql = "select name, contact from espresso.employee ";
		sql += "where shopid = (select shopid from espresso.employee where id = $1) and ex = false order by name";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeid], function(err, result) {
				done();

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						namephone.push({
							name: result.rows[i].name,
							contact: result.rows[i].contact
						});
					}
				}
					
				res.send(namephone);
			});
		});
	});
}