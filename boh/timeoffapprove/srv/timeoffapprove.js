var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var timeOffsPage = fs.readFileSync(__dirname + "/../client/timeoffapprove.html", "utf8");
	
	app.use('/scripts/timeoffapprove.js', express.static(__dirname + '/../client/timeoffapprove.js'));

	app.get('/timeoffapprove', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
				res.send(timeOffsPage);
		} else {
			res.redirect(common.getLoginUrl('/timeoffapprove'));
		}
	});	

	app.post('/gettimeoffs', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		
		var sql = 'select name, id, ex from espresso.employee where shopid = $1'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employee = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employee.push({ id: result.rows[i].id,
									 name: result.rows[i].name,
                                     ex: result.rows[i].ex
						});
					}
				}

                var sql = 'select id, employee_id, start_date, end_date, role, paid, reason, approved, unapproved_reason '
                sql += 'from espresso.timeoff ';
                sql += 'where employee_id in (select id from espresso.employee where shopid = $1)';

                pool.connect(function(err, connection, done) {
                    connection.query(sql, [shopId], function(err, result) {
                        done();

                        var timeoff = [];

                        if (result && result.rowCount > 0) {
                            for(var i = 0; i < result.rowCount; i++) {
                                timeoff.push({ id: result.rows[i].id,
                                    employee_id: result.rows[i].employee_id,
                                    start_date: result.rows[i].start_date,
                                    end_date: result.rows[i].end_date,
                                    role: result.rows[i].role,
                                    paid: result.rows[i].paid,
                                    reason: result.rows[i].reason,
                                    approved: result.rows[i].approved,
                                    unapproved_reason: result.rows[i].unapproved_reason
                                });
                            }
                        }

                        var timeoffs = {
                            employee: employee,
                            timeoff: timeoff
                        };
        
                        res.send(timeoffs);       
                    })
                });
			});
		});
	});

    app.post('/updateapprove', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
        var id = req.body.id;
        var employeeid = req.body.employeeid;
        var approved = req.body.approved;

		var sql = 'update espresso.timeoff set approved = $1 where id = $2 and employee_id = $3';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [approved, id, employeeid], function(err, result) {
				done();

                if (err) {
                    console.log(err);
                }
       
                res.send({});
			});
		});
	});
}