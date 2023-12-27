var fs = require("fs");
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var pool = new pg.Pool(common.postgresConfig());

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

module.exports = function(app) {
	var employeeListEditPage = fs.readFileSync(__dirname + "/../client/employeeedit.html", "utf8");
	app.use('/scripts/editemployees.js', express.static(__dirname + '/../client/editemployees.js'));

	app.get('/employeeedit', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(employeeListEditPage);
		} else {
			res.redirect(common.getLoginUrl('/employeeedit'));
		}
	});	

	app.post('/admin_getemployees', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var showEx = req.body.showEx;
		
		var filterEx = '';
		if (showEx == false) {
			filterEx = ' and ex = false';
		}

		var sql = 'SELECT id, name, contact, pin, ex, start_date, end_date, job_title, hourly_rate from espresso.employee where shopid = $1' + filterEx + ' order by name;'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employees = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({	id: result.rows[i].id,
											name: result.rows[i].name,
											contact: result.rows[i].contact,
											pin: result.rows[i].pin,
											ex: result.rows[i].ex,
											start_date: result.rows[i].start_date,
											end_date: result.rows[i].end_date,
											job_title: result.rows[i].job_title,
											hourly_rate: result.rows[i].hourly_rate,
										});
					}
				}
					
				res.send(employees);
			});
		});
	});

    app.post('/updateemployee_old', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeId = req.body.employeeId;
		var employeeName = req.body.employeeName;
		var employeeContact = req.body.employeeContact;
		var employeePin = req.body.employeePin;
		var employeeEx = req.body.employeeEx;

		var sql = "UPDATE espresso.employee SET name = $1, contact = $2, pin = $3, ex = $4 WHERE id = $5 and shopid = $6";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [employeeName, employeeContact, employeePin, employeeEx, employeeId, shopId], function(err, result) {
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

	app.post('/updateemployee', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
        
		var id = req.body.id;
		var name = req.body.name;
        var contact = req.body.contact;
		var pin = req.body.pin;
		var ex = req.body.ex;
		var startdate = req.body.startdate;
		var enddate = req.body.enddate;
		var jobtitle = req.body.jobtitle;
		var hourlyrate = req.body.hourlyrate;

        var values = [];

        if (id == 0) {
            console.log('insert');
			console.log(id);
            sql = "INSERT INTO espresso.employee (shopId, name, contact, pin, ex, startdate, enddate, jobtitle, hourlyrate)";
            sql += " values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id";
            values = [shopId, name, contact, pin, ex, startdate, enddate, jobtitle, hourlyrate];
        } else {
            console.log('update');
			console.log(id);
            sql = "UPDATE espresso.employee SET name = $3, contact = $4, pin = $5, ex = $6";
			sql += " startdate = $7, enddate = $8, jobtitle = $9, hourlyrate = $10";
            sql += " WHERE id = $2 and shopid = $1";
            values = [shopId, id, name, contact, pin, ex, startdate, enddate, jobtitle, hourlyrate];
        }

		pool.connect(function(err, connection, done) {
			connection.query(sql, values, function(err, result) {
				done();

				if (err) {
					console.error(err);
					var result = { "result": "fail", "error": err };
					res.send({ result: 'fail', "error": err });
				} else if (result && result.rowCount == 1) {
					if (id == 0) {
						id = result.rows[0].id;
					}
					res.send({ result: 'success', id: id });
				} else {
					res.send({ result: 'fail', "error": "unknown error ?!?" });
				}
			});
		});
	});

	app.post('/addemployee', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var employeeName = req.body.employeeName;
		var employeeContact = req.body.employeeContact;
		var employeePin = req.body.employeePin;
		var employeeEx = req.body.employeeEx;

		var sql = "insert into espresso.employee (shopid, name, contact, pin, ex) VALUES ($1, $2, $3, $4, $5);";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, employeeName, employeeContact, employeePin, employeeEx], function(err, result) {
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
};