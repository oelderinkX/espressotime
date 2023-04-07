var fs = require("fs");
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var pool = new pg.Pool(common.postgresConfig());

var assetsPage = fs.readFileSync(__dirname + "/../client/assets.html", "utf8");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {
	app.get('/assets', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(assetsPage);
		} else {
			res.redirect(common.getLoginUrl('/assets'));
		}
	});	

	app.post('/getemployeesforassets', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		
		var sql = 'select id,name from espresso.employee where shopid = $1 and ex=false or id in (select employeeid from espresso.asset where shopid = $1) order by id'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var employees = [];
				employees.push({id: 0, name: ''});

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						employees.push({	id: result.rows[i].id,
										name: result.rows[i].name,
						});
					}
				}
					
				res.send(employees);
			});
		});
	});

	app.post('/getassets', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		
		var sql = 'select id, name, cost, status, employeeid, notes, assigneddate, status_change_date from espresso.asset where shopid = $1 order by name'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var assets = [];
				assets.push({	id: 0,
								name: '(New Asset)',
								cost: '$0.00',
								status: 0,
								employeeid: 0,
								notes: '',
								assigneddate: new Date(),
								status_change_date: new Date()
				});

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						assets.push({	id: result.rows[i].id,
										name: result.rows[i].name,
										cost: result.rows[i].cost,
										status: result.rows[i].status,
										employeeid: result.rows[i].employeeid,
										notes: result.rows[i].notes,
										assigneddate: result.rows[i].assigneddate,
										status_change_date: result.rows[i].status_change_date,
						});
					}
				}
					
				res.send(assets);
			});
		});
	});

	app.post('/saveasset', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
		var name = req.body.name;
		var cost = req.body.cost;
		var status = req.body.status;
		var employeeid = req.body.employeeid;
		var notes = req.body.notes;
	
		var dateassigned = req.body.dateassigned;
		var statuschangedate = req.body.statuschangedate;

		if (id == 0) {
			var sql = 'insert into espresso.asset (shopid, name, cost, status, employeeid, notes, assigneddate, status_change_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) '
			pool.connect(function(err, connection, done) {
				connection.query(sql, [shopId, name, cost, status, employeeid, notes, dateassigned, statuschangedate], function(err, result) {
					done();
					res.send({success: true});
				});
			});
		} else {
			var sql = 'update espresso.asset set name=$1, cost=$2, status=$3, employeeid=$4, notes=$5, assigneddate=$6, status_change_date=$7 where id=$8 and shopId=$9';
			pool.connect(function(err, connection, done) {
				connection.query(sql, [name, cost, status, employeeid, notes, dateassigned, statuschangedate,id,shopId], function(err, result) {
					done();
					res.send({success: true});
				});
			});
		}
	});
}