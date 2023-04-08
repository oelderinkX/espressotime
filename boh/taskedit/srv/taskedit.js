var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var pool = new pg.Pool(common.postgresConfig());

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

module.exports = function(app) {
	var taskEditPage = fs.readFileSync(__dirname + "/../client/taskedit.html", "utf8");
	app.use('/scripts/taskedit.js', express.static(__dirname + '/../client/taskedit.js'));

	app.get('/taskedit', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(taskEditPage);
		} else {
			res.redirect(common.getLoginUrl('/taskedit'));
		}
	});	

	app.post('/admin_gettasks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var showOld = req.body.showOld;
		
		var filterOld = '';
		if (showOld == false) {
			filterOld = " and starttime <> '00:00:00'";
		}

		var sql = 'select id, name, inputtype, description, starttime from espresso.task where shopid = $1' + filterOld +' order by starttime';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
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

	app.post('/updatetask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
		var name = req.body.name;
		var description = req.body.description;
		var starttime = req.body.starttime;
		var inputtype = req.body.inputtype;

		var sql = "UPDATE espresso.task SET name=$1, inputtype=$2, description=$3, starttime=$4 WHERE id=$5 and shopid=$6";
		console.log(sql);

		pool.connect(function(err, connection, done) {
			connection.query(sql, [name, inputtype, description, starttime, id, shopId], function(err, result) {
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

	app.post('/addtask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var name = req.body.name;
		var description = req.body.description;
		var starttime = req.body.starttime;
		var inputtype = req.body.inputtype;

		var sql = "INSERT INTO espresso.task (shopid, name, inputtype, description, starttime) VALUES ($1, $2, $3, $4, $5)";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, name, inputtype, description, starttime], function(err, result) {
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